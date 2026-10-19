'use strict';

// Runs the real HTTP routes and installed mysql2 driver against a disposable
// loopback MySQL-protocol fixture. Never reads .env or contacts production.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const { once } = require('node:events');
const appRequire = createRequire(path.join(__dirname, '../server.js'));
const mysql = appRequire('mysql2');
const express = appRequire('express');
const source = fs.readFileSync(process.env.GUESTBOOK_TEST_SOURCE || path.join(__dirname, '../server.js'), 'utf8');

async function fixture(t, initiallyUnavailable = false) {
    const dbServer = mysql.createServer();
    const sockets = new Set();
    const state = { unavailable: initiallyUnavailable, dropQuery: false, prepares: 0, connections: 0 };
    dbServer.on('connection', connection => {
        state.connections++;
        sockets.add(connection.stream);
        connection.stream.once('close', () => sockets.delete(connection.stream));
        connection.on('error', err => { if (process.env.DEBUG_FIXTURE) console.error('fixture:', err); });
        if (state.unavailable) return connection.stream.destroy();
        connection.serverHandshake({
            protocolVersion: 10, serverVersion: '8.0.0-test', connectionId: state.connections,
            statusFlags: 2, characterSet: 45, capabilityFlags: 0x00088201,
            authCallback(_data, done) { done(null); connection._resetSequenceId(); }
        });
        connection.on('packet', () => connection._resetSequenceId());
        connection.on('query', sql => {
            if (process.env.DEBUG_FIXTURE) console.log('query:', sql);
            if (state.dropQuery) {
                state.dropQuery = false;
                return connection.stream.destroy();
            }
            connection.writeColumns([{ catalog: 'def', schema: 'fixture', table: 'entries', orgTable: 'entries',
                name: 'message', orgName: 'message', columnType: 253, characterSet: 45, columnLength: 255, flags: 0, decimals: 0 }]);
            connection.writeTextRow(['Test entry <3']);
            connection.writeEof();
        });
        connection.on('stmt_prepare', sql => {
            if (process.env.DEBUG_FIXTURE) console.log('prepare:', sql);
            state.prepares++;
            connection.stream.destroy();
        });
        connection.on('quit', () => connection.stream.end());
    });
    dbServer.listen(0, '127.0.0.1');
    await once(dbServer._server, 'listening');
    let db;
    let httpServer;
    const errors = [];
    const makeConnection = factory => options => {
        db = factory({ ...options, host: '127.0.0.1', port: dbServer._server.address().port,
            user: 'fixture', password: '', database: 'fixture', connectTimeout: 500 });
        return db;
    };
    const testExpress = () => {
        const app = express();
        app.listen = () => {
            httpServer = require('node:http').createServer(app).listen(0, '127.0.0.1');
            return httpServer;
        };
        return app;
    };
    testExpress.static = express.static;
    vm.runInNewContext(source, {
        require(name) {
            if (name === 'dotenv') return { config() {} };
            if (name === 'express') return testExpress;
            if (name === 'mysql2') return {
                createPool: makeConnection(mysql.createPool),
                createConnection: makeConnection(mysql.createConnection)
            };
            return appRequire(name);
        },
        process: { env: {} },
        console: { log() {}, error(...args) { errors.push(args); if (process.env.DEBUG_FIXTURE) console.error(...args); } }
    }, { filename: 'server.js' });
    t.after(async () => {
        httpServer.closeAllConnections();
        await new Promise(resolve => httpServer.close(resolve));
        await new Promise(resolve => db.end(resolve));
        for (const socket of sockets) socket.destroy();
        await new Promise(resolve => dbServer.close(resolve));
    });
    if (!httpServer.listening) await once(httpServer, 'listening');
    const url = `http://127.0.0.1:${httpServer.address().port}`;
    return { state, errors, sockets, db, get: (route = '/entries') => fetch(`${url}${route}`, { signal: AbortSignal.timeout(2000) }),
        post: (body, route = '/submit') => fetch(`${url}${route}`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body), signal: AbortSignal.timeout(2000) }) };
}

async function drainClosedConnections(f) {
    for (const socket of f.sockets) socket.destroy();
    // Wait on an observed condition, not a fixed sleep, for FIN processing.
    for (let i = 0; i < 100; i++) {
        if (f.db._allConnections ? f.db._allConnections.length === 0 : f.db._protocolError || f.db._fatalError) return;
        await new Promise(resolve => setTimeout(resolve, 5));
    }
    assert.fail('closed database sockets were not processed');
}

test('entries recover after the database closes an idle connection', { timeout: 5000 }, async t => {
    const f = await fixture(t);
    assert.equal((await f.get()).status, 200);
    await drainClosedConnections(f);
    const response = await f.get();
    assert.equal(response.status, 200);
    assert.equal((await response.json())[0].message, 'Test entry <3');
    assert.ok(f.state.connections >= 2);
});

test('requests recover after an outage without restarting HTTP', { timeout: 5000 }, async t => {
    const f = await fixture(t);
    assert.equal((await f.get()).status, 200);
    await drainClosedConnections(f);
    f.state.unavailable = true;
    assert.equal((await f.get()).status, 500);
    f.state.unavailable = false;
    assert.equal((await f.get()).status, 200);
});

test('database unavailable at app startup is recoverable', { timeout: 5000 }, async t => {
    const f = await fixture(t, true);
    assert.equal((await f.get()).status, 500);
    f.state.unavailable = false;
    assert.equal((await f.get()).status, 200);
});

test('a dropped in-flight read does not poison later requests', { timeout: 5000 }, async t => {
    const f = await fixture(t);
    f.state.dropQuery = true;
    assert.equal((await f.get()).status, 500);
    assert.equal((await f.get()).status, 200);
});

test('failed writes are not automatically replayed and later requests work', { timeout: 5000 }, async t => {
    const f = await fixture(t);
    assert.equal((await f.post({ screenname: 'fixture', message: 'hello <3' })).status, 500);
    assert.equal(f.state.prepares, 1);
    assert.equal((await f.get()).status, 200);
    assert.equal((await f.post({ screenname: '', message: 'invalid' })).status, 400);
    assert.equal(f.state.prepares, 1);
});

test('a dropped comment read does not poison later requests', { timeout: 5000 }, async t => {
    const f = await fixture(t);
    assert.equal((await f.get('/comments/test-post')).status, 500);
    assert.equal((await f.get()).status, 200);
});

test('failed comment writes are not replayed and later requests work', { timeout: 5000 }, async t => {
    const f = await fixture(t);
    assert.equal((await f.post({ postSlug: 'test-post', screenname: 'fixture', message: 'hello' }, '/comments')).status, 500);
    assert.equal(f.state.prepares, 1);
    assert.equal((await f.get()).status, 200);
});

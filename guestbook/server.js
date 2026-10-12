require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors'); // I HATE YOU CORS YOU WASTED SO MUCH OF MY TIME

const app = express();

app.use(cors({
    origin: ['http://ethxn.xyz', 'https://ethxn.xyz'],
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use(bodyParser.json({ limit: '10kb' }));
app.use(express.static('public'));

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: 'utf8mb4'
});

db.connect(err => {
    if (err) {
        throw err;
    }
    console.log('Connected to MySQL');
});

// GET; retrieve all guestbook entries
app.get('/entries', (req, res) => {
    db.query('SELECT * FROM entries ORDER BY created_at DESC', (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).send('Error retrieving entries');
        }
        res.json(results);
    });
});

// POST; submit new guestbook entry
app.post('/submit', (req, res) => {
    const { screenname, website, message } = req.body || {};
    
    // validate required fields
    if (typeof screenname !== 'string' || screenname.trim() === '' ||
        typeof message !== 'string' || message.trim() === '') {
        return res.status(400).send('Screenname and message are required');
    }

    if (website !== undefined && website !== null && typeof website !== 'string') {
        return res.status(400).send('Invalid URL');
    }
    const websiteValue = website || null;

    // limit character length to prevent abuse
    if (screenname.length > 50 || message.length > 255 ||
        (websiteValue !== null && websiteValue.length > 255)) {
        return res.status(400).send('Input too long');
    }

    // validate website URL
    const validURL = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-]*)*$/;
    if (websiteValue && !validURL.test(websiteValue)) {
        return res.status(400).send('Invalid URL');
    }

    // use a prepared statement to prevent SQL injection
    const query = "INSERT INTO entries (screenname, website, message) VALUES (?, ?, ?)";
    const values = [screenname, websiteValue, message];

    db.execute(query, values, (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).send('Error saving entry');
        }
        res.status(200).send('Entry saved');
    });
});

// GET; retrieve comments for a blog post
app.get('/comments/:postSlug', (req, res) => {
    const postSlug = req.params.postSlug;
    if (!postSlug || postSlug.length > 255) {
        return res.status(400).send('Invalid post');
    }

    db.execute(
        'SELECT id, screenname, message, created_at FROM comments WHERE post_slug = ? ORDER BY created_at ASC, id ASC',
        [postSlug],
        (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send('Error retrieving comments');
            }
            res.json(results);
        }
    );
});

// POST; publish a comment immediately
app.post('/comments', (req, res) => {
    const { postSlug, screenname, message } = req.body || {};

    if (typeof postSlug !== 'string' || postSlug.trim() === '' ||
        typeof screenname !== 'string' || screenname.trim() === '' ||
        typeof message !== 'string' || message.trim() === '') {
        return res.status(400).send('Post, name, and comment are required');
    }

    if (postSlug.length > 255 || screenname.trim().length > 50 || message.trim().length > 1000) {
        return res.status(400).send('Input too long');
    }

    db.execute(
        'INSERT INTO comments (post_slug, screenname, message) VALUES (?, ?, ?)',
        [postSlug.trim(), screenname.trim(), message.trim()],
        (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send('Error saving comment');
            }
            res.status(201).json({ id: result.insertId });
        }
    );
});

app.listen(3000, '0.0.0.0', () => {
    console.log("Server running at http://0.0.0.0:3000");
});

// debug
app._router.stack.forEach(function(r){
    if (r.route && r.route.path) {
        console.log(r.route.path)
    }
});

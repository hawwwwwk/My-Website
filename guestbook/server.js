require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2'); // using mysql2... i guess
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // server static !

// using env for "security"
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        throw err;
    }
    console.log('Connected to MySQL');
});

// endpoint to get entries
app.get('/entries', (req, res) => {
    db.query('SELECT * FROM entries ORDER BY created_at DESC', (err, results) => {
        if (err) {
            console.error('Error retrieving entries:', err);
            return res.status(500).send('Error retrieving entries');
        }
        res.json(results);
    });
});

// endpoint to submit new entry
app.post('/submit', (req, res) => {
    const { screenname, website, message } = req.body;
    if (!screenname || !message) {
        return res.status(400).send('Screenname and message are required');
    }

    const entry = { screenname, website, message };
    db.query('INSERT INTO entries SET ?', entry, (err, result) => {
        if (err) {
            console.error('Error saving entry:', err);
            return res.status(500).send('Error saving entry');
        }
        res.status(200).send('Entry saved');
    });
});

// start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// i don't like js
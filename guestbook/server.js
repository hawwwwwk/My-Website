require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors'); // I HATE YOU CORS YOU WASTED SO MUCH OF MY TIME

const app = express();

app.use(cors({
    origin: 'http://ethxn.xyz',
    methods: 'GET,POST', 
    credentials: true 
}));

app.use(bodyParser.json());
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

app.listen(3000, '0.0.0.0', () => {
    console.log("Server running at http://0.0.0.0:3000");
});

// debug
app._router.stack.forEach(function(r){
    if (r.route && r.route.path) {
        console.log(r.route.path)
    }
});

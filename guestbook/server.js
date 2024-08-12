const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors'); // Import the cors package

const app = express();
const port = 3000;

// Configure CORS to allow requests from your domain
app.use(cors({
    origin: 'http://ethxn.xyz', // Allow only your domain
    methods: 'GET,POST', // Allowed methods
    credentials: true // If you're using credentials (cookies, etc.)
}));

app.use(bodyParser.json());
app.use(express.static('public'));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'guestbook_user',
    password: 'GUESTBOOK124!?vault',
    database: 'guestbook'
});

db.connect(err => {
    if (err) {
        throw err;
    }
    console.log('Connected to MySQL');
});

app.get('/entries', (req, res) => {
    db.query('SELECT * FROM entries ORDER BY created_at DESC', (err, results) => {
        if (err) {
            return res.status(500).send('Error retrieving entries');
        }
        res.json(results);
    });
});

app.post('/submit', (req, res) => {
    const { screenname, website, message } = req.body;
    if (!screenname || !message) {
        return res.status(400).send('Screenname and message are required');
    }

    const entry = { screenname, website, message };
    db.query('INSERT INTO entries SET ?', entry, (err, result) => {
        if (err) {
            return res.status(500).send('Error saving entry');
        }
        res.status(200).send('Entry saved');
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

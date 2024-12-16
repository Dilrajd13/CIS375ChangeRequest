const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

const db = new sqlite3.Database('./db.sqlite', (err) => {
    if (err) console.error(err.message);
    console.log('Connected to SQLite database.');

    db.run(`CREATE TABLE IF NOT EXISTS requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_name TEXT NOT NULL,
        change_name TEXT NOT NULL,
        date TEXT NOT NULL,
        change_no TEXT NOT NULL,
        location TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        job_title TEXT NOT NULL,
        request_category TEXT NOT NULL,
        priority TEXT NOT NULL,
        description TEXT NOT NULL,
        reason TEXT NOT NULL,
        impact TEXT NOT NULL,
        risks TEXT NOT NULL,
        tools TEXT NOT NULL,
        attachment TEXT
    )`);
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// Routes
app.post('/submit', upload.single('myfile'), (req, res) => {
    const {
        'Project Name': project_name,
        'Change Name': change_name,
        Date: date,
        'Change No.': change_no,
        Location: location,
        'First Name': first_name,
        'Last name': last_name,
        Email: email,
        'Phone Number': phone,
        'Job Title': job_title,
        'Request Category': request_category,
        Priority: priority,
        'Change Description': description,
        'Reason for Change': reason,
        Impact: impact,
        Risks: risks,
        'Work Tools Required': tools
    } = req.body;

    const attachment = req.file ? req.file.path : null;

    const query = `INSERT INTO requests (
        project_name, change_name, date, change_no, location,
        first_name, last_name, email, phone, job_title,
        request_category, priority, description, reason, impact, risks, tools, attachment
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(query, [
        project_name, change_name, date, change_no, location,
        first_name, last_name, email, phone, job_title,
        request_category, priority, description, reason, impact, risks, tools, attachment
    ], function (err) {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Error saving request.');
        }
        res.send('Request submitted successfully!');
    });
});

app.get('/reports', (req, res) => {
    db.all(`SELECT * FROM requests`, [], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Error fetching reports.');
        }
        res.json(rows);
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

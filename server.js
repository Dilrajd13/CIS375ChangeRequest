const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const db = new sqlite3.Database('./db.sqlite');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/submit-request', (req, res) => {
    const {
        project_name,
        change_name,
        date,
        change_no,
        location,
        first_name,
        last_name,
        email,
        phone_number,
        job_title,
        priority,
        change_description,
        reason_for_change,
        impact,
        risks,
        work_tools_required
    } = req.body;

    const sql = `
        INSERT INTO requests (
            project_name, change_name, date, change_no, location, first_name,
            last_name, email, phone, job_title, priority, description, reason,
            impact, risks, tools, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
        project_name,
        change_name,
        date,
        change_no,
        location,
        first_name,
        last_name,
        email,
        phone_number,
        job_title,
        priority,
        change_description, 
        reason_for_change,
        impact,
        risks,
        work_tools_required, 
        'Pending' 
    ];

    db.run(sql, params, function (err) {
        if (err) {
            console.error("Error saving request:", err.message);
            return res.status(500).json({ message: "Error saving request", error: err.message });
        }
        res.status(200).json({ message: "Request submitted successfully", id: this.lastID });
    });
});

app.get('/view-requests', (req, res) => {
    const sql = `
        SELECT id, project_name, change_no, date, priority, status
        FROM requests
        ORDER BY id DESC`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error("Error fetching requests:", err.message);
            return res.status(500).json({ message: "Error fetching requests", error: err.message });
        }
        res.status(200).json(rows);
    });
});

app.post('/view-detailed-request', (req, res) => {
    const { id, passkey } = req.body;

    const ADMIN_PASSKEY = 'securepass123';
    if (passkey !== ADMIN_PASSKEY) {
        return res.status(403).json({ message: "Invalid passkey" });
    }

    const sql = `
        SELECT *
        FROM requests
        WHERE id = ?`;

    db.get(sql, [id], (err, row) => {
        if (err) {
            console.error("Error fetching detailed request:", err.message);
            return res.status(500).json({ message: "Error fetching detailed request", error: err.message });
        }
        if (!row) {
            return res.status(404).json({ message: "Request not found" });
        }
        res.status(200).json(row);
    });
});

app.post('/update-request-status', (req, res) => {
    const { id, status, passkey } = req.body;

    const ADMIN_PASSKEY = 'securepass123';
    if (passkey !== ADMIN_PASSKEY) {
        return res.status(403).json({ message: "Invalid passkey" });
    }

    const sql = `
        UPDATE requests
        SET status = ?
        WHERE id = ?`;

    db.run(sql, [status, id], function (err) {
        if (err) {
            console.error("Error updating request status:", err.message);
            return res.status(500).json({ message: "Error updating request status", error: err.message });
        }
        res.status(200).json({ message: "Request status updated successfully" });
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

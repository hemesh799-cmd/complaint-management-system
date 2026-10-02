const express = require('express');
const path = require('path');
const { dbQuery } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Helper for email validation
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

// Helper for phone validation
function isValidPhone(phone) {
    const re = /^[0-9+\-\s()]{7,15}$/;
    return re.test(String(phone));
}

// ==================================================
// DASHBOARD API
// ==================================================
app.get('/api/dashboard', async (req, res) => {
    try {
        const usersRow = await dbQuery.get('SELECT COUNT(*) AS count FROM users');
        const deptsRow = await dbQuery.get('SELECT COUNT(*) AS count FROM departments');
        const complaintsRow = await dbQuery.get('SELECT COUNT(*) AS count FROM complaints');
        const resolvedRow = await dbQuery.get("SELECT COUNT(*) AS count FROM complaints WHERE complaint_state = 'Resolved'");

        res.json({
            success: true,
            users: usersRow ? usersRow.count : 0,
            departments: deptsRow ? deptsRow.count : 0,
            complaints: complaintsRow ? complaintsRow.count : 0,
            resolved: resolvedRow ? resolvedRow.count : 0
        });
    } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        res.status(500).json({ success: false, message: 'Server database error' });
    }
});

// ==================================================
// USER APIs
// ==================================================

// POST /api/users - Create User
app.post('/api/users', async (req, res) => {
    try {
        let { first_name, last_name, email, phone_number } = req.body;

        first_name = first_name ? String(first_name).trim() : '';
        last_name = last_name ? String(last_name).trim() : '';
        email = email ? String(email).trim() : '';
        phone_number = phone_number ? String(phone_number).trim() : '';

        if (!first_name || !last_name || !email || !phone_number) {
            return res.status(400).json({
                success: false,
                message: 'All fields (first_name, last_name, email, phone_number) are required.'
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address.'
            });
        }

        if (!isValidPhone(phone_number)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid phone number.'
            });
        }

        const result = await dbQuery.run(
            'INSERT INTO users (first_name, last_name, email, phone_number) VALUES (?, ?, ?, ?)',
            [first_name, last_name, email, phone_number]
        );

        res.status(201).json({
            success: true,
            message: 'User saved successfully',
            user_id: result.id
        });
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ success: false, message: 'Database error: ' + err.message });
    }
});

// GET /api/users - Get All Users
app.get('/api/users', async (req, res) => {
    try {
        const users = await dbQuery.all('SELECT user_id, first_name, last_name, email, phone_number FROM users ORDER BY user_id DESC');
        res.json({
            success: true,
            data: users
        });
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ success: false, message: 'Database error: ' + err.message });
    }
});

// ==================================================
// DEPARTMENT APIs
// ==================================================

// POST /api/departments - Create Department
app.post('/api/departments', async (req, res) => {
    try {
        let { department_name, location, service_area } = req.body;

        department_name = department_name ? String(department_name).trim() : '';
        location = location ? String(location).trim() : '';
        service_area = service_area ? String(service_area).trim() : '';

        if (!department_name) {
            return res.status(400).json({
                success: false,
                message: 'department_name is required.'
            });
        }

        const result = await dbQuery.run(
            'INSERT INTO departments (department_name, location, service_area) VALUES (?, ?, ?)',
            [department_name, location, service_area]
        );

        res.status(201).json({
            success: true,
            message: 'Department saved successfully',
            department_id: result.id
        });
    } catch (err) {
        console.error('Error creating department:', err);
        res.status(500).json({ success: false, message: 'Database error: ' + err.message });
    }
});

// GET /api/departments - Get All Departments
app.get('/api/departments', async (req, res) => {
    try {
        const departments = await dbQuery.all('SELECT department_id, department_name, location, service_area FROM departments ORDER BY department_id DESC');
        res.json({
            success: true,
            data: departments
        });
    } catch (err) {
        console.error('Error fetching departments:', err);
        res.status(500).json({ success: false, message: 'Database error: ' + err.message });
    }
});

// ==================================================
// COMPLAINT APIs
// ==================================================

// POST /api/complaints - Create Complaint
app.post('/api/complaints', async (req, res) => {
    try {
        let { user_id, department_id, complaint_state, category, description } = req.body;

        user_id = parseInt(user_id, 10);
        department_id = parseInt(department_id, 10);
        complaint_state = complaint_state ? String(complaint_state).trim() : 'Pending';
        category = category ? String(category).trim() : '';
        description = description ? String(description).trim() : '';

        if (!user_id || isNaN(user_id) || user_id <= 0) {
            return res.status(400).json({ success: false, message: 'Valid User ID is required.' });
        }

        if (!department_id || isNaN(department_id) || department_id <= 0) {
            return res.status(400).json({ success: false, message: 'Valid Department ID is required.' });
        }

        if (!category) {
            return res.status(400).json({ success: false, message: 'Complaint Category is required.' });
        }

        if (!description) {
            return res.status(400).json({ success: false, message: 'Complaint Description is required.' });
        }

        // 1. Verify User ID exists
        const user = await dbQuery.get('SELECT user_id FROM users WHERE user_id = ?', [user_id]);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: `User with ID ${user_id} does not exist.`
            });
        }

        // 2. Verify Department ID exists
        const dept = await dbQuery.get('SELECT department_id FROM departments WHERE department_id = ?', [department_id]);
        if (!dept) {
            return res.status(404).json({
                success: false,
                message: `Department with ID ${department_id} does not exist.`
            });
        }

        // Insert complaint into database
        const result = await dbQuery.run(
            'INSERT INTO complaints (user_id, department_id, complaint_state, category, description) VALUES (?, ?, ?, ?, ?)',
            [user_id, department_id, complaint_state, category, description]
        );

        const complaintId = result.id;

        // Automatically record initial status in complaint_status table
        const todayStr = new Date().toISOString().split('T')[0];
        await dbQuery.run(
            'INSERT INTO complaint_status (complaint_id, status, resolved_date, remarks, resolution_time) VALUES (?, ?, ?, ?, ?)',
            [complaintId, complaint_state, complaint_state === 'Resolved' ? todayStr : '', 'Initial complaint registered', 'N/A']
        );

        res.status(201).json({
            success: true,
            message: 'Complaint submitted successfully',
            complaint_id: complaintId
        });
    } catch (err) {
        console.error('Error submitting complaint:', err);
        if (err.message.includes('FOREIGN KEY constraint failed')) {
            return res.status(400).json({ success: false, message: 'Referential integrity check failed: User ID or Department ID invalid.' });
        }
        res.status(500).json({ success: false, message: 'Database error: ' + err.message });
    }
});

// GET /api/complaints - Get All Complaints with SQL JOIN
app.get('/api/complaints', async (req, res) => {
    try {
        const sql = `
            SELECT
                c.complaint_id,
                u.user_id,
                u.first_name,
                u.last_name,
                u.email,
                d.department_id,
                d.department_name,
                c.complaint_state,
                c.category,
                c.description
            FROM complaints c
            INNER JOIN users u ON c.user_id = u.user_id
            INNER JOIN departments d ON c.department_id = d.department_id
            ORDER BY c.complaint_id DESC
        `;
        const complaints = await dbQuery.all(sql);
        res.json({
            success: true,
            data: complaints
        });
    } catch (err) {
        console.error('Error fetching complaints:', err);
        res.status(500).json({ success: false, message: 'Database error: ' + err.message });
    }
});

// ==================================================
// STATUS APIs
// ==================================================

// POST /api/status - Update Complaint Status
app.post('/api/status', async (req, res) => {
    try {
        let { complaint_id, status, resolved_date, remarks, resolution_time } = req.body;

        complaint_id = parseInt(complaint_id, 10);
        status = status ? String(status).trim() : '';
        resolved_date = resolved_date ? String(resolved_date).trim() : '';
        remarks = remarks ? String(remarks).trim() : '';
        resolution_time = resolution_time ? String(resolution_time).trim() : '';

        if (!complaint_id || isNaN(complaint_id) || complaint_id <= 0) {
            return res.status(400).json({ success: false, message: 'Valid Complaint ID is required.' });
        }

        if (!status) {
            return res.status(400).json({ success: false, message: 'Status is required.' });
        }

        // 1. Verify Complaint ID exists
        const complaint = await dbQuery.get('SELECT complaint_id FROM complaints WHERE complaint_id = ?', [complaint_id]);
        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: `Complaint with ID ${complaint_id} does not exist.`
            });
        }

        // Auto populate resolved date if status is Resolved and date is empty
        if (status === 'Resolved' && !resolved_date) {
            resolved_date = new Date().toISOString().split('T')[0];
        }

        // Insert new status entry
        const result = await dbQuery.run(
            'INSERT INTO complaint_status (complaint_id, status, resolved_date, remarks, resolution_time) VALUES (?, ?, ?, ?, ?)',
            [complaint_id, status, resolved_date, remarks, resolution_time]
        );

        // Update main complaint state in complaints table
        await dbQuery.run(
            'UPDATE complaints SET complaint_state = ? WHERE complaint_id = ?',
            [status, complaint_id]
        );

        res.status(201).json({
            success: true,
            message: 'Complaint status updated successfully',
            status_id: result.id
        });
    } catch (err) {
        console.error('Error updating status:', err);
        if (err.message.includes('FOREIGN KEY constraint failed')) {
            return res.status(400).json({ success: false, message: 'Referential integrity check failed: Complaint ID does not exist.' });
        }
        res.status(500).json({ success: false, message: 'Database error: ' + err.message });
    }
});

// GET /api/status - Get All Status Records with SQL JOIN
app.get('/api/status', async (req, res) => {
    try {
        const sql = `
            SELECT
                s.status_id,
                s.complaint_id,
                c.category,
                s.status,
                s.resolved_date,
                s.remarks,
                s.resolution_time
            FROM complaint_status s
            INNER JOIN complaints c ON s.complaint_id = c.complaint_id
            ORDER BY s.status_id DESC
        `;
        const statusRecords = await dbQuery.all(sql);
        res.json({
            success: true,
            data: statusRecords
        });
    } catch (err) {
        console.error('Error fetching status records:', err);
        res.status(500).json({ success: false, message: 'Database error: ' + err.message });
    }
});

// GET /api/complaints/:id/status - Get Status History for a Particular Complaint
app.get('/api/complaints/:id/status', async (req, res) => {
    try {
        const complaint_id = parseInt(req.params.id, 10);
        if (isNaN(complaint_id)) {
            return res.status(400).json({ success: false, message: 'Invalid Complaint ID format.' });
        }

        const sql = `
            SELECT
                s.status_id,
                s.complaint_id,
                c.category,
                s.status,
                s.resolved_date,
                s.remarks,
                s.resolution_time
            FROM complaint_status s
            INNER JOIN complaints c ON s.complaint_id = c.complaint_id
            WHERE s.complaint_id = ?
            ORDER BY s.status_id ASC
        `;
        const history = await dbQuery.all(sql, [complaint_id]);
        res.json({
            success: true,
            data: history
        });
    } catch (err) {
        console.error('Error fetching status history:', err);
        res.status(500).json({ success: false, message: 'Database error: ' + err.message });
    }
});

// Start Express Server
app.listen(PORT, () => {
    console.log(`Complaint Management System server running on http://localhost:${PORT}`);
});

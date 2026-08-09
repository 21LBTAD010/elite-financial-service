const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

const DB_PATH = './loans.db';
const JWT_SECRET = 'elite_financial_super_secret_key_123';
const db = new sqlite3.Database(DB_PATH);

// -------------------------------------------------------------
// 1. FIXED PASSWORD AUTHENTICATION
// -------------------------------------------------------------

app.post('/api/auth/login', (req, res) => {
    const { phone, password } = req.body;
    if (!phone || !password) {
        return res.status(400).json({ error: 'Mobile number and password are required.' });
    }

    db.get('SELECT * FROM users WHERE phone_number = ?', [phone], (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' });

        if (!user) {
            return res.status(401).json({ error: 'Invalid phone number or account not found.' });
        }

        if (user.status === 'pending') {
            return res.status(403).json({ error: 'Your account is pending Admin approval.' });
        }

        if (user.status === 'rejected') {
            return res.status(403).json({ error: 'Account access has been disabled by Admin.' });
        }

        if (user.password !== password) {
            return res.status(401).json({ error: 'Incorrect password.' });
        }

        // Generate Single-Session JWT Token
        const token = jwt.sign({ id: user.id, phone: user.phone_number, role: user.role }, JWT_SECRET);

        db.run('UPDATE users SET active_token = ? WHERE id = ?', [token, user.id], (err) => {
            if (err) return res.status(500).json({ error: 'Session creation failed' });
            res.json({ token, role: user.role, name: user.name, phone: user.phone_number });
        });
    });
});

// Middleware: Authenticate Session
function authenticateSession(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token' });

        db.get('SELECT active_token FROM users WHERE id = ?', [decoded.id], (err, user) => {
            if (err || !user || user.active_token !== token) {
                return res.status(401).json({ error: 'Session invalidated. Logged in on another device.' });
            }
            req.user = decoded;
            next();
        });
    });
}

// -------------------------------------------------------------
// 2. USER APPROVAL MANAGEMENT (ADMIN ONLY)
// -------------------------------------------------------------

app.get('/api/users', authenticateSession, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    db.all('SELECT id, phone_number, name, role, status FROM users ORDER BY id DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch users' });
        res.json(rows);
    });
});

app.put('/api/users/:id/status', authenticateSession, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    const { status } = req.body;
    db.run('UPDATE users SET status = ? WHERE id = ?', [status, req.params.id], function (err) {
        if (err) return res.status(500).json({ error: 'Failed to update user status' });
        res.json({ message: `User status updated to ${status}` });
    });
});

// -------------------------------------------------------------
// 3. BANKS ENDPOINTS
// -------------------------------------------------------------

app.get('/api/banks', authenticateSession, (req, res) => {
    db.all('SELECT bank_name FROM banks ORDER BY bank_name ASC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Failed to retrieve banks' });
        res.json(rows.map(r => r.bank_name));
    });
});

app.post('/api/banks', authenticateSession, (req, res) => {
    const { bank_name } = req.body;
    if (!bank_name) return res.status(400).json({ error: 'Bank name is required' });

    db.run('INSERT OR IGNORE INTO banks (bank_name) VALUES (?)', [bank_name.trim()], function(err) {
        if (err) return res.status(500).json({ error: 'Failed to add bank' });
        res.json({ message: 'Bank added successfully', bank_name: bank_name.trim() });
    });
});

// -------------------------------------------------------------
// 4. LOANS ENDPOINTS (CREATE, READ, UPDATE, DELETE)
// -------------------------------------------------------------

app.get('/api/loans', authenticateSession, (req, res) => {
    const isAdmin = req.user.role === 'admin';

    db.all('SELECT * FROM loans ORDER BY created_at DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Query failed' });

        const formattedRows = rows.map(loan => {
            if (isAdmin) return loan;
            return {
                ...loan,
                customer_name: loan.customer_name ? loan.customer_name[0] + '***' : '***',
                customer_phone: loan.customer_phone ? '******' + loan.customer_phone.slice(-4) : '******',
                customer_alt_phone: loan.customer_alt_phone ? '******' + loan.customer_alt_phone.slice(-4) : '******'
            };
        });

        res.json(formattedRows);
    });
});

app.post('/api/loans', authenticateSession, (req, res) => {
    const {
        loan_type, customer_name, customer_phone, customer_alt_phone, loan_amount, bank_details,
        bank_staff_name, bank_staff_phone, disbursal_amount, loan_created_date,
        loan_approved_date, disbursal_expected_date, on_hold_date, disbursed_date,
        source, person_name, person_number, loan_status, remarks
    } = req.body;

    const sql = `
        INSERT INTO loans (
            loan_type, customer_name, customer_phone, customer_alt_phone, loan_amount, bank_details,
            bank_staff_name, bank_staff_phone, disbursal_amount, loan_created_date,
            loan_approved_date, disbursal_expected_date, on_hold_date, disbursed_date,
            source, person_name, person_number, loan_status, remarks, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
        loan_type, customer_name, customer_phone, customer_alt_phone || null, loan_amount, bank_details,
        bank_staff_name, bank_staff_phone, disbursal_amount, loan_created_date,
        loan_approved_date, disbursal_expected_date, on_hold_date, disbursed_date,
        source, person_name, person_number, loan_status, remarks, req.user.phone
    ];

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: 'Failed to record loan' });
        res.json({ message: 'Loan entry created successfully', id: this.lastID });
    });
});

app.put('/api/loans/:id', authenticateSession, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Only Admins can edit records.' });
    }

    const {
        customer_name, customer_phone, customer_alt_phone, loan_amount, loan_status, disbursal_amount,
        loan_approved_date, disbursal_expected_date, on_hold_date, disbursed_date, remarks
    } = req.body;

    const sql = `
        UPDATE loans SET 
            customer_name = COALESCE(?, customer_name),
            customer_phone = COALESCE(?, customer_phone),
            customer_alt_phone = COALESCE(?, customer_alt_phone),
            loan_amount = COALESCE(?, loan_amount),
            loan_status = ?, 
            disbursal_amount = ?,
            loan_approved_date = ?, 
            disbursal_expected_date = ?, 
            on_hold_date = ?, 
            disbursed_date = ?,
            remarks = ?
        WHERE id = ?
    `;

    db.run(sql, [
        customer_name, customer_phone, customer_alt_phone, loan_amount, loan_status, disbursal_amount,
        loan_approved_date, disbursal_expected_date, on_hold_date, disbursed_date, remarks, req.params.id
    ], function (err) {
        if (err) return res.status(500).json({ error: 'Failed to update loan' });
        res.json({ message: 'Loan updated successfully' });
    });
});

app.delete('/api/loans/:id', authenticateSession, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Only Admins can delete applications.' });
    }

    db.run('DELETE FROM loans WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: 'Failed to delete application' });
        res.json({ message: 'Loan application deleted successfully' });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Elite Financial Service Server running on port ${PORT}`));

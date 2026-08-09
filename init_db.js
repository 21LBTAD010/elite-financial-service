const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./loans.db');

console.log('⏳ Updating database schema for Alternate Phone & User Approvals...');

db.serialize(() => {
    // 1. Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone_number TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        role TEXT CHECK(role IN ('admin', 'staff')) NOT NULL DEFAULT 'staff',
        status TEXT CHECK(status IN ('pending', 'approved', 'rejected')) NOT NULL DEFAULT 'pending',
        active_token TEXT DEFAULT NULL
    )`);

    // 2. Loans Table
    db.run(`CREATE TABLE IF NOT EXISTS loans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        loan_type TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        customer_alt_phone TEXT DEFAULT NULL,
        loan_amount REAL NOT NULL,
        disbursal_amount REAL DEFAULT NULL,
        bank_details TEXT,
        bank_staff_name TEXT DEFAULT NULL,
        bank_staff_phone TEXT DEFAULT NULL,
        loan_created_date DATE NOT NULL,
        loan_approved_date DATE DEFAULT NULL,
        disbursal_expected_date DATE DEFAULT NULL,
        on_hold_date DATE DEFAULT NULL,
        disbursed_date DATE DEFAULT NULL,
        source TEXT,
        person_name TEXT,
        person_number TEXT,
        loan_status TEXT DEFAULT 'New',
        remarks TEXT,
        created_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Upgrade existing schema if needed
    db.run(`ALTER TABLE loans ADD COLUMN customer_alt_phone TEXT`, () => {});
    db.run(`ALTER TABLE users ADD COLUMN status TEXT CHECK(status IN ('pending', 'approved', 'rejected')) DEFAULT 'approved'`, () => {});

    // Ensure Primary Admin is set
    const insertAdmin = db.prepare(`INSERT OR REPLACE INTO users (phone_number, name, role, status) VALUES (?, ?, ?, ?)`);
    insertAdmin.run('9043350445', 'Admin User', 'admin', 'approved');
    insertAdmin.finalize();

    console.log('✅ Database updated successfully!');
    db.close();
});

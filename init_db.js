const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./loans.db');

console.log('⏳ Updating database schema for Fixed Password Login...');

db.serialize(() => {
    // 1. Users Table with password column
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone_number TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password TEXT NOT NULL,
        role TEXT CHECK(role IN ('admin', 'staff')) NOT NULL DEFAULT 'staff',
        status TEXT CHECK(status IN ('pending', 'approved', 'rejected')) NOT NULL DEFAULT 'approved',
        active_token TEXT DEFAULT NULL
    )`);

    // Ensure password column exists if upgrading database
    db.run(`ALTER TABLE users ADD COLUMN password TEXT`, () => {});

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

    // 3. Pre-seed Authorized Users with Fixed Password 'Elite@1981'
    const defaultUsers = [
        { phone: '9043350445', name: 'Admin User', role: 'admin', pass: 'Elite@1981' },
        { phone: '6374431536', name: 'Staff User 1', role: 'staff', pass: 'Elite@1981' },
        { phone: '8838557405', name: 'Staff User 2', role: 'staff', pass: 'Elite@1981' },
        { phone: '7708171016', name: 'Staff User 3', role: 'staff', pass: 'Elite@1981' }
    ];

    const stmt = db.prepare(`
        INSERT INTO users (phone_number, name, password, role, status) 
        VALUES (?, ?, ?, ?, 'approved')
        ON CONFLICT(phone_number) DO UPDATE SET password = excluded.password, status = 'approved'
    `);

    defaultUsers.forEach(u => {
        stmt.run(u.phone, u.name, u.pass, u.role);
    });
    stmt.finalize();

    console.log('✅ Successfully seeded fixed credentials for 4 authorized users!');
    db.close();
});

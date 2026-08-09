const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./loans.db');

console.log('⏳ Updating database schema for User Approval Flow & Delete permissions...');

db.serialize(() => {
    // 1. Users Table with status column
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone_number TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        role TEXT CHECK(role IN ('admin', 'staff')) NOT NULL DEFAULT 'staff',
        status TEXT CHECK(status IN ('pending', 'approved', 'rejected')) NOT NULL DEFAULT 'pending',
        active_token TEXT DEFAULT NULL
    )`);

    // Add status column if upgrading existing database
    db.run(`ALTER TABLE users ADD COLUMN status TEXT CHECK(status IN ('pending', 'approved', 'rejected')) DEFAULT 'approved'`, (err) => {
        // Ignore error if column already exists
    });

    // 2. Insert or Ensure Primary Admin is Approved
    const insertAdmin = db.prepare(`INSERT OR REPLACE INTO users (phone_number, name, role, status) VALUES (?, ?, ?, ?)`);
    insertAdmin.run('9043350445', 'Admin User', 'admin', 'approved');
    insertAdmin.finalize();

    console.log('✅ Database updated successfully! Primary Admin (9043350445) is approved.');
    db.close();
});
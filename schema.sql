-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone_number TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'staff')) NOT NULL DEFAULT 'staff',
    active_token TEXT DEFAULT NULL
);

-- OTP Store Table
CREATE TABLE IF NOT EXISTS otps (
    phone_number TEXT PRIMARY KEY,
    otp_code TEXT NOT NULL,
    expires_at DATETIME NOT NULL
);

-- Dynamic Banks Table
CREATE TABLE IF NOT EXISTS banks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bank_name TEXT UNIQUE NOT NULL
);

-- Loans Table
CREATE TABLE IF NOT EXISTS loans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    loan_type TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    loan_amount REAL NOT NULL,
    bank_details TEXT,
    bank_staff_name TEXT,
    bank_staff_phone TEXT,
    disbursal_amount REAL,
    loan_created_date DATE,
    loan_approved_date DATE,
    disbursal_expected_date DATE,
    on_hold_date DATE,
    disbursed_date DATE,
    source TEXT,
    person_name TEXT,
    person_number TEXT,
    loan_status TEXT DEFAULT 'New',
    remarks TEXT,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
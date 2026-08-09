const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./loans.db');

db.run(
    `INSERT OR REPLACE INTO users (phone_number, name, role) VALUES (?, ?, ?)`,
    ['9043350445', 'Admin User', 'admin'],
    function (err) {
        if (err) console.error('❌ Error:', err.message);
        else console.log('✅ Phone number 9043350445 successfully added as Admin!');
        db.close();
    }
);
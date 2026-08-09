const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./loans.db');

// Clean and corrected list requested by Elite Financial Service
const cleanBanksList = [
    "State Bank of India",
    "Bank of Baroda",
    "South Indian Bank",
    "Axis Bank",
    "HDFC Bank",
    "Aadhar Housing Finance",
    "Cholamandalam Housing Finance",
    "First Home India",
    "Vistaar Housing Finance",
    "Veritas Finance",
    "Equitas Small Finance Bank",
    "Piramal Capital",
    "Aditya Birla Capital",
    "Tata Capital",
    "Altum Credo Housing Finance",
    "Bajaj Finance",
    "Federal Bank",
    "IIFL Samasta",
    "True Home Finance",
    "Arc Fin Capital",
    "KreditBee",
    "InCred",
    "Finable",
    "Shriram Finance",
    "Vastu Housing Finance",
    "Jana Small Finance Bank",
    "Agam Housing Finance",
    "IDFC FIRST Bank",
    "Muthoot Finance",
    "DCB Bank",
    "IKF Finance",
    "Agrim Housing Finance",
    "Ugro Capital",
    "Union Bank of India",
    "Yes Bank",
    "Mintifi Finserve",
    "ITI Housing Finance",
    "Sundaram Finance",
    "L&T Finance",
    "Repco Home Finance",
    "Hiranandani Financial Services",
    "Fullerton India (SMFG India Credit)",
    "ESAF Small Finance Bank",
    "IndusInd Bank"
];

db.serialize(() => {
    // 1. Create banks table if not exists
    db.run(`CREATE TABLE IF NOT EXISTS banks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bank_name TEXT UNIQUE NOT NULL
    )`);

    // 2. Clear out all old bank entries completely
    db.run(`DELETE FROM banks`, (err) => {
        if (err) console.error("Error clearing old banks:", err);
        else console.log("🧹 Removed all previous bank entries.");
    });

    // 3. Insert the new clean 44 bank names
    const stmt = db.prepare(`INSERT OR IGNORE INTO banks (bank_name) VALUES (?)`);
    cleanBanksList.forEach(bank => stmt.run(bank));
    stmt.finalize();

    console.log(`✅ Successfully seeded exact ${cleanBanksList.length} corrected banks & financial institutions!`);
    db.close();
});

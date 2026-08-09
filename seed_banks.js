const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./loans.db');

const banksList = [
    // Top Financial / NBFC Companies
    "Bajaj Finance", "Shriram Finance", "Cholamandalam Investment & Finance", "Tata Capital", 
    "Muthoot Finance", "L&T Finance Ltd", "SBI Cards", "M & M Financial Services", 
    "HDB Financial Services", "Sundaram Finance", "Authum Investment", "Poonawalla Fincorp", 
    "Manappuram Finance", "IIFL Finance", "Capri Global", "Five-Star Business Finance", 
    "SBFC Finance", "Bengal & Assam", "Mrugesh Trading", "Paisalo Digital", 
    "Fedbank Financial Services", "MAS Financial Services", "Dhenu Buildcon", "SG Finserve", 
    "Northern Arc", "Abhinav Hire Purchase Ltd.", "Abs Leasing & Financing (I) Ltd.",
    "Acg Sons Financiers Ltd", "Achal Finance Ltd.", "Adarsh Financiers Ltd.",
    "Adayar Finance & Leasing Ltd", "Advait Auto Finance Ltd.", "Ajanta Instalments Limited",
    "Ajmani Leasing & Finance Ltd.", "Akal Finlease Ltd.", "Akme Fintrade (India) Ltd",
    "Alagendran Finance Ltd.", "Alpic Finance Ltd.", "Ambica Instalments Limited",
    "Anand Lakshmi Finance Ltd.", "Annapoorna Finvest Ltd.", "Apna Finance (India) Ltd",
    "Aquila Finance Limited", "Arman Lease And Finance Ltd.", "Auram Leasing & Finance Ltd.",
    "Avon Capital Services Ltd.", "B.D. Credits Limited", "B.V.Finance & Leasing Ltd.",
    "Bajaj Auto Finance Ltd.", "Balaji Fund Growth Ltd.", "Bansal Credits Limited",
    "Berar Finance Ltd.", "Bhanot Finance Ltd.", "Bhojwani Leasing & Finance Ltd.",
    "Bijnor Leasing (P)Limited", "Birla Global Finance Ltd.", "Canbank Factors Ltd.",
    "Ceejay Finance Limited", "Cholamandalam Investments & Finance Co Ltd", "Dar Credit & Capital Ltd",
    "Deccan Finance Ltd", "Dfl Finance Ltd.", "Dhandapani Finance Ltd", "Escorts Finance Limited",
    "First Leasing Co. Of India Ltd", "Fortis Financial Services Ltd.", "Galada Finance Ltd",
    "Gujarat Lease Financing Ltd.", "Hero Financial Services Ltd.", "IFCI Limited",
    "IKF Finance Limited", "India Cements Capital & Finance Ltd", "India Lease Development Limited",
    "Integrated Finance Co. Ltd.", "Inter State Finance Limited", "Jayabharat Credit Ltd.",
    "K.Z.Leasing And Finance Ltd", "Kailash Auto Finance Limited", "Kanakadurga Leasing & Finance Ltd.",
    "Karvy Consultants Ltd.", "Kogta Financial (India) Ltd", "Lakshmi General Finance Ltd",
    "Mahindra & Mahindra Financial Services Ltd.", "Manappuram General Finance And Leasing Ltd",
    "Manipal Finance Corporation Ltd", "Mas Financial Services Ltd.", "Muthoot Capital Services Ltd",
    "Muthoot Leasing & Finance Ltd", "Nalin Lease Finance Ltd.", "Npr Finance Ltd",
    "Paul Merchants Limited", "PHF Leasing Ltd.", "PKF Finance Ltd.", "PNB Capital Services Ltd.",
    "Rajath Finance Ltd.", "Sakthi Finance Ltd", "Satin Creditcare Network Ltd.",
    "Shriram City Union Finance Ltd", "Shriram Transport Finance Co Ltd", "Sundaram Finance Ltd",
    "Tata Finance Ltd.", "Tata Investment Corporation Ltd.", "TCI Finance Limited",
    "The Motor & General Finance Ltd.", "Tourism Finance Corp. Of India Ltd.", "TVS Finance Ltd",
    "Wall Street Finance Ltd.", "West Bengal Industrial Development Corpn. Ltd"
];

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS banks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        bank_name TEXT UNIQUE NOT NULL
    )`);

    const stmt = db.prepare(`INSERT OR IGNORE INTO banks (bank_name) VALUES (?)`);
    banksList.forEach(bank => stmt.run(bank));
    stmt.finalize();

    console.log(`✅ Successfully seeded top NBFCs & Banks into database!`);
    db.close();
});

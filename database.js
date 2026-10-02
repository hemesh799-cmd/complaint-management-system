const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'database.sqlite');

// Connect to SQLite database
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error connecting to SQLite database:', err.message);
    } else {
        console.log('Connected to SQLite database at:', DB_PATH);
    }
});

// Enable Foreign Key support and create tables
db.serialize(() => {
    // Enable Foreign Key constraints
    db.run('PRAGMA foreign_keys = ON;', (err) => {
        if (err) console.error('Error enabling foreign keys:', err.message);
        else console.log('SQLite PRAGMA foreign_keys = ON enabled.');
    });

    // 1. USER Table
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone_number TEXT NOT NULL
        )
    `, (err) => {
        if (err) console.error('Error creating users table:', err.message);
        else console.log('Table "users" ready.');
    });

    // 2. DEPARTMENT Table
    db.run(`
        CREATE TABLE IF NOT EXISTS departments (
            department_id INTEGER PRIMARY KEY AUTOINCREMENT,
            department_name TEXT NOT NULL,
            location TEXT,
            service_area TEXT
        )
    `, (err) => {
        if (err) console.error('Error creating departments table:', err.message);
        else console.log('Table "departments" ready.');
    });

    // 3. COMPLAINT Table
    db.run(`
        CREATE TABLE IF NOT EXISTS complaints (
            complaint_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            department_id INTEGER NOT NULL,
            complaint_state TEXT NOT NULL,
            category TEXT NOT NULL,
            description TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT,
            FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE RESTRICT
        )
    `, (err) => {
        if (err) console.error('Error creating complaints table:', err.message);
        else console.log('Table "complaints" ready.');
    });

    // 4. STATUS Table (Weak/dependent entity for complaint status history)
    db.run(`
        CREATE TABLE IF NOT EXISTS complaint_status (
            status_id INTEGER PRIMARY KEY AUTOINCREMENT,
            complaint_id INTEGER NOT NULL,
            status TEXT NOT NULL,
            resolved_date TEXT,
            remarks TEXT,
            resolution_time TEXT,
            FOREIGN KEY (complaint_id) REFERENCES complaints(complaint_id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) console.error('Error creating complaint_status table:', err.message);
        else console.log('Table "complaint_status" ready.');
    });
});

// Helper Promise wrappers for database operations
const dbQuery = {
    run: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            // Enable FKs for each connection session context if needed
            db.run('PRAGMA foreign_keys = ON;', () => {
                db.run(sql, params, function (err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID, changes: this.changes });
                });
            });
        });
    },

    get: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    all: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
};

module.exports = { db, dbQuery };

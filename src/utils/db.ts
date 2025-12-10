import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'smarthub.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('journal_mode = WAL');

// Create users table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create index on email for faster lookups
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
`);

// Create index on username for faster lookups
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)
`);

export default db;

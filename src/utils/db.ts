/**
 * @fileoverview SQLite database connection and initialization for the authentication system.
 *
 * This module establishes the database connection and creates the required
 * schema for user authentication. It uses better-sqlite3 for synchronous,
 * high-performance SQLite operations.
 *
 * @module utils/db
 * @version 1.0.0
 *
 * @requires better-sqlite3 - Synchronous SQLite3 driver for Node.js
 * @requires path - Node.js path utilities
 *
 * @example
 * import db from './utils/db';
 *
 * // Execute a query
 * const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
 * const user = stmt.get('user-uuid-here');
 *
 * // Insert a record
 * const insertStmt = db.prepare('INSERT INTO users (id, email) VALUES (?, ?)');
 * insertStmt.run('uuid', 'email@example.com');
 */

import Database from 'better-sqlite3';
import path from 'path';

/**
 * Database file path.
 *
 * The SQLite database is stored in the current working directory.
 * This is typically the project root when running the server.
 *
 * @constant {string}
 * @default '<cwd>/smarthub.db'
 *
 * @remarks
 * - In production, consider using an absolute path or environment variable
 * - Ensure the directory has write permissions
 * - The file is created automatically if it doesn't exist
 */
const dbPath = path.join(process.cwd(), 'smarthub.db');

/**
 * SQLite database connection instance.
 *
 * A singleton database connection used throughout the application.
 * better-sqlite3 provides synchronous operations which are more
 * efficient for SQLite than async wrappers.
 *
 * @type {Database.Database}
 *
 * @remarks
 * ## Why better-sqlite3?
 * - Synchronous API is faster for SQLite (no async overhead)
 * - SQLite operations are already atomic and fast
 * - Simpler code without callback/promise chains
 * - Better performance for high-throughput scenarios
 *
 * ## Connection Lifecycle
 * - Connection is established when this module is imported
 * - Connection persists for the lifetime of the process
 * - Connection is automatically closed on process exit
 *
 * @example
 * import db from './utils/db';
 *
 * // Prepared statements (recommended for security and performance)
 * const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
 * const user = stmt.get('user@example.com');
 *
 * // Run multiple operations in a transaction
 * const insertMany = db.transaction((users) => {
 *   for (const user of users) {
 *     insertStmt.run(user.id, user.email);
 *   }
 * });
 */
const db = new Database(dbPath);

/**
 * Database Configuration: Write-Ahead Logging (WAL) mode.
 *
 * WAL mode provides better concurrency and performance compared to
 * the default rollback journal mode.
 *
 * @remarks
 * ## Benefits of WAL Mode
 * - Readers don't block writers
 * - Writers don't block readers
 * - Better performance for concurrent access
 * - More durable against crashes
 *
 * ## Considerations
 * - Creates additional files: smarthub.db-wal, smarthub.db-shm
 * - These files are managed automatically by SQLite
 * - Don't delete these files while the database is in use
 *
 * @see {@link https://www.sqlite.org/wal.html} SQLite WAL Documentation
 */
db.pragma('journal_mode = WAL');

/**
 * Users Table Schema
 *
 * Creates the users table if it doesn't exist. This table stores
 * all user account information for authentication.
 *
 * @schema
 * | Column        | Type    | Constraints                    | Description                    |
 * |---------------|---------|--------------------------------|--------------------------------|
 * | id            | TEXT    | PRIMARY KEY                    | UUID v4 identifier             |
 * | email         | TEXT    | UNIQUE, NOT NULL               | User's email (lowercase)       |
 * | username      | TEXT    | UNIQUE, NOT NULL               | User's username (lowercase)    |
 * | password_hash | TEXT    | NOT NULL                       | Bcrypt password hash           |
 * | created_at    | TEXT    | DEFAULT CURRENT_TIMESTAMP      | Account creation timestamp     |
 * | updated_at    | TEXT    | DEFAULT CURRENT_TIMESTAMP      | Last modification timestamp    |
 *
 * @remarks
 * - UUIDs are used instead of auto-increment for better distributed system compatibility
 * - Email and username uniqueness is enforced at the database level
 * - Timestamps are stored as TEXT in ISO 8601 format for portability
 * - password_hash stores the full bcrypt hash including salt
 */
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

/**
 * Email Index
 *
 * Creates an index on the email column for faster lookups during
 * authentication and duplicate checking.
 *
 * @remarks
 * - Significantly speeds up findUserByEmail queries
 * - Essential for login performance where email is the lookup key
 * - Index is automatically maintained by SQLite on inserts/updates
 */
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
`);

/**
 * Username Index
 *
 * Creates an index on the username column for faster lookups during
 * registration (duplicate checking) and potential username-based login.
 *
 * @remarks
 * - Speeds up findUserByUsername queries
 * - Important for registration flow to check username availability
 * - Index is automatically maintained by SQLite on inserts/updates
 */
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)
`);

/**
 * Default export: Database connection instance.
 *
 * Import this module to access the database connection:
 * ```typescript
 * import db from './utils/db';
 * ```
 *
 * @see {@link https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md} API Documentation
 */
export default db;

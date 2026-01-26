const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

let db = null;
const DB_TYPE = process.env.DB_TYPE || 'sqlite'; // 'postgresql' or 'sqlite'

/**
 * Initialize database connection
 */
async function initDatabase() {
    if (DB_TYPE === 'postgresql') {
        // PostgreSQL connection
        db = new Pool({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            database: process.env.DB_NAME || 'pallet_visualizer',
            user: process.env.DB_USER || 'pv_user',
            password: process.env.DB_PASSWORD,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });

        // Test connection
        try {
            const client = await db.connect();
            console.log('✓ PostgreSQL database connected successfully');
            client.release();
        } catch (err) {
            console.error('✗ PostgreSQL connection failed:', err.message);
            throw err;
        }
    } else {
        // SQLite connection
        const Database = require('better-sqlite3');
        const dbPath = process.env.DB_PATH || path.join(__dirname, '../../database/pallet_visualizer.db');

        // Ensure database directory exists
        const dbDir = path.dirname(dbPath);
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }

        db = new Database(dbPath, { verbose: console.log });

        // Enable foreign keys
        db.pragma('foreign_keys = ON');

        console.log('✓ SQLite database connected:', dbPath);

        // Initialize schema if tables don't exist
        const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='warehouse_orders'").get();
        if (!tableCheck) {
            console.log('Initializing SQLite schema...');
            const schemaPath = path.join(__dirname, '../../database/schema.sqlite.sql');
            if (fs.existsSync(schemaPath)) {
                const schema = fs.readFileSync(schemaPath, 'utf8');
                db.exec(schema);
                console.log('✓ SQLite schema initialized');
            }
        }
    }

    return db;
}

/**
 * Execute query (works for both PostgreSQL and SQLite)
 */
async function query(sql, params = []) {
    if (DB_TYPE === 'postgresql') {
        return await db.query(sql, params);
    } else {
        // SQLite
        if (sql.trim().toUpperCase().startsWith('SELECT')) {
            const stmt = db.prepare(sql);
            const rows = stmt.all(...params);
            return { rows };
        } else {
            const stmt = db.prepare(sql);
            const result = stmt.run(...params);
            return {
                rows: [],
                rowCount: result.changes,
                lastID: result.lastInsertRowid
            };
        }
    }
}

/**
 * Get a single row
 */
async function queryOne(sql, params = []) {
    if (DB_TYPE === 'postgresql') {
        const result = await db.query(sql, params);
        return result.rows[0] || null;
    } else {
        const stmt = db.prepare(sql);
        return stmt.get(...params) || null;
    }
}

/**
 * Health check
 */
async function healthCheck() {
    try {
        if (DB_TYPE === 'postgresql') {
            await db.query('SELECT 1');
        } else {
            db.prepare('SELECT 1').get();
        }
        return true;
    } catch (err) {
        console.error('Database health check failed:', err);
        return false;
    }
}

/**
 * Close database connection
 */
async function closeDatabase() {
    if (db) {
        if (DB_TYPE === 'postgresql') {
            await db.end();
        } else {
            db.close();
        }
        console.log('Database connection closed');
    }
}

module.exports = {
    initDatabase,
    query,
    queryOne,
    healthCheck,
    closeDatabase,
    getDB: () => db,
    DB_TYPE
};

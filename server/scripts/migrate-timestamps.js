// Migration script to add created_at and updated_at columns to warehouse_tasks
require('dotenv').config();
const { initDatabase, query, closeDatabase } = require('../config/database');

async function runMigration() {
    console.log('Initializing database...');
    await initDatabase();

    console.log('Applying migration: 002_add_timestamps...');

    try {
        // Add created_at column
        await query(`
            ALTER TABLE warehouse_tasks 
            ADD COLUMN created_at TEXT DEFAULT (datetime('now'))
        `);
        console.log('✓ Added created_at column');

        // Add updated_at column
        await query(`
            ALTER TABLE warehouse_tasks 
            ADD COLUMN updated_at TEXT DEFAULT (datetime('now'))
        `);
        console.log('✓ Added updated_at column');

        // Create index
        await query(`
            CREATE INDEX idx_task_created_at ON warehouse_tasks(created_at)
        `);
        console.log('✓ Created index on created_at');

        console.log('\n✅ Migration completed successfully!');
    } catch (err) {
        if (err.message && err.message.includes('duplicate column name')) {
            console.log('⚠️  Columns already exist, skipping migration');
        } else {
            console.error('❌ Migration failed:', err);
            await closeDatabase();
            process.exit(1);
        }
    }

    await closeDatabase();
    process.exit(0);
}

runMigration();

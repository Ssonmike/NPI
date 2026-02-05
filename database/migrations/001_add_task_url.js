// Migration script to add task_url column to warehouse_tasks table
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'pallet_visualizer.db');
console.log('Database path:', dbPath);
const db = new Database(dbPath);

console.log('🔄 Running migration: Add task_url column...');

try {
    // Check if column already exists
    const tableInfo = db.prepare("PRAGMA table_info(warehouse_tasks)").all();
    const hasTaskUrl = tableInfo.some(col => col.name === 'task_url');

    if (hasTaskUrl) {
        console.log('✅ Column task_url already exists. Skipping migration.');
    } else {
        // Add the column
        db.prepare('ALTER TABLE warehouse_tasks ADD COLUMN task_url TEXT').run();
        console.log('✅ Added task_url column to warehouse_tasks table');

        // Update existing rows
        const updateStmt = db.prepare(`
            UPDATE warehouse_tasks 
            SET task_url = 'http://localhost:5173/' || warehouse_order_id || '/task/' || id
            WHERE task_url IS NULL
        `);
        const result = updateStmt.run();
        console.log(`✅ Updated ${result.changes} existing rows with task_url`);
    }

    console.log('✅ Migration completed successfully!');
} catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
} finally {
    db.close();
}

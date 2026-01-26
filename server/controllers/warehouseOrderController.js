const { query, queryOne, DB_TYPE } = require('../config/database');

/**
 * Create a new warehouse order with tasks
 */
async function createWarehouseOrder(ortecData) {
    const { resourceId, resource, loadInstructions } = ortecData;

    // Prepare data based on DB type
    const ortecDataStr = DB_TYPE === 'postgresql'
        ? JSON.stringify(ortecData)
        : JSON.stringify(ortecData);

    // Insert warehouse order (UPSERT - replace if exists)
    if (DB_TYPE === 'postgresql') {
        await query(
            `INSERT INTO warehouse_orders (id, ortec_data, status, total_tasks)
       VALUES ($1, $2::jsonb, $3, $4)
       ON CONFLICT (id) DO UPDATE 
       SET ortec_data = $2::jsonb, status = $3, total_tasks = $4, created_at = NOW()`,
            [resourceId, ortecDataStr, 'ACTIVE', loadInstructions.length]
        );
    } else {
        // SQLite
        await query(
            `INSERT OR REPLACE INTO warehouse_orders (id, ortec_data, status, total_tasks, created_at)
       VALUES (?, ?, ?, ?, datetime('now'))`,
            [resourceId, ortecDataStr, 'ACTIVE', loadInstructions.length]
        );
    }

    // Delete existing tasks for this warehouse order (if any)
    await query(
        `DELETE FROM warehouse_tasks WHERE warehouse_order_id = ${DB_TYPE === 'postgresql' ? '$1' : '?'}`,
        [resourceId]
    );

    // Insert tasks
    for (const instruction of loadInstructions) {
        const blockDataStr = JSON.stringify(instruction);

        if (DB_TYPE === 'postgresql') {
            await query(
                `INSERT INTO warehouse_tasks 
         (id, warehouse_order_id, sequence, block_data, package_id, serial_number, picking_location, status)
         VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8)`,
                [
                    instruction.id,
                    resourceId,
                    instruction.sequence,
                    blockDataStr,
                    instruction.packageId || null,
                    instruction.serialNumber || null,
                    instruction.pickingLocation || null,
                    'PENDING'
                ]
            );
        } else {
            await query(
                `INSERT INTO warehouse_tasks 
         (id, warehouse_order_id, sequence, block_data, package_id, serial_number, picking_location, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    instruction.id,
                    resourceId,
                    instruction.sequence,
                    blockDataStr,
                    instruction.packageId || null,
                    instruction.serialNumber || null,
                    instruction.pickingLocation || null,
                    'PENDING'
                ]
            );
        }
    }

    return {
        warehouseOrderId: resourceId,
        tasksCount: loadInstructions.length
    };
}

/**
 * Get warehouse order by ID
 */
async function getWarehouseOrder(warehouseOrderId) {
    const row = await queryOne(
        `SELECT * FROM warehouse_orders WHERE id = ${DB_TYPE === 'postgresql' ? '$1' : '?'}`,
        [warehouseOrderId]
    );

    if (!row) return null;

    // Parse JSON data
    const ortecData = typeof row.ortec_data === 'string'
        ? JSON.parse(row.ortec_data)
        : row.ortec_data;

    return {
        ...row,
        ortec_data: ortecData
    };
}

/**
 * Get all tasks for a warehouse order
 */
async function getWarehouseTasks(warehouseOrderId) {
    const result = await query(
        `SELECT * FROM warehouse_tasks 
     WHERE warehouse_order_id = ${DB_TYPE === 'postgresql' ? '$1' : '?'}
     ORDER BY sequence ASC`,
        [warehouseOrderId]
    );

    return result.rows.map(row => ({
        ...row,
        block_data: typeof row.block_data === 'string' ? JSON.parse(row.block_data) : row.block_data
    }));
}

/**
 * Get task by warehouse order and sequence
 */
async function getTaskBySequence(warehouseOrderId, sequence) {
    const row = await queryOne(
        `SELECT * FROM warehouse_tasks 
     WHERE warehouse_order_id = ${DB_TYPE === 'postgresql' ? '$1' : '?'} 
     AND sequence = ${DB_TYPE === 'postgresql' ? '$2' : '?'}`,
        [warehouseOrderId, sequence]
    );

    if (!row) return null;

    return {
        ...row,
        block_data: typeof row.block_data === 'string' ? JSON.parse(row.block_data) : row.block_data
    };
}

/**
 * Get active warehouse orders count
 */
async function getActiveWarehouseOrdersCount() {
    const row = await queryOne(
        `SELECT COUNT(*) as count FROM warehouse_orders WHERE status = 'ACTIVE'`
    );
    return parseInt(row.count || 0);
}

module.exports = {
    createWarehouseOrder,
    getWarehouseOrder,
    getWarehouseTasks,
    getTaskBySequence,
    getActiveWarehouseOrdersCount
};

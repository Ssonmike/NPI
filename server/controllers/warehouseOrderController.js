const { query, queryOne, DB_TYPE } = require('../config/database');

/**
 * Create a new warehouse order with tasks
 * Supports both SAP and ORTEC formats
 */
async function createWarehouseOrder(payload, format = null) {
    // Detect format if not provided
    if (!format) {
        if (payload.warehouseOrderId && payload.tasks) {
            format = 'SAP';
        } else if (payload.resourceId && payload.loadInstructions) {
            format = 'ORTEC';
        } else {
            throw new Error('Unknown format');
        }
    }

    let warehouseOrderId, tasks, totalTasks;

    // Extract data based on format
    if (format === 'SAP') {
        warehouseOrderId = payload.warehouseOrderId;
        tasks = payload.tasks;
        // For SAP, totalTasks is the total number of boxes (since each box becomes a warehouse_task)
        totalTasks = tasks.reduce((sum, task) => sum + (task.boxes ? task.boxes.length : 0), 0);
    } else if (format === 'ORTEC') {
        warehouseOrderId = payload.resourceId;
        tasks = payload.loadInstructions;
        totalTasks = tasks.length;
    }

    // Prepare data based on DB type
    const payloadStr = DB_TYPE === 'postgresql'
        ? JSON.stringify(payload)
        : JSON.stringify(payload);

    // Insert warehouse order (UPSERT - replace if exists)
    if (DB_TYPE === 'postgresql') {
        await query(
            `INSERT INTO warehouse_orders (id, ortec_data, status, total_tasks)
       VALUES ($1, $2::jsonb, $3, $4)
       ON CONFLICT (id) DO UPDATE 
       SET ortec_data = $2::jsonb, status = $3, total_tasks = $4, created_at = NOW()`,
            [warehouseOrderId, payloadStr, 'ACTIVE', totalTasks]
        );
    } else {
        // SQLite
        await query(
            `INSERT OR REPLACE INTO warehouse_orders (id, ortec_data, status, total_tasks, created_at)
       VALUES (?, ?, ?, ?, datetime('now'))`,
            [warehouseOrderId, payloadStr, 'ACTIVE', totalTasks]
        );
    }

    // Delete existing tasks for this warehouse order (if any)
    await query(
        `DELETE FROM warehouse_tasks WHERE warehouse_order_id = ${DB_TYPE === 'postgresql' ? '$1' : '?'}`,
        [warehouseOrderId]
    );

    // Insert tasks based on format
    if (format === 'SAP') {
        // SAP format: Each task contains multiple boxes
        // We need to create one warehouse_task row per box
        for (const task of tasks) {
            const { taskId, sequence, sku, packageId, sourceLocation, boxes } = task;

            // Insert each box as a separate warehouse_task
            for (let boxIndex = 0; boxIndex < boxes.length; boxIndex++) {
                const box = boxes[boxIndex];

                // Create block_data in ORTEC-compatible format for visualization
                const blockData = {
                    id: box.boxId,
                    serialNumber: sku,
                    pickingLocation: sourceLocation,
                    x1: box.x1,
                    x2: box.x2,
                    y1: box.y1,
                    y2: box.y2,
                    z1: box.z1,
                    z2: box.z2,
                    quantityX: 1,
                    quantityY: 1,
                    quantityZ: 1,
                    sizeUom: "mm",
                    orientation: "LxW",
                    blockType: "Cube",
                    packageId: packageId,
                    sequence: sequence,
                    // Keep original task info for reference
                    _taskId: taskId,
                    _boxIndex: boxIndex + 1,
                    _totalBoxes: boxes.length
                };

                const blockDataStr = JSON.stringify(blockData);

                if (DB_TYPE === 'postgresql') {
                    await query(
                        `INSERT INTO warehouse_tasks 
                 (id, warehouse_order_id, sequence, block_data, package_id, serial_number, picking_location, status)
                 VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8)`,
                        [
                            box.boxId,
                            warehouseOrderId,
                            sequence,
                            blockDataStr,
                            packageId,
                            sku,
                            sourceLocation,
                            'PENDING'
                        ]
                    );
                } else {
                    await query(
                        `INSERT INTO warehouse_tasks 
                 (id, warehouse_order_id, sequence, block_data, package_id, serial_number, picking_location, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            box.boxId,
                            warehouseOrderId,
                            sequence,
                            blockDataStr,
                            packageId,
                            sku,
                            sourceLocation,
                            'PENDING'
                        ]
                    );
                }
            }
        }
    } else if (format === 'ORTEC') {
        // ORTEC format: Each loadInstruction is already a single block
        for (const task of tasks) {
            const taskId = task.id;
            const sequence = task.sequence;
            const taskData = task;
            const packageId = task.packageId || null;
            const serialNumber = task.serialNumber || null;
            const pickingLocation = task.pickingLocation || null;

            const taskDataStr = JSON.stringify(taskData);

            if (DB_TYPE === 'postgresql') {
                await query(
                    `INSERT INTO warehouse_tasks 
             (id, warehouse_order_id, sequence, block_data, package_id, serial_number, picking_location, status)
             VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8)`,
                    [
                        taskId,
                        warehouseOrderId,
                        sequence,
                        taskDataStr,
                        packageId,
                        serialNumber,
                        pickingLocation,
                        'PENDING'
                    ]
                );
            } else {
                await query(
                    `INSERT INTO warehouse_tasks 
             (id, warehouse_order_id, sequence, block_data, package_id, serial_number, picking_location, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        taskId,
                        warehouseOrderId,
                        sequence,
                        taskDataStr,
                        packageId,
                        serialNumber,
                        pickingLocation,
                        'PENDING'
                    ]
                );
            }
        }
    }

    return {
        warehouseOrderId,
        tasksCount: totalTasks
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

const { query, queryOne, DB_TYPE } = require('../config/database');

/**
 * Get task by ID
 */
async function getTask(taskId) {
    const row = await queryOne(
        `SELECT * FROM warehouse_tasks WHERE id = ${DB_TYPE === 'postgresql' ? '$1' : '?'}`,
        [taskId]
    );

    if (!row) return null;

    return {
        ...row,
        block_data: typeof row.block_data === 'string' ? JSON.parse(row.block_data) : row.block_data
    };
}

/**
 * Complete a task
 */
async function completeTask(taskId) {
    // Get task info
    const task = await getTask(taskId);
    if (!task) {
        throw new Error('Task not found');
    }

    // Update task status
    if (DB_TYPE === 'postgresql') {
        await query(
            `UPDATE warehouse_tasks 
       SET status = $1, completed_at = NOW()
       WHERE id = $2`,
            ['COMPLETED', taskId]
        );
    } else {
        await query(
            `UPDATE warehouse_tasks 
       SET status = ?, completed_at = datetime('now')
       WHERE id = ?`,
            ['COMPLETED', taskId]
        );
    }

    // Get next task
    const nextTask = await queryOne(
        `SELECT * FROM warehouse_tasks 
     WHERE warehouse_order_id = ${DB_TYPE === 'postgresql' ? '$1' : '?'}
     AND sequence > ${DB_TYPE === 'postgresql' ? '$2' : '?'}
     ORDER BY sequence ASC
     LIMIT 1`,
        [task.warehouse_order_id, task.sequence]
    );

    // Check if all tasks are completed
    const incompleteTasks = await queryOne(
        `SELECT COUNT(*) as count FROM warehouse_tasks 
     WHERE warehouse_order_id = ${DB_TYPE === 'postgresql' ? '$1' : '?'}
     AND status != 'COMPLETED'`,
        [task.warehouse_order_id]
    );

    const allCompleted = parseInt(incompleteTasks.count || 0) === 0;

    // If all completed, mark warehouse order as completed
    if (allCompleted) {
        if (DB_TYPE === 'postgresql') {
            await query(
                `UPDATE warehouse_orders 
         SET status = $1, completed_at = NOW()
         WHERE id = $2`,
                ['COMPLETED', task.warehouse_order_id]
            );
        } else {
            await query(
                `UPDATE warehouse_orders 
         SET status = ?, completed_at = datetime('now')
         WHERE id = ?`,
                ['COMPLETED', task.warehouse_order_id]
            );
        }
    }

    return {
        taskId,
        status: 'COMPLETED',
        nextTask: nextTask ? {
            id: nextTask.id,
            sequence: nextTask.sequence
        } : null,
        warehouseOrderCompleted: allCompleted
    };
}

/**
 * Mark task as in progress
 */
async function startTask(taskId) {
    const task = await getTask(taskId);
    if (!task) {
        throw new Error('Task not found');
    }

    // Only update if status is PENDING
    if (task.status === 'PENDING') {
        if (DB_TYPE === 'postgresql') {
            await query(
                `UPDATE warehouse_tasks 
         SET status = $1, started_at = NOW()
         WHERE id = $2`,
                ['IN_PROGRESS', taskId]
            );
        } else {
            await query(
                `UPDATE warehouse_tasks 
         SET status = ?, started_at = datetime('now')
         WHERE id = ?`,
                ['IN_PROGRESS', taskId]
            );
        }
    }

    return task;
}

/**
 * List tasks with filters and pagination
 */
async function listTasks(filters = {}, pagination = {}) {
    const { status, warehouse_order_id, _start = 0, _end = 25 } = filters;
    const limit = _end - _start;
    const offset = _start;

    // Build WHERE clause
    let whereConditions = [];
    let params = [];
    let paramIndex = 1;

    if (status) {
        whereConditions.push(`status = ${DB_TYPE === 'postgresql' ? `$${paramIndex}` : '?'}`);
        params.push(status);
        paramIndex++;
    }

    if (warehouse_order_id) {
        whereConditions.push(`warehouse_order_id = ${DB_TYPE === 'postgresql' ? `$${paramIndex}` : '?'}`);
        params.push(warehouse_order_id);
        paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await queryOne(
        `SELECT COUNT(*) as count FROM warehouse_tasks ${whereClause}`,
        params
    );
    const total = parseInt(countResult.count || 0);

    // Get paginated results
    const limitClause = DB_TYPE === 'postgresql'
        ? `LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
        : `LIMIT ? OFFSET ?`;

    const result = await query(
        `SELECT * FROM warehouse_tasks ${whereClause} ORDER BY created_at DESC ${limitClause}`,
        [...params, limit, offset]
    );

    const tasks = result.rows.map(row => ({
        ...row,
        block_data: typeof row.block_data === 'string' ? JSON.parse(row.block_data) : row.block_data
    }));

    return { tasks, total };
}

/**
 * Mark task as failed
 */
async function failTask(taskId) {
    const task = await getTask(taskId);
    if (!task) {
        throw new Error('Task not found');
    }

    // Update task status
    if (DB_TYPE === 'postgresql') {
        await query(
            `UPDATE warehouse_tasks 
       SET status = $1, completed_at = NOW()
       WHERE id = $2`,
            ['FAILED', taskId]
        );
    } else {
        await query(
            `UPDATE warehouse_tasks 
       SET status = ?, completed_at = datetime('now')
       WHERE id = ?`,
            ['FAILED', taskId]
        );
    }

    return {
        taskId,
        status: 'FAILED'
    };
}

module.exports = {
    getTask,
    completeTask,
    startTask,
    listTasks,
    failTask
};

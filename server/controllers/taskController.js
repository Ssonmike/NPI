const { query, queryOne, DB_TYPE } = require('../config/database');
const logger = require('../utils/logger');

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

/**
 * Get all tasks with pagination
 */
async function getAllTasks(params = {}) {
    const {
        page = 1,
        perPage = 10,
        sort = 'created_at',
        order = 'DESC',
        status,
        warehouseOrderId
    } = params;

    const offset = (page - 1) * perPage;

    try {
        let query = 'SELECT * FROM warehouse_tasks';
        let countQuery = 'SELECT COUNT(*) as total FROM warehouse_tasks';
        const queryParams = [];
        const conditions = [];

        if (status) {
            conditions.push('status = ?');
            queryParams.push(status);
        }

        if (warehouseOrderId) {
            conditions.push('warehouse_order_id = ?');
            queryParams.push(warehouseOrderId);
        }

        if (conditions.length > 0) {
            const whereClause = ' WHERE ' + conditions.join(' AND ');
            query += whereClause;
            countQuery += whereClause;
        }

        query += ` ORDER BY ${sort} ${order} LIMIT ? OFFSET ?`;
        queryParams.push(perPage, offset);

        const db = getDatabase();
        const tasks = await new Promise((resolve, reject) => {
            db.all(query, queryParams, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        const countParams = queryParams.slice(0, queryParams.length - 2);
        const totalResult = await new Promise((resolve, reject) => {
            db.get(countQuery, countParams, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        return {
            data: tasks.map(task => ({
                id: task.id,
                taskId: task.id,
                warehouse_order_id: task.warehouse_order_id,
                sequence: task.sequence,
                status: task.status,
                picking_location: task.picking_location,
                serial_number: task.serial_number,
                task_url: task.task_url,
                block_data: JSON.parse(task.block_data),
                completed_at: task.completed_at,
                created_at: task.created_at,
                updated_at: task.updated_at
            })),
            total: totalResult.total
        };
    } catch (err) {
        logger.error('Error getting all tasks:', err);
        throw err;
    }
}

/**
 * Get single task
 */
async function getTask(taskId) {
    try {
        const db = getDatabase();
        const task = await new Promise((resolve, reject) => {
            db.get(
                'SELECT * FROM warehouse_tasks WHERE id = ?',
                [taskId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        if (!task) return null;

        return {
            id: task.id,
            taskId: task.id,
            warehouse_order_id: task.warehouse_order_id,
            sequence: task.sequence,
            status: task.status,
            picking_location: task.picking_location,
            serial_number: task.serial_number,
            task_url: task.task_url,
            block_data: JSON.parse(task.block_data),
            completed_at: task.completed_at,
            created_at: task.created_at,
            updated_at: task.updated_at
        };
    } catch (err) {
        logger.error('Error getting task:', err);
        throw err;
    }
}

module.exports = {
    getTask,
    completeTask,
    startTask,
    listTasks,
    failTask,
    getAllTasks
};

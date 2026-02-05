const express = require('express');
const router = express.Router();
const { completeTask, getTask, listTasks, failTask } = require('../controllers/taskController');
const { getWarehouseTasks } = require('../controllers/warehouseOrderController');
const { generateTaskUrl } = require('../utils/urlGenerator');
const logger = require('../utils/logger');

/**
 * GET /api/tasks
 * List all tasks with filters and pagination
 */
router.get('/', async (req, res, next) => {
    try {
        const filters = {
            status: req.query.status,
            warehouse_order_id: req.query.warehouse_order_id,
            _start: parseInt(req.query._start || 0),
            _end: parseInt(req.query._end || 25),
        };

        logger.info('Listing tasks with filters:', filters);

        const { tasks, total } = await listTasks(filters);

        // Set total count header for React Admin
        res.set('X-Total-Count', total);
        res.set('Access-Control-Expose-Headers', 'X-Total-Count');

        res.json(tasks);
    } catch (err) {
        next(err);
    }
});

/**
 * POST /api/tasks/:taskId/complete
 * Mark a task as completed
 */
router.post('/:taskId/complete', async (req, res, next) => {
    try {
        const { taskId } = req.params;

        logger.info('Completing task:', taskId);

        const result = await completeTask(taskId);

        const response = {
            success: true,
            taskId: result.taskId,
            status: result.status,
            warehouseOrderCompleted: result.warehouseOrderCompleted
        };

        // Add next task info if available
        if (result.nextTask) {
            const task = await getTask(result.nextTask.id);
            response.nextTaskId = result.nextTask.id;
            response.nextTaskSequence = result.nextTask.sequence;
            response.nextTaskUrl = `/${task.warehouse_order_id}/task/${result.nextTask.id}`;
        }

        logger.info(`Task completed: ${taskId}, Next: ${result.nextTask?.id || 'none'}`);

        res.json(response);
    } catch (err) {
        if (err.message === 'Task not found') {
            return res.status(404).json({
                success: false,
                error: 'Task not found'
            });
        }
        next(err);
    }
});

/**
 * GET /api/tasks/:taskId
 * Get task by ID
 */
router.get('/:taskId', async (req, res, next) => {
    try {
        const { taskId } = req.params;

        const task = await getTask(taskId);

        if (!task) {
            return res.status(404).json({
                success: false,
                error: 'Task not found'
            });
        }

        res.json({
            id: task.id,
            warehouseOrderId: task.warehouse_order_id,
            sequence: task.sequence,
            block_data: task.block_data,
            status: task.status,
            pickingLocation: task.picking_location,
            serialNumber: task.serial_number
        });
    } catch (err) {
        next(err);
    }
});

/**
 * POST /api/tasks/:taskId/fail
 * Mark a task as failed
 */
router.post('/:taskId/fail', async (req, res, next) => {
    try {
        const { taskId } = req.params;

        logger.info('Failing task:', taskId);

        const result = await failTask(taskId);

        res.json({
            success: true,
            ...result
        });
    } catch (err) {
        if (err.message === 'Task not found') {
            return res.status(404).json({
                success: false,
                error: 'Task not found'
            });
        }
        next(err);
    }
});

module.exports = router;

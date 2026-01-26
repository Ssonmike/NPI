const express = require('express');
const router = express.Router();
const { completeTask, getTask } = require('../controllers/taskController');
const { getWarehouseTasks } = require('../controllers/warehouseOrderController');
const { generateTaskUrl } = require('../utils/urlGenerator');
const logger = require('../utils/logger');

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

module.exports = router;

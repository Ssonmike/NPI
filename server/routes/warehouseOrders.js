const express = require('express');
const router = express.Router();
const validateOrtecJSON = require('../middleware/validateOrtecJSON');
const {
    createWarehouseOrder,
    getWarehouseOrder,
    getWarehouseTasks,
    getTaskBySequence
} = require('../controllers/warehouseOrderController');
const { generateTaskUrls } = require('../utils/urlGenerator');
const logger = require('../utils/logger');

/**
 * POST /api/warehouse-orders
 * Create a new warehouse order with tasks
 */
router.post('/', validateOrtecJSON, async (req, res, next) => {
    try {
        const ortecData = req.body;

        logger.info('Creating warehouse order:', ortecData.resourceId);

        // Create warehouse order and tasks
        const result = await createWarehouseOrder(ortecData);

        // Get all tasks to generate URLs
        const tasks = await getWarehouseTasks(result.warehouseOrderId);
        const urls = generateTaskUrls(result.warehouseOrderId, tasks);

        logger.info(`Warehouse order created: ${result.warehouseOrderId} with ${result.tasksCount} tasks`);

        res.status(201).json({
            success: true,
            warehouseOrderId: result.warehouseOrderId,
            tasksCount: result.tasksCount,
            urls
        });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/warehouse-orders/:id
 * Get warehouse order by ID
 */
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;

        const warehouseOrder = await getWarehouseOrder(id);

        if (!warehouseOrder) {
            return res.status(404).json({
                success: false,
                error: 'Warehouse order not found'
            });
        }

        res.json(warehouseOrder.ortec_data);
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/warehouse-orders/:id/tasks/:sequence
 * Get task by warehouse order ID and sequence number
 */
router.get('/:id/tasks/:sequence', async (req, res, next) => {
    try {
        const { id, sequence } = req.params;

        const task = await getTaskBySequence(id, parseInt(sequence));

        if (!task) {
            return res.status(404).json({
                success: false,
                error: 'Task not found'
            });
        }

        res.json({
            id: task.id,
            sequence: task.sequence,
            block_data: task.block_data,
            status: task.status,
            url: `/${id}/task/${task.id}`
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;

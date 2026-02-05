const express = require('express');
const router = express.Router();
const validateWarehouseOrderJSON = require('../middleware/validateWarehouseOrderJSON');
const {
    createWarehouseOrder,
    getWarehouseOrder,
    getWarehouseTasks,
    getTaskBySequence,
    listWarehouseOrders,
    retryWarehouseOrder
} = require('../controllers/warehouseOrderController');
const { generateTaskUrls } = require('../utils/urlGenerator');
const logger = require('../utils/logger');

/**
 * GET /api/warehouse-orders
 * List all warehouse orders with filters and pagination
 */
router.get('/', async (req, res, next) => {
    try {
        const filters = {
            status: req.query.status,
            _start: parseInt(req.query._start || 0),
            _end: parseInt(req.query._end || 25),
        };

        logger.info('Listing warehouse orders with filters:', filters);

        const { orders, total } = await listWarehouseOrders(filters);

        // Set total count header for React Admin
        res.set('X-Total-Count', total);
        res.set('Access-Control-Expose-Headers', 'X-Total-Count');

        res.json(orders);
    } catch (err) {
        next(err);
    }
});

/**
 * POST /api/warehouse-orders
 * Create a new warehouse order with tasks
 */
router.post('/', validateWarehouseOrderJSON, async (req, res, next) => {
    try {
        const payload = req.body;
        const format = req.warehouseOrderFormat; // Attached by middleware

        logger.info(`Creating warehouse order (${format} format):`, payload.warehouseOrderId || payload.resourceId);

        // Create warehouse order and tasks
        const result = await createWarehouseOrder(payload, format);

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

/**
 * POST /api/warehouse-orders/:id/retry
 * Retry a failed warehouse order
 */
router.post('/:id/retry', async (req, res, next) => {
    try {
        const { id } = req.params;

        logger.info('Retrying warehouse order:', id);

        const result = await retryWarehouseOrder(id);

        res.json({
            success: true,
            ...result
        });
    } catch (err) {
        if (err.message === 'Warehouse order not found') {
            return res.status(404).json({
                success: false,
                error: 'Warehouse order not found'
            });
        }
        next(err);
    }
});

module.exports = router;

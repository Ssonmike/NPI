const express = require('express');
const router = express.Router();
const {
    createWarehouseOrder,
    getWarehouseOrder,
    getAllWarehouseOrders,
    getWarehouseTasks,
    deleteWarehouseOrder,
    deleteManyWarehouseOrders
} = require('../controllers/warehouseOrderController');
const validateWarehouseOrder = require('../middleware/validateOrtecJSON');
const logger = require('../utils/logger');

/**
 * GET /api/warehouse-orders
 * List all warehouse orders (for React Admin)
 */
router.get('/', async (req, res, next) => {
    try {
        logger.info('Listing all warehouse orders');

        const page = parseInt(req.query._page) || 1;
        const perPage = parseInt(req.query._perPage) || 10;
        const sort = req.query._sort || 'created_at';
        const order = req.query._order || 'DESC';
        const status = req.query.status;

        const result = await getAllWarehouseOrders({
            page,
            perPage,
            sort,
            order,
            status
        });

        res.set('Content-Range', `warehouse-orders ${(page - 1) * perPage}-${page * perPage}/${result.total}`);
        res.set('Access-Control-Expose-Headers', 'Content-Range');

        res.json(result.data);
    } catch (err) {
        next(err);
    }
});

/**
 * POST /api/warehouse-orders
 * Accepts both SAP and ORTEC formats
 */
router.post('/', validateWarehouseOrder, async (req, res, next) => {
    try {
        logger.info('Creating warehouse order');
        const result = await createWarehouseOrder(req.body);
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/warehouse-orders/:id
 */
router.get('/:id', async (req, res, next) => {
    try {
        const warehouseOrder = await getWarehouseOrder(req.params.id);
        if (!warehouseOrder) {
            return res.status(404).json({ error: 'NOT_FOUND' });
        }
        res.json(warehouseOrder);
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/warehouse-orders/:id/tasks
 */
router.get('/:id/tasks', async (req, res, next) => {
    try {
        const tasks = await getWarehouseTasks(req.params.id);
        res.json(tasks);
    } catch (err) {
        next(err);
    }
});

/**
 * DELETE /api/warehouse-orders/:id
 * Delete a single warehouse order
 */
router.delete('/:id', async (req, res, next) => {
    try {
        logger.info('Deleting warehouse order:', req.params.id);
        const result = await deleteWarehouseOrder(req.params.id);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

/**
 * DELETE /api/warehouse-orders
 * Delete multiple warehouse orders (bulk delete)
 */
router.delete('/', async (req, res, next) => {
    try {
        const ids = req.query.ids ? req.query.ids.split(',') : [];

        if (ids.length === 0) {
            return res.status(400).json({ error: 'No IDs provided' });
        }

        logger.info('Bulk deleting warehouse orders:', ids);
        const result = await deleteManyWarehouseOrders(ids);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
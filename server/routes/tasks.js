const express = require('express');
const router = express.Router();
const {
    completeTask,
    getAllTasks,
    getTask,
    deleteTask,
    deleteManyTasks
} = require('../controllers/taskController');
const logger = require('../utils/logger');

/**
 * GET /api/tasks
 */
router.get('/', async (req, res, next) => {
    try {
        const page = parseInt(req.query._page) || 1;
        const perPage = parseInt(req.query._perPage) || 10;
        const sort = req.query._sort || 'created_at';
        const order = req.query._order || 'DESC';
        const status = req.query.status;
        const warehouseOrderId = req.query.warehouse_order_id;

        const result = await getAllTasks({
            page,
            perPage,
            sort,
            order,
            status,
            warehouseOrderId
        });

        res.set('Content-Range', `tasks ${(page - 1) * perPage}-${page * perPage}/${result.total}`);
        res.set('Access-Control-Expose-Headers', 'Content-Range');

        res.json(result.data);
    } catch (err) {
        next(err);
    }
});

/**
 * GET /api/tasks/:id
 */
router.get('/:id', async (req, res, next) => {
    try {
        const task = await getTask(req.params.id);
        if (!task) {
            return res.status(404).json({ error: 'NOT_FOUND' });
        }
        res.json(task);
    } catch (err) {
        next(err);
    }
});

/**
 * POST /api/tasks/:taskId/complete
 */
router.post('/:taskId/complete', async (req, res, next) => {
    try {
        const result = await completeTask(req.params.taskId);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

/**
 * DELETE /api/tasks/:id
 * Delete a single task
 */
router.delete('/:id', async (req, res, next) => {
    try {
        logger.info('Deleting task:', req.params.id);
        const result = await deleteTask(req.params.id);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

/**
 * DELETE /api/tasks
 * Delete multiple tasks (bulk delete)
 */
router.delete('/', async (req, res, next) => {
    try {
        const ids = req.query.ids ? req.query.ids.split(',') : [];

        if (ids.length === 0) {
            return res.status(400).json({ error: 'No IDs provided' });
        }

        logger.info('Bulk deleting tasks:', ids);
        const result = await deleteManyTasks(ids);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const { healthCheck } = require('../config/database');
const { getActiveWarehouseOrdersCount } = require('../controllers/warehouseOrderController');

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/', async (req, res) => {
    const dbHealthy = await healthCheck();
    const activeOrders = await getActiveWarehouseOrdersCount();

    const status = dbHealthy ? 'ok' : 'degraded';
    const statusCode = dbHealthy ? 200 : 503;

    res.status(statusCode).json({
        status,
        uptime: process.uptime(),
        database: dbHealthy ? 'connected' : 'disconnected',
        activeWarehouseOrders: activeOrders,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

module.exports = router;

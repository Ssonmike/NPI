const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const logger = require('../utils/logger');

/**
 * GET /api/dashboard/stats
 * Get dashboard statistics
 */
router.get('/stats', async (req, res, next) => {
    try {
        logger.info('Fetching dashboard stats');
        const stats = await getDashboardStats();
        res.json(stats);
    } catch (err) {
        next(err);
    }
});

module.exports = router;

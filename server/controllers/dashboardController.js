const { query, queryOne, DB_TYPE } = require('../config/database');

/**
 * Get dashboard statistics
 */
async function getDashboardStats() {
    try {
        // Get active orders count
        const activeOrdersResult = await queryOne(
            `SELECT COUNT(*) as count FROM warehouse_orders WHERE status = 'ACTIVE'`
        );
        const activeOrders = parseInt(activeOrdersResult.count || 0);

        // Get pending tasks count
        const pendingTasksResult = await queryOne(
            `SELECT COUNT(*) as count FROM warehouse_tasks WHERE status = 'PENDING'`
        );
        const pendingTasks = parseInt(pendingTasksResult.count || 0);

        // Get completed tasks today
        const completedTodayResult = await queryOne(
            DB_TYPE === 'postgresql'
                ? `SELECT COUNT(*) as count FROM warehouse_tasks 
           WHERE status = 'COMPLETED' 
           AND DATE(completed_at) = CURRENT_DATE`
                : `SELECT COUNT(*) as count FROM warehouse_tasks 
           WHERE status = 'COMPLETED' 
           AND DATE(completed_at) = DATE('now')`
        );
        const completedToday = parseInt(completedTodayResult.count || 0);

        // Get failed tasks today
        const failedTodayResult = await queryOne(
            DB_TYPE === 'postgresql'
                ? `SELECT COUNT(*) as count FROM warehouse_tasks 
           WHERE status = 'FAILED' 
           AND DATE(completed_at) = CURRENT_DATE`
                : `SELECT COUNT(*) as count FROM warehouse_tasks 
           WHERE status = 'FAILED' 
           AND DATE(completed_at) = DATE('now')`
        );
        const failedToday = parseInt(failedTodayResult.count || 0);

        // Get last 10 completed tasks
        const recentTasksResult = await query(
            `SELECT id, warehouse_order_id, sequence, completed_at 
       FROM warehouse_tasks 
       WHERE status = 'COMPLETED' 
       ORDER BY completed_at DESC 
       LIMIT 10`
        );
        const recentTasks = recentTasksResult.rows || [];

        return {
            activeOrders,
            pendingTasks,
            completedToday,
            failedToday,
            recentTasks,
        };
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error;
    }
}

module.exports = {
    getDashboardStats,
};

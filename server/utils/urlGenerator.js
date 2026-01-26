/**
 * Generate URL for a task
 */
function generateTaskUrl(warehouseOrderId, taskId) {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/${warehouseOrderId}/task/${taskId}`;
}

/**
 * Generate URLs for all tasks in a warehouse order
 */
function generateTaskUrls(warehouseOrderId, tasks) {
    return tasks.map(task => ({
        taskId: task.id,
        sequence: task.sequence,
        url: generateTaskUrl(warehouseOrderId, task.id)
    }));
}

module.exports = {
    generateTaskUrl,
    generateTaskUrls
};

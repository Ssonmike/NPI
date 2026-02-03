/**
 * Format Detection for Warehouse Orders
 * Detects whether input is SAP or ORTEC format
 */

/**
 * Detect the format of a warehouse order payload
 * @param {Object} payload - Raw warehouse order JSON
 * @returns {'SAP' | 'ORTEC' | 'UNKNOWN'} - Detected format
 */
export function detectFormat(payload) {
    if (!payload || typeof payload !== 'object') {
        return 'UNKNOWN';
    }

    // SAP format: has warehouseOrderId and tasks array
    if (payload.warehouseOrderId && Array.isArray(payload.tasks)) {
        return 'SAP';
    }

    // ORTEC format: has resourceId and loadInstructions array
    if (payload.resourceId && Array.isArray(payload.loadInstructions)) {
        return 'ORTEC';
    }

    return 'UNKNOWN';
}

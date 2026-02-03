/**
 * Validate Warehouse Order JSON (SAP or ORTEC format)
 */

// Inline format detection
function detectFormat(payload) {
    if (!payload || typeof payload !== 'object') {
        return 'UNKNOWN';
    }
    if (payload.warehouseOrderId && Array.isArray(payload.tasks)) {
        return 'SAP';
    }
    if (payload.resourceId && Array.isArray(payload.loadInstructions)) {
        return 'ORTEC';
    }
    return 'UNKNOWN';
}

function validateWarehouseOrderJSON(req, res, next) {
    const data = req.body;

    // Check if body exists
    if (!data || typeof data !== 'object') {
        return res.status(400).json({
            success: false,
            error: 'Invalid request body. Expected JSON object.'
        });
    }

    // Detect format
    const format = detectFormat(data);

    if (format === 'UNKNOWN') {
        return res.status(400).json({
            success: false,
            error: 'Unknown warehouse order format. Expected SAP (warehouseOrderId + tasks) or ORTEC (resourceId + loadInstructions) format.'
        });
    }

    // Basic validation based on format
    if (format === 'SAP') {
        if (!data.pallet || typeof data.pallet !== 'object') {
            return res.status(400).json({
                success: false,
                error: 'SAP format: Missing or invalid "pallet" object.'
            });
        }
        if (!Array.isArray(data.tasks) || data.tasks.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'SAP format: Missing or empty "tasks" array.'
            });
        }
    } else if (format === 'ORTEC') {
        if (!data.resource || !data.resource.pallet) {
            return res.status(400).json({
                success: false,
                error: 'ORTEC format: Missing "resource.pallet" object.'
            });
        }
        if (!Array.isArray(data.loadInstructions) || data.loadInstructions.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'ORTEC format: Missing or empty "loadInstructions" array.'
            });
        }
    }

    // Attach format to request for use in controller
    req.warehouseOrderFormat = format;

    // All validations passed
    next();
}

module.exports = validateWarehouseOrderJSON;

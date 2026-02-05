/**
 * Validate warehouse order JSON structure
 * Supports both SAP and ORTEC formats
 */
function validateWarehouseOrder(req, res, next) {
    const data = req.body;

    // Check if body exists
    if (!data || typeof data !== 'object') {
        return res.status(400).json({
            success: false,
            error: 'Invalid request body. Expected JSON object.'
        });
    }

    // Detect format
    const isSAP = data.warehouseOrderId && data.tasks;
    const isORTEC = data.resourceId && data.loadInstructions;

    if (!isSAP && !isORTEC) {
        return res.status(400).json({
            success: false,
            error: 'Invalid format. Expected SAP format (warehouseOrderId + tasks) or ORTEC format (resourceId + loadInstructions).'
        });
    }

    // ========== SAP FORMAT VALIDATION ==========
    if (isSAP) {
        // Validate warehouseOrderId
        if (typeof data.warehouseOrderId !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Missing or invalid "warehouseOrderId" field. Must be a string.'
            });
        }

        // Validate pallet
        if (!data.pallet || typeof data.pallet !== 'object') {
            return res.status(400).json({
                success: false,
                error: 'Missing "pallet" object in SAP format.'
            });
        }

        const pallet = data.pallet;
        const requiredPalletFields = ['length', 'width', 'height', 'maxHeight'];

        for (const field of requiredPalletFields) {
            if (typeof pallet[field] !== 'number') {
                return res.status(400).json({
                    success: false,
                    error: `Missing or invalid "pallet.${field}". Must be a number.`
                });
            }
        }

        // Validate tasks array
        if (!Array.isArray(data.tasks) || data.tasks.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Missing or empty "tasks" array. Must contain at least one task.'
            });
        }

        // Validate each task
        for (let i = 0; i < data.tasks.length; i++) {
            const task = data.tasks[i];

            if (!task.taskId || typeof task.taskId !== 'string') {
                return res.status(400).json({
                    success: false,
                    error: `tasks[${i}] missing required field "taskId" (string).`
                });
            }

            if (typeof task.sequence !== 'number') {
                return res.status(400).json({
                    success: false,
                    error: `tasks[${i}].sequence must be a number.`
                });
            }

            if (!Array.isArray(task.boxes) || task.boxes.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: `tasks[${i}] missing or empty "boxes" array.`
                });
            }

            // Validate boxes
            for (let j = 0; j < task.boxes.length; j++) {
                const box = task.boxes[j];
                const coords = ['x1', 'x2', 'y1', 'y2', 'z1', 'z2'];

                for (const coord of coords) {
                    if (typeof box[coord] !== 'number') {
                        return res.status(400).json({
                            success: false,
                            error: `tasks[${i}].boxes[${j}].${coord} must be a number.`
                        });
                    }
                }
            }
        }

        // SAP format is valid
        return next();
    }

    // ========== ORTEC FORMAT VALIDATION ==========
    if (isORTEC) {
        // Validate resourceId
        if (typeof data.resourceId !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Missing or invalid "resourceId" field. Must be a string.'
            });
        }

        // Validate resource.pallet
        if (!data.resource || !data.resource.pallet) {
            return res.status(400).json({
                success: false,
                error: 'Missing "resource.pallet" object.'
            });
        }

        const pallet = data.resource.pallet;
        const requiredPalletFields = ['length', 'width', 'height', 'maxHeight'];

        for (const field of requiredPalletFields) {
            if (typeof pallet[field] !== 'number') {
                return res.status(400).json({
                    success: false,
                    error: `Missing or invalid "resource.pallet.${field}". Must be a number.`
                });
            }
        }

        // Validate loadInstructions
        if (!Array.isArray(data.loadInstructions) || data.loadInstructions.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Missing or empty "loadInstructions" array. Must contain at least one instruction.'
            });
        }

        // Validate each instruction
        const requiredInstructionFields = ['id', 'sequence', 'x1', 'x2', 'y1', 'y2', 'z1', 'z2'];

        for (let i = 0; i < data.loadInstructions.length; i++) {
            const instruction = data.loadInstructions[i];

            for (const field of requiredInstructionFields) {
                if (instruction[field] === undefined || instruction[field] === null) {
                    return res.status(400).json({
                        success: false,
                        error: `loadInstructions[${i}] missing required field "${field}".`
                    });
                }
            }

            // Validate sequence is a number
            if (typeof instruction.sequence !== 'number') {
                return res.status(400).json({
                    success: false,
                    error: `loadInstructions[${i}].sequence must be a number.`
                });
            }

            // Validate coordinates are numbers
            const coords = ['x1', 'x2', 'y1', 'y2', 'z1', 'z2'];
            for (const coord of coords) {
                if (typeof instruction[coord] !== 'number') {
                    return res.status(400).json({
                        success: false,
                        error: `loadInstructions[${i}].${coord} must be a number.`
                    });
                }
            }
        }

        // ORTEC format is valid
        return next();
    }
}

module.exports = validateWarehouseOrder;

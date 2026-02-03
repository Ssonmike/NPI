/**
 * Validators for SAP and ORTEC warehouse order formats
 */

/**
 * Validate SAP format warehouse order
 * @param {Object} payload - SAP warehouse order JSON
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateSAP(payload) {
    const errors = [];

    // Check required top-level fields
    if (!payload.warehouseOrderId || typeof payload.warehouseOrderId !== 'string') {
        errors.push('Missing or invalid "warehouseOrderId" (must be string)');
    }

    if (!payload.pallet || typeof payload.pallet !== 'object') {
        errors.push('Missing or invalid "pallet" object');
    } else {
        // Validate pallet dimensions
        const requiredPalletFields = ['length', 'width', 'height', 'maxHeight'];
        for (const field of requiredPalletFields) {
            if (typeof payload.pallet[field] !== 'number') {
                errors.push(`Missing or invalid "pallet.${field}" (must be number)`);
            }
        }
    }

    // Validate tasks array
    if (!Array.isArray(payload.tasks) || payload.tasks.length === 0) {
        errors.push('Missing or empty "tasks" array (must contain at least one task)');
    } else {
        // Validate each task
        payload.tasks.forEach((task, index) => {
            if (!task.taskId || typeof task.taskId !== 'string') {
                errors.push(`tasks[${index}]: Missing or invalid "taskId" (must be string)`);
            }

            if (typeof task.sequence !== 'number') {
                errors.push(`tasks[${index}]: Missing or invalid "sequence" (must be number)`);
            }

            // Validate boxes array
            if (!Array.isArray(task.boxes) || task.boxes.length === 0) {
                errors.push(`tasks[${index}]: Missing or empty "boxes" array`);
            } else {
                // Check quantity vs boxes.length mismatch (warning, not error)
                if (task.quantity && task.quantity !== task.boxes.length) {
                    console.warn(
                        `tasks[${index}]: quantity (${task.quantity}) !== boxes.length (${task.boxes.length}). Using boxes.length as source of truth.`
                    );
                }

                // Validate each box
                task.boxes.forEach((box, boxIndex) => {
                    const requiredCoords = ['x1', 'x2', 'y1', 'y2', 'z1', 'z2'];
                    for (const coord of requiredCoords) {
                        if (typeof box[coord] !== 'number') {
                            errors.push(`tasks[${index}].boxes[${boxIndex}]: Missing or invalid "${coord}" (must be number)`);
                        }
                    }
                });
            }
        });
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Validate ORTEC format warehouse order
 * @param {Object} payload - ORTEC warehouse order JSON
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateORTEC(payload) {
    const errors = [];

    // Check required top-level fields
    if (!payload.resourceId || typeof payload.resourceId !== 'string') {
        errors.push('Missing or invalid "resourceId" (must be string)');
    }

    if (!payload.resource || !payload.resource.pallet) {
        errors.push('Missing "resource.pallet" object');
    } else {
        // Validate pallet dimensions
        const requiredPalletFields = ['length', 'width', 'height', 'maxHeight'];
        for (const field of requiredPalletFields) {
            if (typeof payload.resource.pallet[field] !== 'number') {
                errors.push(`Missing or invalid "resource.pallet.${field}" (must be number)`);
            }
        }
    }

    // Validate loadInstructions array
    if (!Array.isArray(payload.loadInstructions) || payload.loadInstructions.length === 0) {
        errors.push('Missing or empty "loadInstructions" array (must contain at least one instruction)');
    } else {
        // Validate each instruction
        payload.loadInstructions.forEach((instruction, index) => {
            if (!instruction.id) {
                errors.push(`loadInstructions[${index}]: Missing "id"`);
            }

            if (typeof instruction.sequence !== 'number') {
                errors.push(`loadInstructions[${index}]: Missing or invalid "sequence" (must be number)`);
            }

            // Validate coordinates
            const requiredCoords = ['x1', 'x2', 'y1', 'y2', 'z1', 'z2'];
            for (const coord of requiredCoords) {
                if (typeof instruction[coord] !== 'number') {
                    errors.push(`loadInstructions[${index}]: Missing or invalid "${coord}" (must be number)`);
                }
            }
        });
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

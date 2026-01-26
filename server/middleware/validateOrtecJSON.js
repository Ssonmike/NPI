/**
 * Validate Ortec JSON structure
 */
function validateOrtecJSON(req, res, next) {
    const data = req.body;

    // Check if body exists
    if (!data || typeof data !== 'object') {
        return res.status(400).json({
            success: false,
            error: 'Invalid request body. Expected JSON object.'
        });
    }

    // Validate resourceId
    if (!data.resourceId || typeof data.resourceId !== 'string') {
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

    // All validations passed
    next();
}

module.exports = validateOrtecJSON;

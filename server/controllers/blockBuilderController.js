/**
 * Block Builder Controller
 * 
 * API controller for Block Builder service
 */

const blockBuilder = require('../services/blockBuilder');

/**
 * POST /api/block-builder
 * Build optimized blocks from ORTEC result
 */
async function buildBlocks(req, res) {
    try {
        const { ortecResult } = req.body;

        if (!ortecResult) {
            return res.status(400).json({
                success: false,
                error: 'Missing ortecResult in request body'
            });
        }

        console.log('📥 Received ORTEC result for Block Builder');

        const result = blockBuilder.buildBlocks(ortecResult);

        res.json({
            success: true,
            blocks: result.blocks,
            statistics: result.statistics,
            ortecResult: ortecResult
        });

    } catch (error) {
        console.error('❌ Block Builder Error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

module.exports = { buildBlocks };

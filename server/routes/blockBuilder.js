/**
 * Block Builder Routes
 */

const express = require('express');
const router = express.Router();
const { buildBlocks } = require('../controllers/blockBuilderController');

// POST /api/block-builder
router.post('/', buildBlocks);

module.exports = router;

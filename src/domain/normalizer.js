/**
 * Warehouse Order Normalizer
 * Single entry point for converting any format to NormalizedWarehouseOrder
 */

import { detectFormat } from './formatDetector.js';
import { validateSAP, validateORTEC } from './validators.js';
import { sapAdapter } from './adapters/sapAdapter.js';
import { ortecAdapter } from './adapters/ortecAdapter.js';

/**
 * Normalize a warehouse order payload to internal format
 * @param {Object|string} input - Raw warehouse order JSON (object or string)
 * @returns {Object} NormalizedWarehouseOrder
 * @throws {Error} If format is unknown or validation fails
 */
export function normalizeWarehouseOrder(input) {
    // Parse if string
    let payload;
    if (typeof input === 'string') {
        try {
            payload = JSON.parse(input.trim());
        } catch (e) {
            throw new Error(`Invalid JSON: ${e.message}`);
        }
    } else {
        payload = input;
    }

    // Detect format
    const format = detectFormat(payload);

    if (format === 'SAP') {
        // Validate SAP format
        const validation = validateSAP(payload);
        if (!validation.valid) {
            throw new Error(`SAP validation failed: ${validation.errors.join(', ')}`);
        }
        // Convert to normalized format
        return sapAdapter(payload);
    }

    if (format === 'ORTEC') {
        // Validate ORTEC format
        const validation = validateORTEC(payload);
        if (!validation.valid) {
            throw new Error(`ORTEC validation failed: ${validation.errors.join(', ')}`);
        }
        // Convert to normalized format
        return ortecAdapter(payload);
    }

    throw new Error(`Unknown warehouse order format. Expected SAP or ORTEC format.`);
}

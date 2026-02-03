/**
 * SAP Format Adapter
 * Converts SAP warehouse order format to NormalizedWarehouseOrder
 */

import { stableHash } from '../utils/stableHash.js';

/**
 * Convert SAP format to NormalizedWarehouseOrder
 * @param {Object} payload - SAP warehouse order JSON
 * @returns {Object} NormalizedWarehouseOrder
 */
export function sapAdapter(payload) {
    const { warehouseOrderId, uom = 'mm', pallet, tasks } = payload;

    // Normalize pallet
    const normalizedPallet = {
        typePallet: pallet.typePallet || pallet.name || 'Unknown Pallet',
        length: pallet.length,
        width: pallet.width,
        height: pallet.height,
        maxHeight: pallet.maxHeight
    };

    // Normalize tasks
    const normalizedTasks = tasks.map(task => {
        const {
            taskId,
            sequence,
            sourceLocation,
            sku,
            packageId,
            quantity,
            boxes
        } = task;

        // Generate stable packageId if missing
        const stablePackageId = packageId || stableHash(warehouseOrderId, taskId, sequence.toString());

        // Normalize boxes (already have explicit coordinates)
        const normalizedBoxes = boxes.map((box, index) => ({
            boxId: box.boxId || `${taskId}-${index + 1}`,
            x1: box.x1,
            x2: box.x2,
            y1: box.y1,
            y2: box.y2,
            z1: box.z1,
            z2: box.z2,
            meta: {
                boxIndex: box.boxIndex || index + 1,
                parentId: box.parentId || stablePackageId
            }
        }));

        return {
            taskId,
            sequence,
            sourceLocation: sourceLocation || null,
            sku: sku || null,
            packageId: stablePackageId,
            quantity: boxes.length, // Source of truth is boxes.length
            boxes: normalizedBoxes
        };
    });

    return {
        warehouseOrderId,
        uom,
        pallet: normalizedPallet,
        tasks: normalizedTasks
    };
}

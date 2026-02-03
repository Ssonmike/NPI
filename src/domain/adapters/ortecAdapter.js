/**
 * ORTEC Format Adapter
 * Converts ORTEC warehouse order format to NormalizedWarehouseOrder
 */

import { stableHash } from '../utils/stableHash.js';

/**
 * Convert ORTEC format to NormalizedWarehouseOrder
 * @param {Object} payload - ORTEC warehouse order JSON
 * @returns {Object} NormalizedWarehouseOrder
 */
export function ortecAdapter(payload) {
    const { resourceId, resource, loadInstructions } = payload;

    // Extract pallet info
    const palletRaw = resource.pallet || {};
    const uom = palletRaw.sizeUom || 'mm';

    // Normalize pallet
    const normalizedPallet = {
        typePallet: palletRaw.name || 'Unknown Pallet',
        length: palletRaw.length || 1200,
        width: palletRaw.width || 800,
        height: palletRaw.height || 144,
        maxHeight: palletRaw.maxHeight || 2000
    };

    // Normalize tasks (from loadInstructions)
    const normalizedTasks = loadInstructions.map(instruction => {
        const {
            id,
            sequence,
            x1, x2, y1, y2, z1, z2,
            quantityX = 1,
            quantityY = 1,
            quantityZ = 1,
            packageId,
            serialNumber,
            pickingLocation
        } = instruction;

        // Generate stable packageId if missing
        const stablePackageId = packageId || stableHash(resourceId, id, sequence.toString());

        // Calculate box dimensions
        const totalWidth = Math.abs(x2 - x1);
        const totalDepth = Math.abs(y2 - y1);
        const totalHeight = Math.abs(z2 - z1);

        const boxWidth = quantityX > 0 ? totalWidth / quantityX : totalWidth;
        const boxDepth = quantityY > 0 ? totalDepth / quantityY : totalDepth;
        const boxHeight = quantityZ > 0 ? totalHeight / quantityZ : totalHeight;

        const startX = Math.min(x1, x2);
        const startY = Math.min(y1, y2);
        const startZ = Math.min(z1, z2);

        // Expand quantityX/Y/Z into individual boxes
        const boxes = [];
        let boxIndex = 1;

        for (let z = 0; z < quantityZ; z++) {
            for (let y = 0; y < quantityY; y++) {
                for (let x = 0; x < quantityX; x++) {
                    const box_x1 = startX + (x * boxWidth);
                    const box_x2 = box_x1 + boxWidth;
                    const box_y1 = startY + (y * boxDepth);
                    const box_y2 = box_y1 + boxDepth;
                    const box_z1 = startZ + (z * boxHeight);
                    const box_z2 = box_z1 + boxHeight;

                    boxes.push({
                        boxId: `${id}-${boxIndex}`,
                        x1: box_x1,
                        x2: box_x2,
                        y1: box_y1,
                        y2: box_y2,
                        z1: box_z1,
                        z2: box_z2,
                        meta: {
                            boxIndex,
                            parentId: stablePackageId,
                            xIndex: x,
                            yIndex: y,
                            zIndex: z
                        }
                    });

                    boxIndex++;
                }
            }
        }

        return {
            taskId: id,
            sequence,
            sourceLocation: pickingLocation || null,
            sku: serialNumber || null,
            packageId: stablePackageId,
            quantity: boxes.length,
            boxes
        };
    });

    return {
        warehouseOrderId: resourceId,
        uom,
        pallet: normalizedPallet,
        tasks: normalizedTasks
    };
}

/**
 * Steps Builder
 * Builds render steps from normalized warehouse order
 * Each step represents a task with its boxes ready for rendering
 */

import { mapBoxToRender, mapPalletToRender } from './coordinateMapper.js';
import { fromMeters } from './unitConverter.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Build render steps from normalized warehouse order
 * @param {Object} normalizedWO - NormalizedWarehouseOrder
 * @returns {Object} { steps: [], pallet: {}, resource: {} }
 */
export function buildRenderSteps(normalizedWO) {
    const { warehouseOrderId, tasks, uom, pallet } = normalizedWO;

    // Sort tasks by sequence
    const sortedTasks = [...tasks].sort((a, b) => a.sequence - b.sequence);

    // Map pallet to render coordinates
    const renderPallet = mapPalletToRender(pallet, uom);

    // Build steps
    const allBoxes = [];

    for (const task of sortedTasks) {
        const renderBoxes = task.boxes.map((box, boxIndexInTask) => {
            const { size, position } = mapBoxToRender(box, uom);

            // Calculate display metadata (in mm for UI)
            const displayX = Math.round(fromMeters(position[0], 'mm'));
            const displayY = Math.round(fromMeters(position[2], 'mm')); // Z in R3F = Y in SAP
            const displayZ = Math.round(fromMeters(position[1], 'mm')); // Y in R3F = Z in SAP

            return {
                // Unique identifier
                uId: uuidv4(),

                // Task/Block identifiers
                blockId: task.taskId,
                blockUuid: task.packageId,
                sequence: task.sequence,

                // Product info
                serialNumber: task.sku || 'UNKNOWN-PRODUCT',
                pickingLocation: task.sourceLocation || 'UNKNOWN-LOCATION',

                // Render properties (in meters for R3F)
                position,
                size,

                // Display metadata (for UI)
                display: {
                    x_mm: displayX,
                    y_mm: displayY,
                    z_mm: displayZ,
                    totalBoxesInBlock: task.boxes.length,
                    pickingLocation: task.sourceLocation || 'UNKNOWN-LOCATION',
                    stepDescription: `I placed ${task.boxes.length} box${task.boxes.length !== 1 ? 'es' : ''} of ${task.sku || 'UNKNOWN-PRODUCT'}`
                },

                // Logical metadata
                logical: {
                    boxId: box.boxId,
                    taskId: task.taskId,
                    boxIndexInTask: boxIndexInTask + 1,
                    ...box.meta
                },

                // Legacy compatibility
                boxInBlockIndex: boxIndexInTask + 1,
                boxesInBlockTotal: task.boxes.length
            };
        });

        allBoxes.push(...renderBoxes);
    }

    // Add global sequence index
    allBoxes.forEach((box, index) => {
        box.sequenceIndex = index + 1;
    });

    return {
        boxes: allBoxes,
        pallet: renderPallet,
        resource: {
            id: warehouseOrderId,
            name: pallet.typePallet
        }
    };
}

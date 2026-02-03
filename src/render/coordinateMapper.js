/**
 * Coordinate Mapper
 * Single canonical coordinate mapping from SAP/warehouse coordinates to R3F (Three.js) coordinates
 * 
 * Coordinate System Mapping:
 * - SAP X → R3F X (width)
 * - SAP Y → R3F Z (depth)
 * - SAP Z → R3F Y (height/up)
 */

import { toMeters } from './unitConverter.js';

/**
 * Map a normalized box to render coordinates and dimensions
 * @param {Object} box - NormalizedBox with x1,x2,y1,y2,z1,z2
 * @param {string} uom - Unit of measurement
 * @returns {Object} { size: [x,y,z], position: [x,y,z] } in meters for R3F
 */
export function mapBoxToRender(box, uom) {
    const toM = (v) => toMeters(v, uom);

    // Calculate size in R3F coordinates
    // R3F uses [width(X), height(Y), depth(Z)]
    const size = [
        toM(Math.abs(box.x2 - box.x1)),  // SAP X → R3F X (width)
        toM(Math.abs(box.z2 - box.z1)),  // SAP Z → R3F Y (height/up)
        toM(Math.abs(box.y2 - box.y1))   // SAP Y → R3F Z (depth)
    ];

    // Calculate center position in R3F coordinates
    const position = [
        toM((box.x1 + box.x2) / 2),  // SAP X → R3F X
        toM((box.z1 + box.z2) / 2),  // SAP Z → R3F Y (height)
        toM((box.y1 + box.y2) / 2)   // SAP Y → R3F Z (depth)
    ];

    return { size, position };
}

/**
 * Map pallet dimensions to R3F coordinates
 * @param {Object} pallet - Normalized pallet object
 * @param {string} uom - Unit of measurement
 * @returns {Object} Pallet dimensions in meters
 */
export function mapPalletToRender(pallet, uom) {
    const toM = (v) => toMeters(v, uom);

    return {
        name: pallet.typePallet,
        length: toM(pallet.length),
        width: toM(pallet.width),
        height: toM(pallet.height),
        maxHeight: toM(pallet.maxHeight)
    };
}

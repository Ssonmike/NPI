import { v4 as uuidv4 } from 'uuid';

/**
 * Normalizes a raw SAP instruction to internal standard (camelCase, Meters, Numbers).
 * @param {Object} raw - Raw JSON object from loadInstructions
 * @returns {Object} Normalized block
 */
function normalizeBlock(raw) {
    // Helper to get case-insensitive key
    const get = (key) => {
        const found = Object.keys(raw).find(k => k.toLowerCase() === key.toLowerCase());
        return found ? raw[found] : undefined;
    };

    const id = get('id') || `auto-${uuidv4().slice(0, 8)}`;
    const sequence = Number(get('sequence')) || 9999;

    const num = (val, def = 0) => {
        const n = Number(val);
        return isNaN(n) ? def : n;
    };

    // Parse Coordinates (mm default)
    let x1 = num(get('x1'));
    let x2 = num(get('x2'));
    let y1 = num(get('y1'));
    let y2 = num(get('y2'));
    let z1 = num(get('z1'));
    let z2 = num(get('z2'));

    // Unit Normalization
    const uom = (get('sizeUom') || 'mm').toLowerCase();
    let scale = 1;
    if (uom === 'mm') scale = 0.001;
    if (uom === 'cm') scale = 0.01;

    x1 *= scale; x2 *= scale;
    y1 *= scale; y2 *= scale;
    z1 *= scale; z2 *= scale;

    const quantityX = num(get('quantityX'), 1);
    const quantityY = num(get('quantityY'), 1);
    const quantityZ = num(get('quantityZ'), 1);

    return {
        id,
        sequence,
        x1, x2,
        y1, y2,
        z1, z2,
        quantityX, quantityY, quantityZ,
        packetId: get('packageId'),
        blockType: get('blockType')
    };
}

/**
 * Parses SAP Work Order JSON.
 * @param {string|Object} input - JSON string or Object.
 * @returns {Object} { boxes: [], pallet: {}, resource: {} }
 */
export function generateSequence(input) {
    let rawData = {};

    // 1. Parsing
    try {
        if (typeof input === 'string') {
            rawData = JSON.parse(input.trim());
        } else {
            rawData = input;
        }
    } catch (e) {
        console.error("JSON Parse Error", e);
        throw new Error("Formato JSON inválido");
    }

    // 2. Extract Context (Pallet & Resource)
    const resource = rawData.resource || {};
    const palletRaw = resource.pallet || {};

    // Pallet Dimensions (Default to Euro Pallet if missing)
    const palletScale = (palletRaw.sizeUom || 'mm') === 'cm' ? 0.01 : 0.001;
    const pallet = {
        name: palletRaw.name || 'Unknown Pallet',
        length: (Number(palletRaw.length) || 1200) * palletScale,
        width: (Number(palletRaw.width) || 800) * palletScale,
        height: (Number(palletRaw.height) || 144) * palletScale,
        maxHeight: (Number(palletRaw.maxHeight) || 2000) * palletScale,
    };

    const instructions = Array.isArray(rawData.loadInstructions) ? rawData.loadInstructions : [];

    // 3. Process Instructions (Blocks)
    let allBoxes = [];

    // Sort instructions by sequence strictly
    instructions.sort((a, b) => (Number(a.sequence) || 0) - (Number(b.sequence) || 0));

    instructions.forEach((rawBlock, blockIndex) => {
        const block = normalizeBlock(rawBlock);

        const { x1, x2, y1, y2, z1, z2, quantityX, quantityY, quantityZ } = block;

        const totalWidth = Math.abs(x2 - x1);
        const totalDepth = Math.abs(y2 - y1);
        const totalHeight = Math.abs(z2 - z1);

        const boxWidth = quantityX > 0 ? totalWidth / quantityX : 0;
        const boxDepth = quantityY > 0 ? totalDepth / quantityY : 0;
        const boxHeight = quantityZ > 0 ? totalHeight / quantityZ : 0;

        const startX = Math.min(x1, x2);
        const startY = Math.min(y1, y2);
        const startZ = Math.min(z1, z2);

        // Generate individual boxes for this block
        const blockBoxes = [];

        for (let z = 0; z < quantityZ; z++) {
            for (let y = 0; y < quantityY; y++) {
                for (let x = 0; x < quantityX; x++) {

                    // Center positions for Three.js (Pivot usually center)
                    const centerX = startX + (x * boxWidth) + (boxWidth / 2);
                    // Map: SAP X -> Three X, SAP Y -> Three Z, SAP Z -> Three Y
                    // Standard Logistics: X=Length, Y=Width, Z=Height
                    // R3F Standard: Y is UP.
                    // Correct mapping:
                    // SAP X (Length) -> R3F X
                    // SAP Y (Width)  -> R3F Z (Depth)
                    // SAP Z (Height) -> R3F Y (Up)

                    const centerZ_3d = startY + (y * boxDepth) + (boxDepth / 2);
                    const centerY_3d = startZ + (z * boxHeight) + (boxHeight / 2);

                    blockBoxes.push({
                        uId: uuidv4(),
                        blockId: block.id,
                        blockUuid: block.packetId, // Useful for grouping
                        sequence: block.sequence,

                        // Logical Stats
                        logical: {
                            startX, startY, startZ,
                            xIndex: x, yIndex: y, zIndex: z
                        },

                        // Display Metadata
                        display: {
                            x_mm: Math.round((startX + x * boxWidth) * 1000),
                            y_mm: Math.round((startY + y * boxDepth) * 1000),
                            z_mm: Math.round((startZ + z * boxHeight) * 1000),
                            stepDescription: `Coloque ${quantityX * quantityY * quantityZ} cajas en [${Math.round(startX * 1000)}, ${Math.round(startY * 1000)}]`
                        },

                        // Render Props
                        position: [centerX, centerY_3d, centerZ_3d],
                        size: [boxWidth, boxHeight, boxDepth]
                        // We will determine boxInBlockIndex later if needed, 
                        // but strictly we just flatten them now.
                    });
                }
            }
        }

        // Within a block, we might want to sort by Z -> Y -> X just for logical piling order
        // IF the instruction implies they are placed together. 
        // Typically, we just push them. Let's do a mini-sort Z-up for stability visuals.
        blockBoxes.sort((a, b) => a.position[1] - b.position[1]);

        // Update indices
        blockBoxes.forEach((b, idx) => {
            b.boxInBlockIndex = idx + 1;
            b.boxesInBlockTotal = blockBoxes.length;
        });

        allBoxes = allBoxes.concat(blockBoxes);
    });

    // Final global sequence index
    allBoxes.forEach((box, index) => {
        box.sequenceIndex = index + 1;
    });

    return {
        boxes: allBoxes,
        pallet,
        resource: {
            id: rawData.resourceId,
            name: pallet.name
        }
    };
}


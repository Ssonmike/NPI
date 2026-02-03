// Pallet configuration presets
export const PALLET_CONFIGURATIONS = {
    pallet1: {
        id: "pallet1",
        name: "Pallet 1",
        displayName: "Pallet 1",
        data: {
            resourceId: "PAL_IITE8612MIS-B3AG",
            resource: {
                pallet: {
                    maxHeight: 2300,
                    name: "LFD Pallet",
                    description: "",
                    weightUom: "kg",
                    sizeUom: "mm",
                    length: 2150,
                    width: 1100,
                    height: 130,
                    volume: 0.307,
                    volumeUom: "m3",
                    weight: 15,
                    maxWeight: 2000,
                    maxLoadWeight: 1985,
                    externalReferences: {}
                }
            },
            loadInstructions: [
                {
                    id: "71c869ce-8d4a-467c-ad85-d0f0f56d8c3d",
                    serialNumber: "IIXUB2493HSU-B6",
                    pickingLocation: "BA01-01-00",
                    x1: 25,
                    x2: 1655,
                    y1: 150,
                    y2: 335,
                    z1: 0,
                    z2: 1010,
                    quantityX: 1,
                    quantityY: 1,
                    quantityZ: 1,
                    sizeUom: "mm",
                    orientation: "LxW",
                    blockType: "Cube",
                    packageId: "02546ba5-be55-402c-80cf-201ea75052e5",
                    sequence: 1
                },
                {
                    id: "714c2a19-231f-48d6-9ca1-f2b820c5def8",
                    serialNumber: "IITF3239MSC-B1AG",
                    pickingLocation: "BA01-02-00",
                    x1: 25,
                    x2: 2125,
                    y1: 335,
                    y2: 560,
                    z1: 0,
                    z2: 1280,
                    quantityX: 1,
                    quantityY: 1,
                    quantityZ: 1,
                    sizeUom: "mm",
                    orientation: "LxW",
                    blockType: "Cube",
                    packageId: "d3bb422c-bbe2-406d-a16e-bbc082103a1a",
                    sequence: 2
                },
                {
                    id: "cee2def4-55c8-460a-94a4-7a16cd4883bd",
                    serialNumber: "IIXUB2792QSU-B6",
                    pickingLocation: "BA01-03-00",
                    x1: 25,
                    x2: 1405,
                    y1: 560,
                    y2: 950,
                    z1: 0,
                    z2: 845,
                    quantityX: 1,
                    quantityY: 3,
                    quantityZ: 1,
                    sizeUom: "mm",
                    orientation: "LxW",
                    blockType: "Cube",
                    packageId: "f7562342-fa38-4b92-8f21-1b381aae9235",
                    sequence: 3
                }
            ]
        }
    },

    pallet2: {
        id: "pallet2",
        name: "Pallet 2",
        displayName: "Pallet 2",
        data: {
            resourceId: "PAL_BLOCK180_COPY3",
            resource: {
                pallet: {
                    maxHeight: 1800,
                    name: "BLOCK Pallet",
                    description: "Multi-product pallet configuration",
                    weightUom: "kg",
                    sizeUom: "mm",
                    length: 1200,
                    width: 1000,
                    height: 144,
                    volume: 1.706,
                    volumeUom: "m3",
                    weight: 25,
                    maxWeight: 500,
                    maxLoadWeight: 475,
                    externalReferences: {}
                }
            },
            loadInstructions: [
                {
                    id: "block-1-orange-base-left",
                    serialNumber: "IITF3239MSC-B1AG",
                    pickingLocation: "BA05-01-00",
                    x1: 0,
                    x2: 890,
                    y1: 0,
                    y2: 540,
                    z1: 0,
                    z2: 600,
                    quantityX: 1,
                    quantityY: 3,
                    quantityZ: 1,
                    sizeUom: "mm",
                    orientation: "LxWxH",
                    blockType: "Cube",
                    packageId: "pkg-base-layer-1",
                    sequence: 1
                },
                {
                    id: "block-2-orange-layer2-left",
                    serialNumber: "IITF3239MSC-B1AG",
                    pickingLocation: "BA05-02-00",
                    x1: 0,
                    x2: 890,
                    y1: 600,
                    y2: 1000,
                    z1: 0,
                    z2: 600,
                    quantityX: 1,
                    quantityY: 2,
                    quantityZ: 1,
                    sizeUom: "mm",
                    orientation: "LxWxH",
                    blockType: "Cube",
                    packageId: "pkg-base-layer-2",
                    sequence: 2
                },
                {
                    id: "block-3-orange-base-right",
                    serialNumber: "IITF3239MSC-B1AG",
                    pickingLocation: "BA05-03-00",
                    x1: 890,
                    x2: 1000,
                    y1: 0,
                    y2: 760,
                    z1: 0,
                    z2: 620, // Adjusted dimensions based on context
                    quantityX: 1,
                    quantityY: 1, // Explicit user request
                    quantityZ: 1,
                    sizeUom: "mm",
                    orientation: "WxLxH",
                    blockType: "Cube",
                    packageId: "pkg-side-layer-1",
                    sequence: 3
                },
                {
                    id: "block-4-orange-layer2-right",
                    serialNumber: "IITF3239MSC-B1AG",
                    pickingLocation: "BA05-04-00",
                    x1: 1000,
                    x2: 1200,
                    y1: 0,
                    y2: 700,
                    z1: 0,
                    z2: 790,
                    quantityX: 1,
                    quantityY: 1, // Explicit user request
                    quantityZ: 1,
                    sizeUom: "mm",
                    orientation: "WxLxH",
                    blockType: "Cube",
                    packageId: "pkg-side-layer-2",
                    sequence: 4
                },
                {
                    id: "block-5-yellow-layer",
                    serialNumber: "IIXUB2493HSU-B6",
                    pickingLocation: "BD03-01-00",
                    x1: 0,
                    x2: 890,
                    y1: 0,
                    y2: 540,
                    z1: 600,
                    z2: 1240,
                    quantityX: 1,
                    quantityY: 3,
                    quantityZ: 1,
                    sizeUom: "mm",
                    orientation: "LxWxH",
                    blockType: "Cube",
                    packageId: "pkg-mid-layer-yellow",
                    sequence: 5
                },
                {
                    id: "block-6-blue-layer",
                    serialNumber: "IIXUB2792QSU-B6",
                    pickingLocation: "CA10-01-00",
                    x1: 0,
                    x2: 890,
                    y1: 600,
                    y2: 1000,
                    z1: 600,
                    z2: 1240,
                    quantityX: 1,
                    quantityY: 2,
                    quantityZ: 1,
                    sizeUom: "mm",
                    orientation: "LxWxH",
                    blockType: "Cube",
                    packageId: "pkg-top-layer-blue",
                    sequence: 6
                },
                {
                    id: "block-6-blue-layer",
                    serialNumber: "IIXUB2792QSU-B6",
                    pickingLocation: "CA10-01-00",
                    x1: 890,
                    x2: 1000,
                    y1: 0,
                    y2: 760,
                    z1: 620,
                    z2: 1240,
                    quantityX: 1,
                    quantityY: 1,
                    quantityZ: 1,
                    sizeUom: "mm",
                    orientation: "LxWxH",
                    blockType: "Cube",
                    packageId: "pkg-top-layer-blue",
                    sequence: 7
                },
                {
                    id: "block-6-blue-layer",
                    serialNumber: "IIXUB2792QSU-B6",
                    pickingLocation: "CA10-01-00",
                    x1: 1000,
                    x2: 1200,
                    y1: 0,
                    y2: 700,
                    z1: 790,
                    z2: 1580,
                    quantityX: 1,
                    quantityY: 1,
                    quantityZ: 1,
                    sizeUom: "mm",
                    orientation: "LxWxH",
                    blockType: "Cube",
                    packageId: "pkg-top-layer-blue",
                    sequence: 8
                },
                {
                    id: "block-6-blue-layer",
                    serialNumber: "IIXUB2792QSU-B6",
                    pickingLocation: "CA10-01-00",
                    x1: 0,
                    x2: 890,
                    y1: 0,
                    y2: 700,
                    z1: 1240,
                    z2: 1600,
                    quantityX: 6,
                    quantityY: 1,
                    quantityZ: 1,
                    sizeUom: "mm",
                    orientation: "LxWxH",
                    blockType: "Cube",
                    packageId: "pkg-top-layer-blue",
                    sequence: 9
                },
                {
                    id: "block-6-blue-layer",
                    serialNumber: "IIXUB2792QSU-B6",
                    pickingLocation: "CA10-01-00",
                    x1: 0,
                    x2: 600,
                    y1: 700,
                    y2: 850,
                    z1: 1240,
                    z2: 1600,
                    quantityX: 1,
                    quantityY: 1,
                    quantityZ: 1,
                    sizeUom: "mm",
                    orientation: "LxWxH",
                    blockType: "Cube",
                    packageId: "pkg-top-layer-blue",
                    sequence: 10
                },
                {
                    id: "block-6-blue-layer",
                    serialNumber: "IIXUB2792QSU-B6",
                    pickingLocation: "CA10-01-00",
                    x1: 0,
                    x2: 600,
                    y1: 850,
                    y2: 1000,
                    z1: 1240,
                    z2: 1540,
                    quantityX: 1,
                    quantityY: 1,
                    quantityZ: 1,
                    sizeUom: "mm",
                    orientation: "LxWxH",
                    blockType: "Cube",
                    packageId: "pkg-top-layer-blue",
                    sequence: 11
                }
            ]
        }
    },

    sapExample: {
        id: "sapExample",
        name: "SAP Example (48 boxes, 5 tasks)",
        displayName: "SAP Example - 48 Boxes / 5 Tasks",
        data: {
            "warehouseOrderId": "PAL_XYZ_EXAMPLE_001",
            "uom": "mm",
            "pallet": {
                "typePallet": "LFD Pallet",
                "length": 2150,
                "width": 1100,
                "height": 130,
                "maxHeight": 2300
            },
            "tasks": [
                {
                    "taskId": "WT_01_DA5503",
                    "sequence": 1,
                    "sourceLocation": "BA01-03-00",
                    "sku": "IIT2755QSC-B1",
                    "packageId": "3517dbf7-4756-4483-b64a-d86de1616f92",
                    "quantity": 18,
                    "boxes": [
                        { "boxId": "WT_01_DA5503-1", "x1": 15, "x2": 725, "y1": 40, "y2": 500, "z1": 0, "z2": 130 },
                        { "boxId": "WT_01_DA5503-2", "x1": 15, "x2": 725, "y1": 500, "y2": 960, "z1": 0, "z2": 130 },
                        { "boxId": "WT_01_DA5503-3", "x1": 15, "x2": 725, "y1": 40, "y2": 500, "z1": 130, "z2": 260 },
                        { "boxId": "WT_01_DA5503-4", "x1": 15, "x2": 725, "y1": 500, "y2": 960, "z1": 130, "z2": 260 },
                        { "boxId": "WT_01_DA5503-5", "x1": 15, "x2": 725, "y1": 40, "y2": 500, "z1": 260, "z2": 390 },
                        { "boxId": "WT_01_DA5503-6", "x1": 15, "x2": 725, "y1": 500, "y2": 960, "z1": 260, "z2": 390 },
                        { "boxId": "WT_01_DA5503-7", "x1": 15, "x2": 725, "y1": 40, "y2": 500, "z1": 390, "z2": 520 },
                        { "boxId": "WT_01_DA5503-8", "x1": 15, "x2": 725, "y1": 500, "y2": 960, "z1": 390, "z2": 520 },
                        { "boxId": "WT_01_DA5503-9", "x1": 15, "x2": 725, "y1": 40, "y2": 500, "z1": 520, "z2": 650 },
                        { "boxId": "WT_01_DA5503-10", "x1": 15, "x2": 725, "y1": 500, "y2": 960, "z1": 520, "z2": 650 },
                        { "boxId": "WT_01_DA5503-11", "x1": 15, "x2": 725, "y1": 40, "y2": 500, "z1": 650, "z2": 780 },
                        { "boxId": "WT_01_DA5503-12", "x1": 15, "x2": 725, "y1": 500, "y2": 960, "z1": 650, "z2": 780 },
                        { "boxId": "WT_01_DA5503-13", "x1": 15, "x2": 725, "y1": 40, "y2": 500, "z1": 780, "z2": 910 },
                        { "boxId": "WT_01_DA5503-14", "x1": 15, "x2": 725, "y1": 500, "y2": 960, "z1": 780, "z2": 910 },
                        { "boxId": "WT_01_DA5503-15", "x1": 15, "x2": 725, "y1": 40, "y2": 500, "z1": 910, "z2": 1040 },
                        { "boxId": "WT_01_DA5503-16", "x1": 15, "x2": 725, "y1": 500, "y2": 960, "z1": 910, "z2": 1040 },
                        { "boxId": "WT_01_DA5503-17", "x1": 15, "x2": 725, "y1": 40, "y2": 500, "z1": 1040, "z2": 1170 },
                        { "boxId": "WT_01_DA5503-18", "x1": 15, "x2": 725, "y1": 500, "y2": 960, "z1": 1040, "z2": 1170 }
                    ]
                },
                {
                    "taskId": "WT_02_339914",
                    "sequence": 2,
                    "sourceLocation": "BA01-03-00",
                    "sku": "IIT2755QSC-B1",
                    "packageId": "b1f2a40a-0b3d-460b-9178-3d15048d4ee8",
                    "quantity": 15,
                    "boxes": [
                        { "boxId": "WT_02_339914-1", "x1": 725, "x2": 1185, "y1": 40, "y2": 750, "z1": 0, "z2": 130 },
                        { "boxId": "WT_02_339914-2", "x1": 725, "x2": 1185, "y1": 40, "y2": 750, "z1": 130, "z2": 260 },
                        { "boxId": "WT_02_339914-3", "x1": 725, "x2": 1185, "y1": 40, "y2": 750, "z1": 260, "z2": 390 },
                        { "boxId": "WT_02_339914-4", "x1": 725, "x2": 1185, "y1": 40, "y2": 750, "z1": 390, "z2": 520 },
                        { "boxId": "WT_02_339914-5", "x1": 725, "x2": 1185, "y1": 40, "y2": 750, "z1": 520, "z2": 650 },
                        { "boxId": "WT_02_339914-6", "x1": 725, "x2": 1185, "y1": 40, "y2": 750, "z1": 650, "z2": 780 },
                        { "boxId": "WT_02_339914-7", "x1": 725, "x2": 1185, "y1": 40, "y2": 750, "z1": 780, "z2": 910 },
                        { "boxId": "WT_02_339914-8", "x1": 725, "x2": 1185, "y1": 40, "y2": 750, "z1": 910, "z2": 1040 },
                        { "boxId": "WT_02_339914-9", "x1": 725, "x2": 1185, "y1": 40, "y2": 750, "z1": 1040, "z2": 1170 },
                        { "boxId": "WT_02_339914-10", "x1": 725, "x2": 1185, "y1": 40, "y2": 750, "z1": 1170, "z2": 1300 },
                        { "boxId": "WT_02_339914-11", "x1": 725, "x2": 1185, "y1": 40, "y2": 750, "z1": 1300, "z2": 1430 },
                        { "boxId": "WT_02_339914-12", "x1": 725, "x2": 1185, "y1": 40, "y2": 750, "z1": 1430, "z2": 1560 },
                        { "boxId": "WT_02_339914-13", "x1": 725, "x2": 1185, "y1": 40, "y2": 750, "z1": 1560, "z2": 1690 },
                        { "boxId": "WT_02_339914-14", "x1": 725, "x2": 1185, "y1": 40, "y2": 750, "z1": 1690, "z2": 1820 },
                        { "boxId": "WT_02_339914-15", "x1": 725, "x2": 1185, "y1": 40, "y2": 750, "z1": 1820, "z2": 1950 }
                    ]
                },
                {
                    "taskId": "WT_03_B0EDB1",
                    "sequence": 3,
                    "sourceLocation": "BA01-03-00",
                    "sku": "IIT2755QSC-B1",
                    "packageId": "9420cb52-1c01-4bfd-ad2f-c797c577df82",
                    "quantity": 6,
                    "boxes": [
                        { "boxId": "WT_03_B0EDB1-1", "x1": 15, "x2": 725, "y1": 40, "y2": 500, "z1": 1170, "z2": 1300 },
                        { "boxId": "WT_03_B0EDB1-2", "x1": 15, "x2": 725, "y1": 500, "y2": 960, "z1": 1170, "z2": 1300 },
                        { "boxId": "WT_03_B0EDB1-3", "x1": 15, "x2": 725, "y1": 40, "y2": 500, "z1": 1300, "z2": 1430 },
                        { "boxId": "WT_03_B0EDB1-4", "x1": 15, "x2": 725, "y1": 500, "y2": 960, "z1": 1300, "z2": 1430 },
                        { "boxId": "WT_03_B0EDB1-5", "x1": 15, "x2": 725, "y1": 40, "y2": 500, "z1": 1430, "z2": 1560 },
                        { "boxId": "WT_03_B0EDB1-6", "x1": 15, "x2": 725, "y1": 500, "y2": 960, "z1": 1430, "z2": 1560 }
                    ]
                },
                {
                    "taskId": "WT_04_9C5C10",
                    "sequence": 4,
                    "sourceLocation": "BA01-03-00",
                    "sku": "IIT2755QSC-B1",
                    "packageId": "98692b7a-0db8-49b3-a0f3-0729591391b2",
                    "quantity": 8,
                    "boxes": [
                        { "boxId": "WT_04_9C5C10-1", "x1": 15, "x2": 725, "y1": 40, "y2": 500, "z1": 1560, "z2": 1690 },
                        { "boxId": "WT_04_9C5C10-2", "x1": 15, "x2": 725, "y1": 500, "y2": 960, "z1": 1560, "z2": 1690 },
                        { "boxId": "WT_04_9C5C10-3", "x1": 15, "x2": 725, "y1": 40, "y2": 500, "z1": 1690, "z2": 1820 },
                        { "boxId": "WT_04_9C5C10-4", "x1": 15, "x2": 725, "y1": 500, "y2": 960, "z1": 1690, "z2": 1820 },
                        { "boxId": "WT_04_9C5C10-5", "x1": 15, "x2": 725, "y1": 40, "y2": 500, "z1": 1820, "z2": 1950 },
                        { "boxId": "WT_04_9C5C10-6", "x1": 15, "x2": 725, "y1": 500, "y2": 960, "z1": 1820, "z2": 1950 },
                        { "boxId": "WT_04_9C5C10-7", "x1": 15, "x2": 725, "y1": 40, "y2": 500, "z1": 1950, "z2": 2080 },
                        { "boxId": "WT_04_9C5C10-8", "x1": 15, "x2": 725, "y1": 500, "y2": 960, "z1": 1950, "z2": 2080 }
                    ]
                },
                {
                    "taskId": "WT_05_A0E1E9",
                    "sequence": 5,
                    "sourceLocation": "BA01-03-00",
                    "sku": "IIT2755QSC-B1",
                    "packageId": "48da39b8-db16-4555-b809-d36592dc2d0d",
                    "quantity": 1,
                    "boxes": [
                        { "boxId": "WT_05_A0E1E9-1", "x1": 725, "x2": 1185, "y1": 40, "y2": 750, "z1": 1950, "z2": 2080 }
                    ]
                }
            ]
        }
    }
};

// Helper function to get pallet by ID
export function getPalletById(palletId) {
    return PALLET_CONFIGURATIONS[palletId] || PALLET_CONFIGURATIONS.sapExample;
}

// Get all available pallets
export function getAllPallets() {
    return Object.values(PALLET_CONFIGURATIONS);
}

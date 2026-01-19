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
                    id: "block-1-base-orange",
                    serialNumber: "IITF3239MSC-B1AG",
                    x1: 0,
                    x2: 890,
                    y1: 0,
                    y2: 740,
                    z1: 0,
                    z2: 600,
                    quantityX: 1,
                    quantityY: 4,
                    quantityZ: 1,
                    sizeUom: "mm",
                    orientation: "LxWxH",
                    blockType: "Cube",
                    packageId: "pkg-base-layer-1",
                    sequence: 1
                },
                {
                    id: "block-2-base-orange",
                    serialNumber: "IITF3239MSC-B1AG",
                    x1: 0,
                    x2: 890,
                    y1: 0,
                    y2: 740,
                    z1: 600,
                    z2: 1200,
                    quantityX: 1,
                    quantityY: 4,
                    quantityZ: 1,
                    sizeUom: "mm",
                    orientation: "LxWxH",
                    blockType: "Cube",
                    packageId: "pkg-base-layer-2",
                    sequence: 2
                },
                {
                    id: "block-3-side-orange",
                    serialNumber: "IITF3239MSC-B1AG",
                    x1: 890,
                    x2: 1200,
                    y1: 0,
                    y2: 600,
                    z1: 0,
                    z2: 890,
                    quantityX: 1,
                    quantityY: 1,
                    quantityZ: 2,
                    sizeUom: "mm",
                    orientation: "WxLxH",
                    blockType: "Cube",
                    packageId: "pkg-side-layer-1",
                    sequence: 3
                },
                {
                    id: "block-4-side-orange-top",
                    serialNumber: "IITF3239MSC-B1AG",
                    x1: 890,
                    x2: 1200,
                    y1: 0,
                    y2: 600,
                    z1: 890,
                    z2: 1780,
                    quantityX: 1,
                    quantityY: 1,
                    quantityZ: 2,
                    sizeUom: "mm",
                    orientation: "WxLxH",
                    blockType: "Cube",
                    packageId: "pkg-side-layer-2",
                    sequence: 5
                },
                {
                    id: "block-5-mid-yellow",
                    serialNumber: "IIXUB2493HSU-B6",
                    x1: 0,
                    x2: 680,
                    y1: 0,
                    y2: 250,
                    z1: 1200,
                    z2: 1605,
                    quantityX: 1,
                    quantityY: 2,
                    quantityZ: 1,
                    sizeUom: "mm",
                    orientation: "LxWxH",
                    blockType: "Cube",
                    packageId: "pkg-mid-layer-yellow",
                    sequence: 4
                },
                {
                    id: "block-6-mid-yellow-2",
                    serialNumber: "IIXUB2493HSU-B6",
                    x1: 0,
                    x2: 680,
                    y1: 250,
                    y2: 625,
                    z1: 1200,
                    z2: 1605,
                    quantityX: 1,
                    quantityY: 3,
                    quantityZ: 1,
                    sizeUom: "mm",
                    orientation: "LxWxH",
                    blockType: "Cube",
                    packageId: "pkg-mid-layer-yellow-2",
                    sequence: 6
                }
            ]
        }
    }
};

// Helper function to get pallet by ID
export function getPalletById(palletId) {
    return PALLET_CONFIGURATIONS[palletId] || PALLET_CONFIGURATIONS.pallet1;
}

// Get all available pallets
export function getAllPallets() {
    return Object.values(PALLET_CONFIGURATIONS);
}

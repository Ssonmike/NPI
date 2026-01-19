import React from 'react';
import { Edges } from '@react-three/drei';

export function Pallet({ pallet }) {
    // Defaults (Euro Pallet) if no data
    const length = pallet?.length ?? 1.2;
    const width = pallet?.width ?? 0.8;
    const height = pallet?.height ?? 0.144;
    const maxHeight = pallet?.maxHeight ?? 2.3;

    // Coordinate System:
    // Origin (0,0,0) is the corner of the pallet on the top surface.
    // X+ is Length
    // Z+ is Width
    // Y+ is Height (Boxes go up)
    // Pallet body goes DOWN from 0.

    const centerX = length / 2;
    const centerZ = width / 2;
    const centerY = -height / 2;

    return (
        <group>
            {/* Base Pallet */}
            <mesh position={[centerX, centerY, centerZ]}>
                <boxGeometry args={[length, height, width]} />
                <meshStandardMaterial color="#cfb08a" />
                <Edges color="#8a6e4b" />
            </mesh>

            {/* Max Height Indicator (Safety limit) */}
            <group position={[centerX, maxHeight / 2, centerZ]}>
                {/* 
                   Visualizing the volume limit. 
                   We draw a wireframe box representing the max volume.
                   Center Y is half of max height. Height is max height.
                */}
                <mesh visible={false}> {/* Invisible hit box if needed */}
                    <boxGeometry args={[length, maxHeight, width]} />
                </mesh>

                {/* Top Lid / Limit Line */}
                <mesh position={[0, (maxHeight / 2), 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[length, width]} />
                    <meshBasicMaterial color="red" wireframe transparent opacity={0.2} />
                </mesh>

                {/* Corner Pillars for context */}
                <mesh position={[-length / 2, 0, -width / 2]}>
                    <boxGeometry args={[0.02, maxHeight, 0.02]} />
                    <meshBasicMaterial color="red" transparent opacity={0.1} />
                </mesh>
                <mesh position={[length / 2, 0, -width / 2]}>
                    <boxGeometry args={[0.02, maxHeight, 0.02]} />
                    <meshBasicMaterial color="red" transparent opacity={0.1} />
                </mesh>
                <mesh position={[-length / 2, 0, width / 2]}>
                    <boxGeometry args={[0.02, maxHeight, 0.02]} />
                    <meshBasicMaterial color="red" transparent opacity={0.1} />
                </mesh>
                <mesh position={[length / 2, 0, width / 2]}>
                    <boxGeometry args={[0.02, maxHeight, 0.02]} />
                    <meshBasicMaterial color="red" transparent opacity={0.1} />
                </mesh>
            </group>
        </group>
    );
}

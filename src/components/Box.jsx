import React, { useRef } from 'react';
import { Edges } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

export function Box({ position, size, status }) {
    const mesh = useRef();
    const materialRef = useRef();

    // Status flags
    const isCurrent = status === 'current';
    const isPlaced = status === 'placed';
    const isFutureSameBlock = status === 'future-same-block';
    const isFutureOtherBlock = status === 'future-other-block';

    // Blinking Animation for Current Box (Direct Manipulation)
    // MOVED UP: Hooks must be called unconditionally
    useFrame(({ clock }) => {
        if (isCurrent && materialRef.current) {
            const t = clock.getElapsedTime();
            const val = 0.7 + 0.3 * Math.sin(t * 8);
            materialRef.current.emissiveIntensity = 2 * (val - 0.2);
        }
    });

    // If it's a future box from another block, don't render it at all
    if (isFutureOtherBlock) return null;

    // Styles
    let color = '#dcbfa3'; // Default Beige (Placed)
    if (isCurrent) color = '#ff9900'; // Orange
    if (isFutureSameBlock) color = '#00ff00'; // Green

    // Opacity & Transparency
    let opacity = 1;
    let transparent = false;
    let initialEmissive = 0; // Static initialization

    if (isFutureSameBlock) {
        opacity = 0.05;
        transparent = true;
    }

    if (isCurrent) {
        initialEmissive = 1; // Start high, will be overridden by useFrame
    }

    // Shrink box slightly (1mm = 0.001m) to prevent Z-fighting with neighbors
    const [w, h, d] = size;
    const displaySize = [Math.max(0, w - 0.001), Math.max(0, h - 0.001), Math.max(0, d - 0.001)];

    return (
        <mesh ref={mesh} position={position}>
            <boxGeometry args={displaySize} />

            {/* Material */}
            <meshStandardMaterial
                ref={materialRef}
                color={color}
                transparent={transparent}
                opacity={opacity}
                emissive={isCurrent ? '#ff4400' : 'black'}
                emissiveIntensity={initialEmissive}
            />

            {/* Edges */}
            <Edges
                threshold={15}
                color={isFutureSameBlock ? "#00ff00" : "black"}
                visible={!isCurrent} // Hide standard edges on current if glowing? Or keep them. Keep them.
            />
        </mesh>
    );
}

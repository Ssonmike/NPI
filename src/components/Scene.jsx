import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment } from '@react-three/drei';
import { Pallet } from './Pallet';
import { Box } from './Box';

export function Scene({ boxes, currentStep, pallet }) {
    return (
        <div className="h-full w-full bg-gray-900">
            <Canvas
                gl={{ logarithmicDepthBuffer: true, antialias: true }}
                camera={{ position: [2.5, 3.0, 2.5], fov: 40, near: 0.1, far: 100 }}
            >
                <color attach="background" args={['#111827']} /> {/* Match bg-gray-900 */}

                {/* Advanced Lighting Setup */}
                <ambientLight intensity={1.5} />
                <directionalLight position={[2, 4, 2]} intensity={2} castShadow />
                <directionalLight position={[-2, 2, -2]} intensity={1} />
                <hemisphereLight skyColor="#ffffff" groundColor="#444444" intensity={1} />

                <group>
                    <Pallet pallet={pallet} />

                    {boxes.map((box) => {
                        let status = 'future-other-block';

                        // Current Step Index is 1-based (box.sequenceIndex)
                        // currentStep is the number of boxes Placed + Current.
                        // If currentStep = 1, box 1 is 'current'.

                        if (box.sequence < currentStep) {
                            status = 'placed';
                        } else if (box.sequence === currentStep) {
                            status = 'current';
                        } else {
                            /*
                            // Future. Check if same block as current box.
                            // If we are at step 0 (nothing placed), current is box 1.
                            // If we are at step N, current is box N.
                            // Actually the slider is "Steps Completed" or "Current target"?
                            // App.jsx: currentStep 0 = "Ready". 1 = "Targeting Box 1".

                            const activeStep = Math.max(1, currentStep); // If 0, look at box 1
                            const activeBox = boxes[activeStep - 1] || boxes[boxes.length - 1]; // Fallback

                            if (activeBox && box.blockId === activeBox.blockId) {
                                status = 'future-same-block';
                            } else {
                                status = 'future-other-block';
                            }
                                */
                            if (box.sequence === currentStep + 1) {
                                status = 'future-same-block';    // Green - next block
                            } else {
                                status = 'future-other-block';   // Transparent - future blocks
                            }
                        }

                        return (
                            <Box
                                key={box.uId}
                                position={box.position}
                                size={box.size}
                                status={status}
                            />
                        );
                    })}
                </group>

                <Grid
                    position={[0.6, -0.144, 0.4]}
                    args={[4, 4]}
                    cellColor="#333"
                    sectionColor="#555"
                    infiniteGrid
                    fadeDistance={20}
                />

                <OrbitControls target={[0.6, 0.5, 0.4]} makeDefault />
                <Environment preset="city" />
            </Canvas>
        </div>
    );
}

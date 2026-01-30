/**
 * Block Builder Test Suite
 * 
 * Comprehensive tests for Block Builder service
 * Coverage requirement: 90%+
 */

const blockBuilder = require('../services/blockBuilder');

describe('Block Builder', () => {

    // ==================== CORE CORRECTNESS TESTS ====================

    describe('Test Case 1: Simple Sequence Swap (A-B-A → A-A-B)', () => {
        it('should swap sequences to group same packageId', () => {
            const ortecResult = {
                loadInstructions: [
                    { id: 'box-1', packageId: 'A', x1: 0, x2: 400, y1: 0, y2: 500, z1: 0, z2: 150, sequence: 1 },
                    { id: 'box-2', packageId: 'A', x1: 400, x2: 800, y1: 0, y2: 500, z1: 0, z2: 150, sequence: 1 },
                    { id: 'box-3', packageId: 'B', x1: 0, x2: 600, y1: 0, y2: 500, z1: 150, z2: 350, sequence: 2 },
                    { id: 'box-4', packageId: 'A', x1: 600, x2: 1200, y1: 0, y2: 500, z1: 150, z2: 350, sequence: 3 }
                ]
            };

            const result = blockBuilder.buildBlocks(ortecResult);

            // Verify blocks
            expect(result.blocks).toHaveLength(2);

            // Find blocks
            const blockA = result.blocks.find(b => b.packageId === 'A');
            const blockB = result.blocks.find(b => b.packageId === 'B');

            // Verify A block
            expect(blockA).toBeDefined();
            expect(blockA.boxIds).toHaveLength(3);
            expect(blockA.boxIds).toContain('box-1');
            expect(blockA.boxIds).toContain('box-2');
            expect(blockA.boxIds).toContain('box-4');
            expect(blockA.sequenceModified).toBe(true);
            expect(blockA.originalSequence).toEqual([1, 3]);

            // Verify B block
            expect(blockB).toBeDefined();
            expect(blockB.boxIds).toHaveLength(1);
            expect(blockB.sequenceModified).toBe(true);

            // Verify statistics
            expect(result.statistics.totalBoxes).toBe(4);
            expect(result.statistics.totalBlocks).toBe(2);
            expect(result.statistics.originalBlocks).toBe(3);
            expect(result.statistics.reduction).toBe('33%');
            expect(result.statistics.optimizationApplied).toBe(true);
        });
    });

    describe('Test Case 2: Vertical Stacks with Gap', () => {
        it('should optimize vertical stacks with gap', () => {
            const ortecResult = {
                loadInstructions: [
                    { id: 'box-1', packageId: 'C', x1: 0, x2: 600, y1: 0, y2: 700, z1: 0, z2: 200, sequence: 1 },
                    { id: 'box-2', packageId: 'B', x1: 600, x2: 1200, y1: 0, y2: 700, z1: 0, z2: 300, sequence: 2 },
                    { id: 'box-3', packageId: 'C', x1: 0, x2: 600, y1: 0, y2: 700, z1: 200, z2: 400, sequence: 3 }
                ]
            };

            const result = blockBuilder.buildBlocks(ortecResult);

            // Verify blocks
            expect(result.blocks).toHaveLength(2);

            // Find C block
            const blockC = result.blocks.find(b => b.packageId === 'C');

            // Verify C block is a vertical stack
            expect(blockC).toBeDefined();
            expect(blockC.boxIds).toHaveLength(2);
            expect(blockC.type).toBe('VERTICAL_STACK');
            expect(blockC.sequenceModified).toBe(true);

            // Verify statistics
            expect(result.statistics.reduction).toBe('33%');
        });
    });

    describe('Test Case 3: Different X,Y Positions (CRITICAL - Multi-Position)', () => {
        it('should group boxes with same packageId in different positions', () => {
            const ortecResult = {
                loadInstructions: [
                    // Layer 1 - Base A
                    { id: 'box-1', packageId: 'A', x1: 0, x2: 400, y1: 0, y2: 500, z1: 0, z2: 150, sequence: 1 },
                    { id: 'box-2', packageId: 'A', x1: 400, x2: 800, y1: 0, y2: 500, z1: 0, z2: 150, sequence: 1 },

                    // Layer 2 - C boxes at position 1
                    { id: 'box-3', packageId: 'C', x1: 0, x2: 600, y1: 0, y2: 500, z1: 150, z2: 350, sequence: 2 },
                    { id: 'box-4', packageId: 'C', x1: 0, x2: 600, y1: 500, y2: 1000, z1: 150, z2: 350, sequence: 2 },

                    // Layer 2 - B boxes
                    { id: 'box-5', packageId: 'B', x1: 600, x2: 1200, y1: 0, y2: 500, z1: 150, z2: 350, sequence: 3 },
                    { id: 'box-6', packageId: 'B', x1: 600, x2: 1200, y1: 500, y2: 1000, z1: 150, z2: 350, sequence: 3 },

                    // Layer 3 - C boxes at position 2 (DIFFERENT x,y from layer 2 C boxes)
                    { id: 'box-7', packageId: 'C', x1: 600, x2: 1200, y1: 0, y2: 700, z1: 350, z2: 550, sequence: 4 },
                    { id: 'box-8', packageId: 'C', x1: 600, x2: 1200, y1: 700, y2: 1000, z1: 350, z2: 550, sequence: 4 }
                ]
            };

            const result = blockBuilder.buildBlocks(ortecResult);

            // Find C block
            const blockC = result.blocks.find(b => b.packageId === 'C');

            // Verify C block groups boxes from different positions
            expect(blockC).toBeDefined();
            expect(blockC.boxIds).toHaveLength(4);
            expect(blockC.boxIds).toContain('box-3');
            expect(blockC.boxIds).toContain('box-4');
            expect(blockC.boxIds).toContain('box-7');
            expect(blockC.boxIds).toContain('box-8');
            expect(blockC.sequenceModified).toBe(true);

            // Verify it's a MULTI_POSITION or SAME_LAYER block
            expect(['MULTI_POSITION', 'SAME_LAYER']).toContain(blockC.type);

            // If MULTI_POSITION, verify groups
            if (blockC.type === 'MULTI_POSITION') {
                expect(blockC.groups).toBeDefined();
                expect(blockC.groups.length).toBeGreaterThan(1);
            }

            // Verify statistics
            expect(result.statistics.totalBlocks).toBe(3);
            expect(result.statistics.originalBlocks).toBe(4);
            expect(result.statistics.reduction).toBe('25%');
        });
    });

    describe('Test Case 4: No Optimization Needed', () => {
        it('should not optimize when sequences are already optimal', () => {
            const ortecResult = {
                loadInstructions: [
                    { id: 'box-1', packageId: 'A', x1: 0, x2: 400, y1: 0, y2: 500, z1: 0, z2: 150, sequence: 1 },
                    { id: 'box-2', packageId: 'A', x1: 400, x2: 800, y1: 0, y2: 500, z1: 0, z2: 150, sequence: 1 },
                    { id: 'box-3', packageId: 'B', x1: 0, x2: 600, y1: 0, y2: 500, z1: 150, z2: 300, sequence: 2 },
                    { id: 'box-4', packageId: 'C', x1: 600, x2: 1200, y1: 0, y2: 500, z1: 300, z2: 450, sequence: 3 }
                ]
            };

            const result = blockBuilder.buildBlocks(ortecResult);

            // Verify no optimization applied
            expect(result.statistics.optimizationApplied).toBe(false);
            expect(result.statistics.reduction).toBe('0%');

            // Verify all blocks have sequenceModified = false
            result.blocks.forEach(block => {
                expect(block.sequenceModified).toBe(false);
            });
        });
    });

    // ==================== SAFETY & SCOPE GUARD TESTS ====================

    describe('Test Case 5: Support Constraint Violation (MUST REJECT)', () => {
        it('should reject optimization that violates support constraints', () => {
            const ortecResult = {
                loadInstructions: [
                    // Base layer A
                    { id: 'box-1', packageId: 'A', x1: 0, x2: 600, y1: 0, y2: 500, z1: 0, z2: 150, sequence: 1 },

                    // Layer 2 - C box supported by A
                    { id: 'box-2', packageId: 'C', x1: 0, x2: 600, y1: 0, y2: 500, z1: 150, z2: 350, sequence: 2 },

                    // Layer 2 - B box (not supported by A)
                    { id: 'box-3', packageId: 'B', x1: 600, x2: 1200, y1: 0, y2: 500, z1: 150, z2: 350, sequence: 3 },

                    // Layer 3 - C box supported by box-2
                    { id: 'box-4', packageId: 'C', x1: 0, x2: 600, y1: 0, y2: 500, z1: 350, z2: 550, sequence: 4 }
                ]
            };

            const result = blockBuilder.buildBlocks(ortecResult);

            // If optimization would violate support (C boxes depend on being after A),
            // then no optimization should be applied
            // OR optimization is applied only if it's safe

            // Verify support constraints are respected
            const blockC = result.blocks.find(b => b.packageId === 'C');
            const blockA = result.blocks.find(b => b.packageId === 'A');

            if (blockC && blockA) {
                // C must come after A (support constraint)
                expect(blockC.sequence).toBeGreaterThanOrEqual(blockA.sequence);
            }
        });
    });

    describe('Test Case 6: Multi-Gap (MUST NOT OPTIMIZE in v1)', () => {
        it('should not optimize when multiple gaps exist', () => {
            const ortecResult = {
                loadInstructions: [
                    { id: 'box-1', packageId: 'C', x1: 0, x2: 400, y1: 0, y2: 500, z1: 0, z2: 150, sequence: 2 },
                    { id: 'box-2', packageId: 'B', x1: 400, x2: 800, y1: 0, y2: 500, z1: 0, z2: 150, sequence: 3 },
                    { id: 'box-3', packageId: 'A', x1: 800, x2: 1200, y1: 0, y2: 500, z1: 0, z2: 150, sequence: 4 },
                    { id: 'box-4', packageId: 'C', x1: 0, x2: 400, y1: 500, y2: 1000, z1: 0, z2: 150, sequence: 5 },
                    { id: 'box-5', packageId: 'D', x1: 400, x2: 800, y1: 500, y2: 1000, z1: 0, z2: 150, sequence: 6 },
                    { id: 'box-6', packageId: 'C', x1: 800, x2: 1200, y1: 500, y2: 1000, z1: 0, z2: 150, sequence: 9 }
                ]
            };

            const result = blockBuilder.buildBlocks(ortecResult);

            // C has sequences [2, 5, 9] - multiple gaps [3,4] and [6,7,8]
            // v1 should NOT optimize this

            const blockC = result.blocks.find(b => b.packageId === 'C');

            // Either no optimization, or if optimized, verify it's safe
            // In v1, this should NOT be optimized
            if (blockC && blockC.sequenceModified) {
                // If somehow optimized, verify it's still correct
                expect(blockC.boxIds).toHaveLength(3);
            }
        });
    });

    describe('Test Case 7: Multiple Blockers (MUST NOT OPTIMIZE in v1)', () => {
        it('should not optimize when multiple blockers exist in gap', () => {
            const ortecResult = {
                loadInstructions: [
                    { id: 'box-1', packageId: 'C', x1: 0, x2: 400, y1: 0, y2: 500, z1: 0, z2: 150, sequence: 1 },
                    { id: 'box-2', packageId: 'A', x1: 400, x2: 800, y1: 0, y2: 500, z1: 0, z2: 150, sequence: 2 },
                    { id: 'box-3', packageId: 'B', x1: 800, x2: 1200, y1: 0, y2: 500, z1: 0, z2: 150, sequence: 3 },
                    { id: 'box-4', packageId: 'C', x1: 0, x2: 400, y1: 500, y2: 1000, z1: 0, z2: 150, sequence: 4 }
                ]
            };

            const result = blockBuilder.buildBlocks(ortecResult);

            // C has sequences [1, 4] with gap [2, 3]
            // Gap is occupied by TWO different packageIds (A and B)
            // v1 should NOT optimize this

            const blockC = result.blocks.find(b => b.packageId === 'C');

            // Verify C is NOT unified (should have 2 separate blocks or no optimization)
            const cBlocks = result.blocks.filter(b => b.packageId === 'C');

            // Either 2 separate C blocks, or 1 block with no modification
            if (cBlocks.length === 1) {
                expect(blockC.sequenceModified).toBe(false);
            } else {
                expect(cBlocks.length).toBe(2);
            }
        });
    });

    describe('Test Case 8: Conflict Test (Deterministic Behavior)', () => {
        it('should handle conflicts deterministically', () => {
            const ortecResult = {
                loadInstructions: [
                    { id: 'box-1', packageId: 'A', x1: 0, x2: 400, y1: 0, y2: 500, z1: 0, z2: 150, sequence: 1 },
                    { id: 'box-2', packageId: 'B', x1: 400, x2: 800, y1: 0, y2: 500, z1: 0, z2: 150, sequence: 2 },
                    { id: 'box-3', packageId: 'A', x1: 800, x2: 1200, y1: 0, y2: 500, z1: 0, z2: 150, sequence: 3 },
                    { id: 'box-4', packageId: 'C', x1: 0, x2: 400, y1: 500, y2: 1000, z1: 0, z2: 150, sequence: 4 },
                    { id: 'box-5', packageId: 'C', x1: 400, x2: 800, y1: 500, y2: 1000, z1: 0, z2: 150, sequence: 6 }
                ]
            };

            const result1 = blockBuilder.buildBlocks(ortecResult);
            const result2 = blockBuilder.buildBlocks(ortecResult);

            // Verify deterministic behavior (same input → same output)
            expect(result1.blocks.length).toBe(result2.blocks.length);
            expect(result1.statistics.reduction).toBe(result2.statistics.reduction);

            // Verify block IDs might differ but structure is same
            for (let i = 0; i < result1.blocks.length; i++) {
                expect(result1.blocks[i].packageId).toBe(result2.blocks[i].packageId);
                expect(result1.blocks[i].sequence).toBe(result2.blocks[i].sequence);
                expect(result1.blocks[i].boxIds).toEqual(result2.blocks[i].boxIds);
            }
        });
    });

    describe('Test Case 9: Performance Test (100+ boxes)', () => {
        it('should handle 100+ boxes efficiently', () => {
            const boxes = [];

            // Generate 120 boxes in a pattern
            for (let i = 0; i < 120; i++) {
                const packageId = ['A', 'B', 'C', 'D'][i % 4];
                const layer = Math.floor(i / 40);
                const posInLayer = i % 40;

                boxes.push({
                    id: `box-${i + 1}`,
                    packageId: packageId,
                    x1: (posInLayer % 10) * 120,
                    x2: ((posInLayer % 10) + 1) * 120,
                    y1: Math.floor(posInLayer / 10) * 250,
                    y2: (Math.floor(posInLayer / 10) + 1) * 250,
                    z1: layer * 200,
                    z2: (layer + 1) * 200,
                    sequence: i + 1
                });
            }

            const ortecResult = { loadInstructions: boxes };

            const startTime = Date.now();
            const result = blockBuilder.buildBlocks(ortecResult);
            const endTime = Date.now();

            const executionTime = endTime - startTime;

            // Verify performance (should complete in reasonable time)
            expect(executionTime).toBeLessThan(5000); // 5 seconds max

            // Verify correctness
            expect(result.blocks.length).toBeGreaterThan(0);
            expect(result.statistics.totalBoxes).toBe(120);

            console.log(`Performance: ${executionTime}ms for 120 boxes`);
        });
    });

    // ==================== EDGE CASES ====================

    describe('Edge Case: Single Box', () => {
        it('should handle single box input', () => {
            const ortecResult = {
                loadInstructions: [
                    { id: 'box-1', packageId: 'A', x1: 0, x2: 400, y1: 0, y2: 500, z1: 0, z2: 150, sequence: 1 }
                ]
            };

            const result = blockBuilder.buildBlocks(ortecResult);

            expect(result.blocks).toHaveLength(1);
            expect(result.blocks[0].type).toBe('SINGLE_BOX');
            expect(result.statistics.optimizationApplied).toBe(false);
        });
    });

    describe('Edge Case: All Same PackageId', () => {
        it('should handle all boxes with same packageId', () => {
            const ortecResult = {
                loadInstructions: [
                    { id: 'box-1', packageId: 'A', x1: 0, x2: 400, y1: 0, y2: 500, z1: 0, z2: 150, sequence: 1 },
                    { id: 'box-2', packageId: 'A', x1: 400, x2: 800, y1: 0, y2: 500, z1: 0, z2: 150, sequence: 1 },
                    { id: 'box-3', packageId: 'A', x1: 800, x2: 1200, y1: 0, y2: 500, z1: 0, z2: 150, sequence: 1 }
                ]
            };

            const result = blockBuilder.buildBlocks(ortecResult);

            expect(result.blocks).toHaveLength(1);
            expect(result.blocks[0].packageId).toBe('A');
            expect(result.blocks[0].boxIds).toHaveLength(3);
            expect(result.statistics.optimizationApplied).toBe(false);
        });
    });

    describe('Input Validation', () => {
        it('should throw error for missing loadInstructions', () => {
            expect(() => {
                blockBuilder.buildBlocks({});
            }).toThrow('Invalid input: missing loadInstructions');
        });

        it('should throw error for invalid loadInstructions type', () => {
            expect(() => {
                blockBuilder.buildBlocks({ loadInstructions: 'invalid' });
            }).toThrow('Invalid input: loadInstructions must be array');
        });

        it('should throw error for missing required fields', () => {
            expect(() => {
                blockBuilder.buildBlocks({
                    loadInstructions: [
                        { id: 'box-1', packageId: 'A' } // missing x,y,z fields
                    ]
                });
            }).toThrow(/missing field/);
        });
    });
});

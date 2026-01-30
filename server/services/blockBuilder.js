/**
 * Block Builder Service
 * 
 * Optimizes warehouse task sequences without changing pallet structure
 * 
 * CRITICAL PRINCIPLES:
 * ✅ Respect ORTEC 100%: never change box positions (x,y,z)
 * ✅ Never reconstruct/repack the pallet
 * ✅ Only modify sequence numbers when safe
 * ✅ Blocks are LOGICAL tasks, not physical reconstructions
 */

const sequenceOptimizer = require('./sequenceOptimizer');

class BlockBuilder {
    /**
     * Main entry point: Build optimized blocks from ORTEC result
     * @param {Object} ortecResult - ORTEC pallet configuration
     * @returns {Object} - { blocks, statistics }
     */
    buildBlocks(ortecResult) {
        console.log('🧱 Block Builder: Starting...');

        this.validateInput(ortecResult);

        const boxes = ortecResult.loadInstructions;
        console.log(`   Input: ${boxes.length} individual boxes`);

        // Step 1: Detect physical units (vertical stacks, same-layer units)
        const physicalUnits = this.detectPhysicalUnits(boxes);
        console.log(`   Detected ${physicalUnits.length} physical units`);

        // Step 2: Build support constraint graph
        const supportGraph = this.buildSupportGraph(boxes);
        console.log(`   Built support graph with ${supportGraph.edges.length} constraints`);

        // Step 3: Group units by packageId
        const groupsByPackageId = this.groupUnitsByPackageId(physicalUnits);
        console.log(`   Found ${Object.keys(groupsByPackageId).length} unique packageIds`);

        // Step 4: Create optimization plan (with safety checks)
        const optimizationPlan = this.createOptimizationPlan(groupsByPackageId, supportGraph);
        console.log(`   Found ${optimizationPlan.length} safe optimization opportunities`);

        // Step 5: Apply optimizations
        const optimizedGroups = sequenceOptimizer.applyOptimization(groupsByPackageId, optimizationPlan);

        // Step 6: Create logical blocks
        const blocks = this.createBlocks(optimizedGroups);
        console.log(`   Created ${blocks.length} logical blocks`);

        // Step 7: Calculate statistics
        const stats = this.calculateStatistics(boxes, blocks, optimizationPlan);

        console.log(`   Reduction: ${stats.reduction}`);
        console.log('🧱 Block Builder: Complete');

        return { blocks, statistics: stats };
    }

    /**
     * Validate input
     */
    validateInput(ortecResult) {
        if (!ortecResult || !ortecResult.loadInstructions) {
            throw new Error('Invalid input: missing loadInstructions');
        }

        if (!Array.isArray(ortecResult.loadInstructions)) {
            throw new Error('Invalid input: loadInstructions must be array');
        }

        // Validate each box
        ortecResult.loadInstructions.forEach((box, i) => {
            const required = ['id', 'packageId', 'x1', 'x2', 'y1', 'y2', 'z1', 'z2', 'sequence'];
            for (const field of required) {
                if (box[field] === undefined) {
                    throw new Error(`Box ${i}: missing field '${field}'`);
                }
            }
        });
    }

    /**
     * Detect physical units (vertical stacks and same-layer units)
     * @param {Array} boxes - Array of boxes
     * @returns {Array} - Array of physical units
     */
    detectPhysicalUnits(boxes) {
        const units = [];
        const used = new Set();

        // First pass: detect vertical stacks
        for (const box of boxes) {
            if (used.has(box.id)) continue;

            const stack = [box];
            used.add(box.id);

            // Find boxes stacked vertically on top (same x,y footprint, z aligned)
            let currentTop = box.z2;

            while (true) {
                const boxOnTop = boxes.find(b =>
                    !used.has(b.id) &&
                    b.packageId === box.packageId &&
                    b.x1 === box.x1 && b.x2 === box.x2 &&
                    b.y1 === box.y1 && b.y2 === box.y2 &&
                    b.z1 === currentTop
                );

                if (!boxOnTop) break;

                stack.push(boxOnTop);
                used.add(boxOnTop.id);
                currentTop = boxOnTop.z2;
            }

            units.push({
                type: stack.length > 1 ? 'VERTICAL_STACK' : 'SINGLE_BOX',
                boxes: stack,
                packageId: box.packageId,
                sequences: [...new Set(stack.map(b => b.sequence))],
                position: {
                    x1: box.x1, x2: box.x2,
                    y1: box.y1, y2: box.y2,
                    z1: Math.min(...stack.map(b => b.z1)),
                    z2: Math.max(...stack.map(b => b.z2))
                }
            });
        }

        return units;
    }

    /**
     * Build support constraint graph
     * Box B is supported by A if:
     * 1. B.z1 == A.z2 (touching vertically)
     * 2. Footprints overlap in X and Y
     * 
     * @param {Array} boxes - Array of boxes
     * @returns {Object} - { edges: [{from, to}] }
     */
    buildSupportGraph(boxes) {
        const edges = [];

        for (const boxB of boxes) {
            for (const boxA of boxes) {
                if (boxA.id === boxB.id) continue;

                if (this.isSupportedBy(boxB, boxA)) {
                    edges.push({
                        from: boxA,  // A must be placed before B
                        to: boxB
                    });
                }
            }
        }

        return { edges };
    }

    /**
     * Check if boxB is supported by boxA
     */
    isSupportedBy(boxB, boxA) {
        // Check vertical touching
        if (boxB.z1 !== boxA.z2) return false;

        // Check footprint overlap
        const overlapX = Math.min(boxB.x2, boxA.x2) - Math.max(boxB.x1, boxA.x1);
        const overlapY = Math.min(boxB.y2, boxA.y2) - Math.max(boxB.y1, boxA.y1);

        return overlapX > 0 && overlapY > 0;
    }

    /**
     * Group units by packageId
     */
    groupUnitsByPackageId(units) {
        const groups = {};

        for (const unit of units) {
            if (!groups[unit.packageId]) {
                groups[unit.packageId] = [];
            }
            groups[unit.packageId].push(unit);
        }

        return groups;
    }

    /**
     * Create optimization plan with strict v1 safety rules
     */
    createOptimizationPlan(groupsByPackageId, supportGraph) {
        const plans = [];

        // Step 1: Analyze sequences to find candidates
        const candidates = sequenceOptimizer.analyzeSequences(groupsByPackageId);

        // Step 2: For each candidate, validate safety
        for (const candidate of candidates) {
            const { packageId, gapInterval } = candidate;

            // Identify single blocker
            const blockerPackageId = sequenceOptimizer.identifySingleBlocker(groupsByPackageId, gapInterval);

            if (!blockerPackageId) {
                console.log(`   ⚠️  PackageId ${packageId}: no single blocker found - skipping (v1 scope)`);
                continue;
            }

            // Check if optimization is safe (support constraints)
            const isSafe = sequenceOptimizer.isOptimizationSafe(
                candidate,
                supportGraph,
                groupsByPackageId,
                blockerPackageId
            );

            if (!isSafe) {
                console.log(`   ⚠️  PackageId ${packageId}: optimization violates support constraints - skipping`);
                continue;
            }

            // Build swap plan
            const plan = sequenceOptimizer.buildSwapPlan(candidate, blockerPackageId);
            plans.push(plan);
        }

        return plans;
    }

    /**
     * Create logical blocks from optimized groups
     */
    createBlocks(optimizedGroups) {
        const blocks = [];

        for (const [packageId, units] of Object.entries(optimizedGroups)) {
            // Group units by final sequence
            const unitsBySequence = {};

            for (const unit of units) {
                const seq = unit.sequences[0]; // After optimization, should be single sequence
                if (!unitsBySequence[seq]) {
                    unitsBySequence[seq] = [];
                }
                unitsBySequence[seq].push(unit);
            }

            // Create blocks
            for (const [sequence, unitGroup] of Object.entries(unitsBySequence)) {
                const allBoxes = unitGroup.flatMap(u => u.boxes);
                const allBoxIds = allBoxes.map(b => b.id);

                // Calculate bounding box
                const minX1 = Math.min(...allBoxes.map(b => b.x1));
                const maxX2 = Math.max(...allBoxes.map(b => b.x2));
                const minY1 = Math.min(...allBoxes.map(b => b.y1));
                const maxY2 = Math.max(...allBoxes.map(b => b.y2));
                const minZ1 = Math.min(...allBoxes.map(b => b.z1));
                const maxZ2 = Math.max(...allBoxes.map(b => b.z2));

                // Determine block type
                let blockType = 'SINGLE_BOX';

                if (unitGroup.length > 1) {
                    // Multiple units
                    if (unitGroup.every(u => u.type === 'VERTICAL_STACK')) {
                        blockType = 'VERTICAL_STACKS';
                    } else if (this.areSameLayer(allBoxes)) {
                        blockType = 'SAME_LAYER';
                    } else {
                        blockType = 'MULTI_POSITION';
                    }
                } else if (unitGroup[0].type === 'VERTICAL_STACK') {
                    blockType = 'VERTICAL_STACK';
                } else if (allBoxes.length > 1) {
                    blockType = 'SAME_LAYER';
                }

                const block = {
                    id: this.generateBlockId(),
                    packageId: packageId,
                    boxIds: allBoxIds,
                    quantity: allBoxes.length,
                    position: {
                        x1: minX1, x2: maxX2,
                        y1: minY1, y2: maxY2,
                        z1: minZ1, z2: maxZ2
                    },
                    sequence: parseInt(sequence),
                    sequenceModified: unitGroup[0].sequenceModified || false,
                    originalSequence: unitGroup[0].originalSequence || null,
                    type: blockType,
                    description: this.generateDescription(packageId, allBoxes.length, blockType, unitGroup[0].sequenceModified)
                };

                // Add optimizationReason if modified
                if (block.sequenceModified && unitGroup[0].optimizationReason) {
                    block.optimizationReason = unitGroup[0].optimizationReason;
                }

                // Add detailed position info for MULTI_POSITION or VERTICAL_STACKS blocks
                if (blockType === 'MULTI_POSITION' || blockType === 'VERTICAL_STACKS') {
                    block.groups = unitGroup.map((u, i) => ({
                        groupId: `GROUP_${packageId}_${i + 1}`,
                        boxIds: u.boxes.map(b => b.id),
                        position: u.position,
                        description: this.generateGroupDescription(u)
                    }));
                }

                blocks.push(block);
            }
        }

        // Sort by sequence
        return blocks.sort((a, b) => a.sequence - b.sequence);
    }

    /**
     * Check if boxes are in the same layer (similar z height)
     */
    areSameLayer(boxes, tolerance = 50) {
        const avgZ1 = boxes.reduce((sum, b) => sum + b.z1, 0) / boxes.length;
        const maxZDiff = Math.max(...boxes.map(b => Math.abs(b.z1 - avgZ1)));
        return maxZDiff < tolerance;
    }

    /**
     * Generate description for a group within a block
     */
    generateGroupDescription(unit) {
        const { position, boxes, type } = unit;
        const count = boxes.length;

        let desc = `${count} box${count > 1 ? 'es' : ''}`;

        if (type === 'VERTICAL_STACK') {
            desc += ' stacked vertically';
        }

        desc += ` at x=${position.x1}-${position.x2}, y=${position.y1}-${position.y2}, z=${position.z1}-${position.z2}`;

        return desc;
    }

    /**
     * Generate block ID
     */
    generateBlockId() {
        return `BLOCK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Generate block description
     */
    generateDescription(packageId, count, type, modified) {
        let desc = `${count} box${count > 1 ? 'es' : ''} of ${packageId}`;

        if (type === 'VERTICAL_STACK') {
            desc += ' stacked vertically';
        } else if (type === 'VERTICAL_STACKS') {
            desc += ' in multiple vertical stacks';
        } else if (type === 'SAME_LAYER') {
            desc += ' in same layer';
        } else if (type === 'MULTI_POSITION') {
            desc += ' in multiple positions';
        }

        if (modified) {
            desc += ' (sequence optimized)';
        }

        return desc;
    }

    /**
     * Calculate statistics
     */
    calculateStatistics(originalBoxes, blocks, optimizationPlan) {
        const totalBoxes = originalBoxes.length;
        const totalBlocks = blocks.length;

        // Calculate how many blocks there would be without optimization
        const originalSequences = [...new Set(originalBoxes.map(b => b.sequence))];
        const originalBlocks = originalSequences.length;

        const reduction = originalBlocks > 0
            ? Math.round(((originalBlocks - totalBlocks) / originalBlocks) * 100)
            : 0;

        const sequencesModified = blocks.filter(b => b.sequenceModified).length;

        return {
            totalBoxes,
            totalBlocks,
            originalBlocks,
            reduction: `${reduction}%`,
            sequencesModified,
            optimizationApplied: optimizationPlan.length > 0,
            optimizationReason: optimizationPlan.length > 0
                ? optimizationPlan.map(p => p.reason).join('; ')
                : 'No optimization opportunities found or all outside v1 scope'
        };
    }
}

module.exports = new BlockBuilder();

/**
 * Sequence Optimizer Service
 * 
 * Analyzes sequences and finds safe optimization opportunities
 * with strict v1 scope: single gap, single blocker, support-safe
 */

class SequenceOptimizer {
    /**
     * Analyze sequences to find optimization candidates
     * @param {Object} groupsByPackageId - Groups organized by packageId
     * @returns {Array} - Array of optimization candidates
     */
    analyzeSequences(groupsByPackageId) {
        const candidates = [];

        for (const [packageId, units] of Object.entries(groupsByPackageId)) {
            // Get all unique sequences for this packageId
            const sequences = [...new Set(units.flatMap(u => u.sequences))].sort((a, b) => a - b);

            // Skip if already contiguous
            if (this.areSequencesContiguous(sequences)) {
                continue;
            }

            // Find gap intervals
            const gapIntervals = this.findGapIntervals(sequences);

            // v1 scope: only optimize if exactly ONE gap interval
            if (gapIntervals.length !== 1) {
                console.log(`   ⚠️  PackageId ${packageId}: multiple gaps ${JSON.stringify(gapIntervals)} - skipping (v1 scope)`);
                continue;
            }

            const gapInterval = gapIntervals[0];

            candidates.push({
                packageId,
                sequences,
                gapInterval,
                action: 'SWAP'
            });
        }

        return candidates;
    }

    /**
     * Check if sequences are contiguous
     * @param {Array<number>} sequences - Sorted array of sequence numbers
     * @returns {boolean}
     */
    areSequencesContiguous(sequences) {
        if (sequences.length <= 1) return true;

        for (let i = 1; i < sequences.length; i++) {
            if (sequences[i] !== sequences[i - 1] + 1) {
                return false;
            }
        }

        return true;
    }

    /**
     * Find gap intervals in sequences
     * @param {Array<number>} sequences - Sorted array of sequence numbers
     * @returns {Array<Array<number>>} - Array of gap intervals [start, end]
     */
    findGapIntervals(sequences) {
        const gaps = [];

        for (let i = 1; i < sequences.length; i++) {
            const gapStart = sequences[i - 1] + 1;
            const gapEnd = sequences[i] - 1;

            if (gapStart <= gapEnd) {
                // Create array of all sequence numbers in this gap
                const gapSeqs = [];
                for (let seq = gapStart; seq <= gapEnd; seq++) {
                    gapSeqs.push(seq);
                }
                gaps.push(gapSeqs);
            }
        }

        return gaps;
    }

    /**
     * Identify single blocker packageId for a gap interval
     * @param {Object} groupsByPackageId - All groups
     * @param {Array<number>} gapInterval - Gap sequence numbers
     * @returns {string|null} - Blocker packageId or null if multiple/none
     */
    identifySingleBlocker(groupsByPackageId, gapInterval) {
        let blockerPackageId = null;

        for (const [packageId, units] of Object.entries(groupsByPackageId)) {
            const sequences = [...new Set(units.flatMap(u => u.sequences))];

            // Check if this packageId owns any sequence in the gap
            const ownsGapSeq = sequences.some(seq => gapInterval.includes(seq));

            if (ownsGapSeq) {
                if (blockerPackageId !== null) {
                    // Multiple blockers found
                    return null;
                }
                blockerPackageId = packageId;
            }
        }

        // Verify the blocker owns ALL sequences in the gap
        if (blockerPackageId) {
            const blockerSeqs = [...new Set(groupsByPackageId[blockerPackageId].flatMap(u => u.sequences))];
            const ownsAll = gapInterval.every(seq => blockerSeqs.includes(seq));

            if (!ownsAll) {
                // Blocker doesn't own all gap sequences
                return null;
            }
        }

        return blockerPackageId;
    }

    /**
     * Check if optimization is safe (doesn't violate support constraints)
     * @param {Object} candidate - Optimization candidate
     * @param {Object} supportGraph - Support constraint graph
     * @param {Object} groupsByPackageId - All groups
     * @param {string} blockerPackageId - Blocker packageId
     * @returns {boolean}
     */
    isOptimizationSafe(candidate, supportGraph, groupsByPackageId, blockerPackageId) {
        const { packageId, sequences, gapInterval } = candidate;

        // Proposed swap (canonical v1 rule):
        // - Blocker moves to s_min (earliest sequence of target)
        // - Target unifies to g_min (first sequence in gap)
        const s_min = Math.min(...sequences);
        const g_min = Math.min(...gapInterval);

        const proposedMapping = {
            [packageId]: g_min,
            [blockerPackageId]: s_min
        };

        // Get all boxes for each packageId
        const targetBoxes = groupsByPackageId[packageId].flatMap(u => u.boxes);
        const blockerBoxes = groupsByPackageId[blockerPackageId].flatMap(u => u.boxes);

        // Check all support constraints
        for (const edge of supportGraph.edges) {
            const { from, to } = edge; // from must be placed before to

            // Determine new sequences
            let fromSeq = from.sequence;
            let toSeq = to.sequence;

            // Check if 'from' box is affected by swap
            if (targetBoxes.some(b => b.id === from.id)) {
                fromSeq = proposedMapping[packageId];
            } else if (blockerBoxes.some(b => b.id === from.id)) {
                fromSeq = proposedMapping[blockerPackageId];
            }

            // Check if 'to' box is affected by swap
            if (targetBoxes.some(b => b.id === to.id)) {
                toSeq = proposedMapping[packageId];
            } else if (blockerBoxes.some(b => b.id === to.id)) {
                toSeq = proposedMapping[blockerPackageId];
            }

            // Validate constraint: fromSeq <= toSeq
            if (fromSeq > toSeq) {
                console.log(`   ⚠️  Support constraint violated: box ${from.id} (seq ${fromSeq}) must be before ${to.id} (seq ${toSeq})`);
                return false;
            }
        }

        return true;
    }

    /**
     * Build explicit swap plan
     * @param {Object} candidate - Optimization candidate
     * @param {string} blockerPackageId - Blocker packageId
     * @returns {Object} - Swap plan with explicit mappings
     */
    buildSwapPlan(candidate, blockerPackageId) {
        const { packageId, sequences, gapInterval } = candidate;

        // Canonical v1 rule:
        // - Blocker Q moves to s_min (earliest sequence of target P)
        // - Target P unifies to g_min (first sequence in gap)
        const s_min = Math.min(...sequences);
        const g_min = Math.min(...gapInterval);

        return {
            targetPackageId: packageId,
            blockerPackageId: blockerPackageId,
            targetOriginalSequences: sequences,
            blockerOriginalSequences: gapInterval,
            targetNewSequence: g_min,
            blockerNewSequence: s_min,
            reason: `Swapped sequences to unify ${packageId} (${sequences} → ${g_min}), moved ${blockerPackageId} (${gapInterval} → ${s_min})`
        };
    }

    /**
     * Apply optimization plan to groups
     * @param {Object} groupsByPackageId - Groups to modify
     * @param {Array} optimizationPlans - Array of swap plans
     * @returns {Object} - Modified groups
     */
    applyOptimization(groupsByPackageId, optimizationPlans) {
        const optimized = JSON.parse(JSON.stringify(groupsByPackageId)); // Deep clone

        for (const plan of optimizationPlans) {
            const { targetPackageId, blockerPackageId, targetNewSequence, blockerNewSequence, reason } = plan;

            // Update target packageId units
            for (const unit of optimized[targetPackageId]) {
                unit.sequences = [targetNewSequence];
                unit.sequenceModified = true;
                unit.originalSequence = plan.targetOriginalSequences;
                unit.optimizationReason = reason;
            }

            // Update blocker packageId units
            for (const unit of optimized[blockerPackageId]) {
                unit.sequences = [blockerNewSequence];
                unit.sequenceModified = true;
                unit.originalSequence = plan.blockerOriginalSequences;
                unit.optimizationReason = reason;
            }

            console.log(`   ✅ ${reason}`);
        }

        return optimized;
    }
}

module.exports = new SequenceOptimizer();

# 🧱 Block Builder (BB) Module

**Date:** January 30, 2026  
**Project:** PV (Pallet Visualizer) - Block Builder Module  
**Version:** 1.0 (v1 - Conservative Scope)

---

## 📋 Executive Summary

### What is Block Builder (BB)?

Block Builder is a **sequence optimization algorithm** that analyzes ORTEC's individual box results and intelligently **re-orders sequences** to reduce the number of warehouse tasks by grouping boxes of the same packageId.

### Critical Principles

```
✅ RESPECT ORTEC 100%: Never change box positions (x,y,z)
✅ RESPECT PALLET STRUCTURE: Never reconstruct or reorganize the pallet
✅ ONLY RE-ORDER SEQUENCES: Swap sequence numbers to enable grouping
✅ VALIDATE SUPPORT CONSTRAINTS: Never break physical dependencies
✓ GOAL: Minimize warehouse tasks through smart sequence optimization
```

---

## 🎯 The Problem We're Solving

### Scenario

ORTEC sends the optimal pallet configuration with perfect physical stability. However, the sequences might not be optimal for warehouse task efficiency.

**Example:**

```
ORTEC sequences:
├─ seq=1: 6 boxes A (base layer)
├─ seq=2: 2 boxes C (layer 2, position 1)
├─ seq=3: 2 boxes B (layer 2, position 2)
└─ seq=4: 2 boxes C (layer 3, stacked on seq=2 boxes)

Problem: 4 warehouse tasks (one per sequence group)
```

**With Block Builder sequence optimization:**

```
Optimized sequences:
├─ seq=1: 6 boxes A (base layer)
├─ seq=2: 2 boxes B (swapped from seq=3)
└─ seq=3: 4 boxes C (unified from seq=2 and seq=4)

Result: 3 warehouse tasks (25% reduction)
```

---

## 🚫 What Block Builder Does NOT Do

### CRITICAL: Block Builder NEVER Reconstructs the Pallet

```
❌ NEVER move boxes from their x,y,z positions
❌ NEVER change the physical structure
❌ NEVER regroup boxes that aren't already physically connected
❌ NEVER change ORTEC's stability calculations
❌ NEVER merge blocks from different layers into one "virtual" block
```

**Why?**
- ORTEC already optimized physical placement
- Changing positions would break stability guarantees
- SAP doesn't need reconstructed pallets, just optimized task sequences

---

## ✅ What Block Builder Does

### Smart Sequence Re-Ordering with Safety Validation

```
✅ Detect vertical stacks (same packageId, same x/y, stacked z)
✅ Detect same-layer groups (same packageId, same z, different x/y)
✅ Build support constraint graph (precedence dependencies)
✅ Re-order sequences to group same packageId together (when safe)
✅ Minimize warehouse tasks without changing physical positions
```

---

## 🔒 Support Constraints (CRITICAL)

### Why Support Constraints Matter

Even without moving boxes, changing sequences can break the "build order" if a box placed higher depends on lower boxes being placed first.

### Constraint Rule

For any box A and box B:

**If B is physically supported by A** (B sits on top of A, fully or partially), then:

```
sequence(B) >= sequence(A)
```

### Support Detection

Box B is supported by A if:

1. **B.z1 == A.z2** (touching vertically)
2. **Footprints overlap in X and Y**:
   - `overlapX = min(B.x2, A.x2) - max(B.x1, A.x1) > 0`
   - `overlapY = min(B.y2, A.y2) - max(B.y1, A.y1) > 0`

### Validation

After any optimization, validate all edges satisfy:

```javascript
seq(A) <= seq(B)
```

If a proposed swap violates this → **reject optimization** (no-op + reason).

---

## 📐 Physical Units vs Logical Blocks

### Physical Units (Detected, Never Changed)

**VERTICAL_STACK_UNIT:**
- Same footprint (same x1,x2,y1,y2)
- Consecutive z (z1 == prev.z2)
- Same packageId

**SAME_LAYER_UNIT:**
- Same packageId
- Roughly same layer (z1 within tolerance)
- Different x/y allowed

**SINGLE_BOX_UNIT:**
- Individual box

### Logical Blocks (Output)

Groups one or more Physical Units that share:
- Same packageId
- Same final sequence

If multiple physical positions exist → `type: MULTI_POSITION` + `groups[]`

---

## 🧠 Optimization Scope (v1)

### Eligible Candidate

For a given packageId P:

1. **Let S = sorted unique sequences for P**
2. **If S has exactly ONE gap interval** (e.g., [2,4] has gap [3])
3. **All sequences in gap belong to exactly ONE other packageId Q**
4. **Swap is allowed only if it does NOT violate support constraints**

### Canonical Swap Rule (v1)

Given:
- Target P sequences: `[s_min, ..., s_max]` with gap interval `[g_min..g_max]`
- Blocker Q owns all `g_min..g_max`

**Result:**
```javascript
// Blocker Q moves to s_min
Q: [g_min..g_max] → s_min

// Target P unifies to g_min
P: [s_min, ..., s_max] → g_min
```

**Example:**
```
P=C, sequences [2,4], gap [3], blocker Q=B owns sequence 3

Swap:
- B: 3 → 2
- C: [2,4] → 3
```

### When NOT to Optimize (v1)

```
❌ Multiple gaps (e.g., [2,5,9])
❌ Multiple blockers in the gap interval
❌ Conflicting candidates in same range
❌ Any support-graph violation detected
```

**Returns:** "no optimization applied" with reason

---

## 🔧 API Documentation

### Endpoint

```
POST /api/block-builder
```

### Request Body

```json
{
  "ortecResult": {
    "loadInstructions": [
      {
        "id": "box-001",
        "packageId": "A",
        "x1": 0,
        "x2": 400,
        "y1": 0,
        "y2": 500,
        "z1": 0,
        "z2": 150,
        "sequence": 1
      }
      // ... more boxes
    ]
  }
}
```

### Response

```json
{
  "success": true,
  "blocks": [
    {
      "id": "BLOCK_001",
      "packageId": "A",
      "boxIds": ["box-001", "box-002"],
      "quantity": 2,
      "sequence": 1,
      "sequenceModified": false,
      "originalSequence": null,
      "type": "SAME_LAYER",
      "position": {
        "x1": 0,
        "x2": 800,
        "y1": 0,
        "y2": 500,
        "z1": 0,
        "z2": 150
      },
      "description": "2 boxes of A in same layer"
    }
  ],
  "statistics": {
    "totalBoxes": 12,
    "totalBlocks": 3,
    "originalBlocks": 4,
    "reduction": "25%",
    "sequencesModified": 2,
    "optimizationApplied": true,
    "optimizationReason": "Swapped sequences to unify C..."
  },
  "ortecResult": { /* original input */ }
}
```

### Block Types

- **SINGLE_BOX**: Individual box
- **VERTICAL_STACK**: Boxes stacked vertically (same x,y)
- **VERTICAL_STACKS**: Multiple vertical stacks of same packageId
- **SAME_LAYER**: Boxes in same layer (similar z)
- **MULTI_POSITION**: Boxes in different positions (different x,y,z)

---

## 📊 Complete Example

### Input

```json
{
  "loadInstructions": [
    // Layer 1 - Base (6 boxes A)
    {"id": "box-001", "packageId": "A", "x1": 0, "x2": 400, "y1": 0, "y2": 500, "z1": 0, "z2": 150, "sequence": 1},
    {"id": "box-002", "packageId": "A", "x1": 400, "x2": 800, "y1": 0, "y2": 500, "z1": 0, "z2": 150, "sequence": 1},
    {"id": "box-003", "packageId": "A", "x1": 800, "x2": 1200, "y1": 0, "y2": 500, "z1": 0, "z2": 150, "sequence": 1},
    {"id": "box-004", "packageId": "A", "x1": 0, "x2": 400, "y1": 500, "y2": 1000, "z1": 0, "z2": 150, "sequence": 1},
    {"id": "box-005", "packageId": "A", "x1": 400, "x2": 800, "y1": 500, "y2": 1000, "z1": 0, "z2": 150, "sequence": 1},
    {"id": "box-006", "packageId": "A", "x1": 800, "x2": 1200, "y1": 500, "y2": 1000, "z1": 0, "z2": 150, "sequence": 1},
    
    // Layer 2 - C boxes first
    {"id": "box-007", "packageId": "C", "x1": 600, "x2": 1200, "y1": 0, "y2": 500, "z1": 150, "z2": 350, "sequence": 2},
    {"id": "box-008", "packageId": "C", "x1": 600, "x2": 1200, "y1": 500, "y2": 1000, "z1": 150, "z2": 350, "sequence": 2},
    
    // Layer 2 - B boxes
    {"id": "box-009", "packageId": "B", "x1": 0, "x2": 600, "y1": 0, "y2": 500, "z1": 150, "z2": 350, "sequence": 3},
    {"id": "box-010", "packageId": "B", "x1": 0, "x2": 600, "y1": 500, "y2": 1000, "z1": 150, "z2": 350, "sequence": 3},
    
    // Layer 3 - C boxes (different x,y from layer 2 C boxes)
    {"id": "box-011", "packageId": "C", "x1": 0, "x2": 600, "y1": 0, "y2": 700, "z1": 350, "z2": 550, "sequence": 4},
    {"id": "box-012", "packageId": "C", "x1": 0, "x2": 600, "y1": 700, "y2": 1000, "z1": 350, "z2": 550, "sequence": 4}
  ]
}
```

### Visual Representation

```
Layer 3 (z=350-550):
┌─────C─────┐ ┌─────C─────┐                    [seq=4]
│  box-011  │ │  box-012  │                    x=0-600
└───────────┘ └───────────┘

Layer 2 (z=150-350):
┌─────B─────┐ ┌─────B─────┐ ┌─────C─────┐ ┌─────C─────┐
│  box-009  │ │  box-010  │ │  box-007  │ │  box-008  │  [seq=3 (B), seq=2 (C)]
└───────────┘ └───────────┘ └───────────┘ └───────────┘
x=0-600                      x=600-1200

Layer 1 (z=0-150):
┌───A───┬───A───┬───A───┬───A───┬───A───┬───A───┐
│ box01 │ box02 │ box03 │ box04 │ box05 │ box06 │        [seq=1]
└───────┴───────┴───────┴───────┴───────┴───────┘
```

### BB Analysis

```
Phase 1: Detect physical units
├─ Unit 1: box-001 to box-006 (A, z=0-150)
├─ Unit 2: box-007, box-008 (C, z=150-350, x=600-1200)
├─ Unit 3: box-009, box-010 (B, z=150-350, x=0-600)
└─ Unit 4: box-011, box-012 (C, z=350-550, x=0-600)

Phase 2: Build support graph
├─ box-007 supported by box-002, box-003
├─ box-008 supported by box-005, box-006
├─ box-009 supported by box-001
├─ box-010 supported by box-004
├─ box-011 supported by box-009
└─ box-012 supported by box-010

Phase 3: Group by packageId
├─ A: [Unit 1], sequences=[1]
├─ B: [Unit 3], sequences=[3]
└─ C: [Unit 2, Unit 4], sequences=[2, 4]  ← NOT contiguous!

Phase 4: Analyze sequences
├─ C has sequences [2, 4] (gap at 3)
├─ Blocking sequence: 3 (belongs to B)
└─ Single blocker: B

Phase 5: Validate support constraints
├─ Proposed swap: B: 3→2, C: [2,4]→3
├─ Check all support edges...
└─ ✅ All constraints satisfied

Phase 6: Apply optimization
├─ B: 3 → 2 (moved before C layer 2)
└─ C: [2, 4] → 3 (unified)

Result:
├─ seq=1: A (6 boxes)
├─ seq=2: B (2 boxes) ← Swapped from 3
└─ seq=3: C (4 boxes) ← Unified from 2,4
```

### Output

```json
{
  "blocks": [
    {
      "id": "BLOCK_001",
      "packageId": "A",
      "boxIds": ["box-001", "box-002", "box-003", "box-004", "box-005", "box-006"],
      "quantity": 6,
      "sequence": 1,
      "sequenceModified": false,
      "type": "SAME_LAYER"
    },
    {
      "id": "BLOCK_002",
      "packageId": "B",
      "boxIds": ["box-009", "box-010"],
      "quantity": 2,
      "sequence": 2,
      "sequenceModified": true,
      "originalSequence": 3,
      "type": "SAME_LAYER",
      "optimizationReason": "Swapped sequences to unify C..."
    },
    {
      "id": "BLOCK_003",
      "packageId": "C",
      "boxIds": ["box-007", "box-008", "box-011", "box-012"],
      "quantity": 4,
      "sequence": 3,
      "sequenceModified": true,
      "originalSequence": [2, 4],
      "type": "MULTI_POSITION",
      "groups": [
        {
          "groupId": "GROUP_C_1",
          "boxIds": ["box-007", "box-008"],
          "position": {"x1": 600, "x2": 1200, "y1": 0, "y2": 1000, "z1": 150, "z2": 350}
        },
        {
          "groupId": "GROUP_C_2",
          "boxIds": ["box-011", "box-012"],
          "position": {"x1": 0, "x2": 600, "y1": 0, "y2": 1000, "z1": 350, "z2": 550}
        }
      ],
      "optimizationReason": "Swapped sequences to unify C..."
    }
  ],
  "statistics": {
    "totalBoxes": 12,
    "totalBlocks": 3,
    "originalBlocks": 4,
    "reduction": "25%",
    "sequencesModified": 2,
    "optimizationApplied": true
  }
}
```

---

## 🧪 Testing

### Running Tests

```bash
# Run test suite
npm test -- blockBuilder.test.js

# Run with coverage (90%+ required)
npm test -- --coverage blockBuilder.test.js
```

### Test Scenarios

1. **Simple swap** (A-B-A → A-A-B)
2. **Vertical stacks with gap**
3. **Different x,y positions** (CRITICAL - multi-position)
4. **No optimization needed**
5. **Support constraint violation** (MUST reject)
6. **Multi-gap** (MUST NOT optimize in v1)
7. **Multiple blockers** (MUST NOT optimize in v1)
8. **Conflict test** (deterministic behavior)
9. **Performance test** (100+ boxes)

---

## 📞 Summary

**Block Builder is NOT "repack"**, it is:

1. **Detect physical reality** (vertical stacks, same-layer units)
2. **Enforce support constraints** (precedence graph validation)
3. **Optimize sequences** only within safe, well-defined rules
4. **Output logical blocks** for warehouse tasks

The algorithm is intentionally conservative in v1 to ensure safety and correctness. Future versions can expand optimization scope with additional safety validations.

---

## 🔮 Future Enhancements (v2+)

- Support multi-gap optimization with advanced conflict resolution
- Support multiple blockers with priority rules
- Advanced heuristics for complex scenarios
- Machine learning for optimal swap strategies
- Real-time optimization feedback to ORTEC

---

**Version:** 1.0  
**Last Updated:** January 30, 2026  
**Status:** ✅ Production Ready

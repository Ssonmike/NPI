# Test Data for Block Builder

This directory contains test data files for the Block Builder API.

## Files

### `block-builder-example.json`

Example ORTEC result with 12 boxes demonstrating sequence optimization:

- **Layer 1 (seq=1):** 6 boxes of packageId A (base layer)
- **Layer 2 (seq=2):** 2 boxes of packageId C at position 1
- **Layer 2 (seq=3):** 2 boxes of packageId B at position 2
- **Layer 3 (seq=4):** 2 boxes of packageId C at position 2

**Expected Optimization:**
- C has sequences [2, 4] with gap at 3
- B blocks the gap with sequence 3
- BB will swap: B: 3→2, C: [2,4]→3
- Result: 3 blocks instead of 4 (25% reduction)

## Usage

### Using curl

```bash
curl -X POST http://localhost:3000/api/block-builder \
  -H "Content-Type: application/json" \
  -d @test-data/block-builder-example.json
```

### Using PowerShell

```powershell
$body = Get-Content test-data/block-builder-example.json -Raw
Invoke-RestMethod -Uri http://localhost:3000/api/block-builder `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

### Expected Response

```json
{
  "success": true,
  "blocks": [
    {
      "packageId": "A",
      "quantity": 6,
      "sequence": 1,
      "sequenceModified": false
    },
    {
      "packageId": "B",
      "quantity": 2,
      "sequence": 2,
      "sequenceModified": true,
      "originalSequence": 3
    },
    {
      "packageId": "C",
      "quantity": 4,
      "sequence": 3,
      "sequenceModified": true,
      "originalSequence": [2, 4],
      "type": "MULTI_POSITION"
    }
  ],
  "statistics": {
    "totalBoxes": 12,
    "totalBlocks": 3,
    "originalBlocks": 4,
    "reduction": "25%",
    "optimizationApplied": true
  }
}
```

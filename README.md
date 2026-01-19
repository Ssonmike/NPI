# NPI Pallet Loading Visualizer 

NPI Project Summary
This is a 3D Pallet Loading Visualizer built with React, Three.js, and Vite. It's designed to visualize warehouse pallet loading instructions in an immersive 3D environment.
Key Features:

3D Visualization - Uses React Three Fiber (@react-three/fiber) to render boxes being stacked on a pallet
Step-by-step Loading Animation - Shows boxes being placed one by one with auto-play capability
SAP Integration - Parses JSON work orders with loading instructions (coordinates, quantities, sequences)
Interactive Controls - Play/pause, step forward/backward, and progress slider
Real-time Positioning - Displays X, Y, Z coordinates in millimeters for each placement step
Responsive UI - Clean industrial interface with collapsible sidebar for JSON input

Technical Stack:

Frontend: React 18.3.1 with Vite
3D Graphics: Three.js 0.170.0 + React Three Fiber + Drei
Styling: Tailwind CSS
Icons: Lucide React
Language: Spanish UI (warehouse operations context)

How It Works:

Takes JSON input with pallet specifications and load instructions
Each instruction defines a block of boxes with:

Position coordinates (x1, y1, z1 to x2, y2, z2)
Quantities in each dimension (quantityX, quantityY, quantityZ)
Sequence order


Generates individual box positions from block instructions
Animates placement sequence in 3D space
Maps SAP coordinates to Three.js coordinate system (X→X, Y→Z, Z→Y)

Main Components:

App.jsx - Main UI controller with state management
Scene.jsx - 3D scene setup with camera and lighting
Box.jsx - Individual box 3D rendering
Pallet.jsx - Pallet platform rendering
boxLogic.js - Core parsing and box generation logic

# Map of how it works

┌─────────────────────────────────────────────────────────────────┐
│                    1. JSON INPUT LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  DEFAULT_JSON (Line 6-81) ──┐                                 │
│                              ├──→ jsonInput state (Line 84)    │
│  User Textarea (Line 271) ───┘                                 │
│                                                                 │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     │ User clicks "Recalcular Modelo" (Line 280)
                     │ OR useEffect runs on mount (Line 94)
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│              2. PROCESSING TRIGGER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  handleParse() function (Line 98-110)                          │
│    ├─ Calls: generateSequence(jsonInput)                       │
│    ├─ Receives: { boxes, pallet, resource }                    │
│    └─ Updates state: setBoxes(), setPallet(), setResourceInfo()│
│                                                                 │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│         3. CORE LOGIC (boxLogic.js)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  generateSequence() - Line 62                                  │
│                                                                 │
│  STEP A: Parse JSON (Line 66-75)                              │
│    └─ JSON.parse() → rawData object                           │
│                                                                 │
│  STEP B: Extract Pallet Info (Line 77-89)                     │
│    ├─ rawData.resource.pallet                                 │
│    ├─ Convert mm/cm → meters                                  │
│    └─ Create pallet object: {length, width, height, maxHeight}│
│                                                                 │
│  STEP C: Process Each Load Instruction (Line 91-178)          │
│    ├─ Sort by sequence number (Line 97)                       │
│    ├─ For each instruction block:                             │
│    │   ├─ normalizeBlock() - converts to standard format      │
│    │   ├─ Calculate individual box dimensions (Line 104-110)  │
│    │   ├─ Generate grid of boxes using nested loops:          │
│    │   │   for z → for y → for x (Line 119-164)              │
│    │   ├─ Create box object with:                            │
│    │   │   • position: [x, y, z] in meters (3D coordinates)  │
│    │   │   • size: [width, height, depth]                    │
│    │   │   • display: {x_mm, y_mm, z_mm, stepDescription}   │
│    │   │   • metadata: ids, sequence, indices                │
│    │   └─ Coordinate mapping (Line 125-134):                 │
│    │       SAP X → Three.js X                                │
│    │       SAP Y → Three.js Z                                │
│    │       SAP Z → Three.js Y (up)                           │
│    └─ Concatenate all boxes (Line 177)                        │
│                                                                 │
│  STEP D: Return Results (Line 185-192)                        │
│    └─ { boxes: [...], pallet: {...}, resource: {...} }       │
│                                                                 │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│              4. STATE UPDATE (App.jsx)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  setBoxes(generatedBoxes)      ← Array of box objects          │
│  setPallet(parsedPallet)        ← Pallet dimensions            │
│  setResourceInfo(resource)      ← Work order ID & name         │
│                                                                 │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│            5. 3D RENDERING (Scene.jsx)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Scene boxes={boxes} pallet={pallet} currentStep={...} />    │
│    │                                                            │
│    ├─ Canvas> setup (Line 10-13)                             │
│    │   └─ Camera, lighting, background                        │
│    │                                                            │
│    ├─ Pallet> component (Line 23)                            │
│    │   └─ Renders pallet base using pallet dimensions         │
│    │                                                            │
│    └─ boxes.map() → Box> components (Line 25-61)             │
│        ├─ Each box gets status: placed/current/future         │
│        ├─ Position & size from box.position, box.size         │
│        └─ Box.jsx renders 3D mesh with color based on status  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                     │
                     ▼
            ┌────────────────┐
            │  USER SEES 3D  │
            │  VISUALIZATION │
            └────────────────┘

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

# Different builds:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
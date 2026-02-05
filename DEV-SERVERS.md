# Development Server Architecture

This project uses a **dual Vite server architecture** to separate concerns:

## Port Configuration

- **Port 3000** - Express Backend API
- **Port 3001** - Admin Panel (React Admin)
- **Port 5173** - 3D Pallet Viewer

## Development Commands

### Start Individual Servers

```bash
# Backend API only
npm run server

# 3D Viewer only (port 5173)
npm run dev:viewer

# Admin Panel only (port 3001)
npm run dev:admin

# Start ALL servers at once
npm run dev:all
```

### Default Command

```bash
# Runs 3D viewer on port 5173
npm run dev
```

## Access URLs

- **3D Viewer**: http://localhost:5173
- **Admin Panel**: http://localhost:3001
- **Backend API**: http://localhost:3000/api

## Production Build

```bash
# Build both applications
npm run build

# Build individually
npm run build:viewer
npm run build:admin
```

## Architecture Details

### 3D Viewer (Port 5173)
- Entry: `index.html` → `src/main.jsx`
- Routes:
  - `/` - Development mode
  - `/:warehouseOrderId/task/:taskId` - Production AMR viewer

### Admin Panel (Port 3001)
- Entry: `admin.html` → `src/admin-main.jsx`
- Routes: All React Admin routes (`/`, `/warehouse-orders`, `/tasks`, etc.)

### Backend API (Port 3000)
- Express server serving REST API endpoints
- No frontend serving (API only)

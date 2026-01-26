# Pallet Visualizer - Full-Stack Application

## 🚀 Overview

A full-stack 3D pallet visualization application for warehouse operations. Displays real-time palletization instructions from SAP/Ortec with dynamic URL-based routing for AMR fleet operations.

**Stack:**
- **Frontend:** React + Three.js + Vite + TailwindCSS
- **Backend:** Node.js + Express
- **Database:** SQLite (default) or PostgreSQL

---

## 📦 Installation

### 1. Clone and Install Dependencies

```bash
cd NPI
npm install
```

### 2. Database Setup

**Option A: SQLite (Default - No setup required)**

The SQLite database will be created automatically on first run at `database/pallet_visualizer.db`.

**Option B: PostgreSQL (Optional)**

```bash
# Install PostgreSQL
# Create database
createdb pallet_visualizer

# Create user
psql -c "CREATE USER pv_user WITH PASSWORD 'your_password';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE pallet_visualizer TO pv_user;"

# Run schema
psql -U pv_user -d pallet_visualizer -f database/schema.sql

# Optional: Load seed data
psql -U pv_user -d pallet_visualizer -f database/seeds.sql
```

Update `.env` to use PostgreSQL:
```bash
DB_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pallet_visualizer
DB_USER=pv_user
DB_PASSWORD=your_password
```

---

## 🏃 Running the Application

### Development Mode (Frontend + Backend)

```bash
npm run dev:full
```

This starts:
- **Frontend (Vite):** http://localhost:5173
- **Backend (Express):** http://localhost:3000

### Production Mode

```bash
# Build frontend
npm run build

# Start server
npm start
```

Server runs on http://localhost:3000 and serves the built React app.

---

## 🌐 API Endpoints

### POST /api/warehouse-orders
Create a new warehouse order with tasks.

**Request:**
```json
{
  "resourceId": "PAL_IITE8612MIS-B3AG",
  "resource": {
    "pallet": {
      "length": 2150,
      "width": 1100,
      "height": 130,
      "maxHeight": 2300,
      "sizeUom": "mm"
    }
  },
  "loadInstructions": [
    {
      "id": "71c869ce-8d4a-467c-ad85-d0f0f56d8c3d",
      "sequence": 1,
      "x1": 25, "x2": 1655,
      "y1": 150, "y2": 335,
      "z1": 0, "z2": 1010,
      "quantityX": 1, "quantityY": 1, "quantityZ": 1,
      "pickingLocation": "BA01-01-00",
      "serialNumber": "IIXUB2493HSU-B6"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "warehouseOrderId": "PAL_IITE8612MIS-B3AG",
  "tasksCount": 3,
  "urls": [
    {
      "taskId": "71c869ce-8d4a-467c-ad85-d0f0f56d8c3d",
      "sequence": 1,
      "url": "http://localhost:3000/PAL_IITE8612MIS-B3AG/task/71c869ce-8d4a-467c-ad85-d0f0f56d8c3d"
    }
  ]
}
```

### GET /api/warehouse-orders/:id
Retrieve warehouse order data.

### POST /api/tasks/:taskId/complete
Mark a task as completed and get next task URL.

**Response:**
```json
{
  "success": true,
  "taskId": "71c869ce-8d4a-467c-ad85-d0f0f56d8c3d",
  "status": "COMPLETED",
  "nextTaskId": "714c2a19-231f-48d6-9ca1-f2b820c5def8",
  "nextTaskUrl": "/PAL_IITE8612MIS-B3AG/task/714c2a19-231f-48d6-9ca1-f2b820c5def8",
  "warehouseOrderCompleted": false
}
```

### GET /api/health
Health check endpoint.

---

## 🔗 Dynamic URLs

Each task has a unique URL:

```
/{warehouseOrderId}/task/{taskId}

Example:
http://localhost:3000/PAL_IITE8612MIS-B3AG/task/71c869ce-8d4a-467c-ad85-d0f0f56d8c3d
```

Opening this URL:
1. Loads the warehouse order from database
2. Displays 3D visualization for the specific task
3. Shows picking location and instructions
4. Allows task completion with auto-navigation to next task

---

## 🧪 Testing

### 1. Test with Seed Data (SQLite)

```bash
# Start server
npm run dev:full

# In another terminal, POST a warehouse order
curl -X POST http://localhost:3000/api/warehouse-orders \
  -H "Content-Type: application/json" \
  -d @database/seeds.sql
```

Or use the test data from `src/data/palletConfigurations.js`:

```bash
# Create test file
echo '{
  "resourceId": "PAL_TEST_001",
  "resource": { "pallet": { "length": 2150, "width": 1100, "height": 130, "maxHeight": 2300, "sizeUom": "mm" } },
  "loadInstructions": [
    { "id": "task-1", "sequence": 1, "x1": 0, "x2": 1000, "y1": 0, "y2": 500, "z1": 0, "z2": 600, "quantityX": 1, "quantityY": 1, "quantityZ": 1, "pickingLocation": "A01", "serialNumber": "BOX-001" }
  ]
}' > test-order.json

curl -X POST http://localhost:3000/api/warehouse-orders \
  -H "Content-Type: application/json" \
  -d @test-order.json
```

### 2. Open Task URL

Copy the URL from the response and open in browser.

### 3. Complete Task

Click the "Completar" button to mark task as done and navigate to next task.

---

## 🛠️ Development Mode

When accessing the app without URL parameters (e.g., `http://localhost:5173`), it loads in **Development Mode**:

- Shows "Development Mode" in header
- Loads default pallet configuration
- Sidebar with JSON editor is available
- Useful for testing new pallet configurations

---

## 📁 Project Structure

```
NPI/
├── database/
│   ├── schema.sql              # PostgreSQL schema
│   ├── schema.sqlite.sql       # SQLite schema
│   ├── seeds.sql               # Test data
│   └── pallet_visualizer.db    # SQLite database (auto-created)
├── server/
│   ├── config/
│   │   └── database.js         # Database connection
│   ├── controllers/
│   │   ├── warehouseOrderController.js
│   │   └── taskController.js
│   ├── middleware/
│   │   ├── validateOrtecJSON.js
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── warehouseOrders.js
│   │   ├── tasks.js
│   │   └── health.js
│   ├── utils/
│   │   ├── urlGenerator.js
│   │   └── logger.js
│   └── server.js               # Main Express server
├── src/
│   ├── components/             # React components
│   ├── data/
│   │   └── palletConfigurations.js  # Test data
│   ├── utils/
│   │   └── boxLogic.js
│   └── App.jsx                 # Main React app
├── .env                        # Environment variables
├── package.json
└── vite.config.js
```

---

## 🔧 Configuration

### Environment Variables (.env)

```bash
# Server
PORT=3000
NODE_ENV=development
BASE_URL=http://localhost:3000

# Database
DB_TYPE=sqlite                  # or 'postgresql'
DB_PATH=./database/pallet_visualizer.db

# Security
CORS_ORIGIN=http://localhost:5173

# Logging
LOG_LEVEL=info
```

---

## 🚨 Troubleshooting

### Database Connection Failed

**SQLite:**
- Check that `database/` directory exists
- Ensure write permissions

**PostgreSQL:**
- Verify PostgreSQL is running: `pg_isready`
- Check credentials in `.env`
- Test connection: `psql -U pv_user -d pallet_visualizer`

### Frontend Shows Blank Page

- Check browser console for errors
- Verify backend is running: `curl http://localhost:3000/api/health`
- Rebuild frontend: `npm run build`

### Task URL Returns 404

- Verify warehouse order exists in database
- Check task ID is correct
- View database: `sqlite3 database/pallet_visualizer.db "SELECT * FROM warehouse_orders;"`

---

## 📊 Database Queries

### View Active Warehouse Orders

```sql
-- SQLite
sqlite3 database/pallet_visualizer.db "SELECT id, status, total_tasks FROM warehouse_orders;"

-- PostgreSQL
psql -U pv_user -d pallet_visualizer -c "SELECT id, status, total_tasks FROM warehouse_orders;"
```

### View Tasks for a Warehouse Order

```sql
SELECT id, sequence, status, picking_location 
FROM warehouse_tasks 
WHERE warehouse_order_id = 'PAL_IITE8612MIS-B3AG' 
ORDER BY sequence;
```

---

## 🎯 Production Deployment

1. **Build Frontend:**
   ```bash
   npm run build
   ```

2. **Set Environment Variables:**
   ```bash
   NODE_ENV=production
   BASE_URL=http://your-server-ip:3000
   ```

3. **Start Server:**
   ```bash
   npm start
   ```

4. **Optional: Use PM2 for Process Management:**
   ```bash
   npm install -g pm2
   pm2 start server/server.js --name pallet-visualizer
   pm2 save
   pm2 startup
   ```

---

## 📝 License

MIT
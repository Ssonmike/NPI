require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs');

const { initDatabase, closeDatabase } = require('./config/database');
const { getWarehouseOrder, getWarehouseTasks } = require('./controllers/warehouseOrderController');
const { startTask } = require('./controllers/taskController');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Import routes
const warehouseOrdersRoutes = require('./routes/warehouseOrders');
const tasksRoutes = require('./routes/tasks');
const healthRoutes = require('./routes/health');
const blockBuilderRoutes = require('./routes/blockBuilder');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disable for React app
}));
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*'
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/warehouse-orders', warehouseOrdersRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/block-builder', blockBuilderRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Serve testing tools
app.get('/tools/pallet-generator', (req, res) => {
    const toolPath = path.join(__dirname, '../tools/pallet-generator/index.html');
    if (fs.existsSync(toolPath)) {
        res.sendFile(toolPath);
    } else {
        res.status(404).send('Pallet Generator tool not found.');
    }
});

/**
 * Dynamic route: /:warehouseOrderId/task/:taskId
 * Serves React app with embedded data
 * This route is for the 3D viewer served by Vite on port 5173
 * Express just provides the API endpoints
 */
app.get('/:warehouseOrderId/task/:taskId', async (req, res, next) => {
    try {
        const { warehouseOrderId, taskId } = req.params;

        logger.info(`Serving task: ${warehouseOrderId} / ${taskId}`);

        // Get warehouse order
        const warehouseOrder = await getWarehouseOrder(warehouseOrderId);
        if (!warehouseOrder) {
            return res.status(404).json({
                success: false,
                error: 'Warehouse order not found',
                warehouseOrderId
            });
        }

        // Get all tasks
        const tasks = await getWarehouseTasks(warehouseOrderId);

        // Find current task
        const currentTask = tasks.find(t => t.id === taskId);
        if (!currentTask) {
            return res.status(404).json({
                success: false,
                error: 'Task not found',
                taskId
            });
        }

        // Mark task as in progress if pending
        await startTask(taskId);

        // Convert SAP format to ORTEC format if needed
        let ortecData = warehouseOrder.ortec_data;

        if (ortecData.warehouseOrderId && ortecData.tasks) {
            // This is SAP format, convert to ORTEC for frontend compatibility
            const loadInstructions = [];

            for (const task of ortecData.tasks) {
                if (task.boxes && Array.isArray(task.boxes)) {
                    for (const box of task.boxes) {
                        loadInstructions.push({
                            id: box.boxId,
                            serialNumber: task.sku,
                            pickingLocation: task.sourceLocation,
                            x1: box.x1,
                            x2: box.x2,
                            y1: box.y1,
                            y2: box.y2,
                            z1: box.z1,
                            z2: box.z2,
                            quantityX: 1,
                            quantityY: 1,
                            quantityZ: 1,
                            sizeUom: ortecData.uom || "mm",
                            orientation: "LxW",
                            blockType: "Cube",
                            packageId: task.packageId,
                            sequence: task.sequence
                        });
                    }
                }
            }

            // Convert to ORTEC structure
            ortecData = {
                resourceId: ortecData.warehouseOrderId,
                resource: {
                    pallet: {
                        maxHeight: ortecData.pallet.maxHeight,
                        name: ortecData.pallet.typePallet,
                        description: "",
                        weightUom: "kg",
                        sizeUom: ortecData.uom || "mm",
                        length: ortecData.pallet.length,
                        width: ortecData.pallet.width,
                        height: ortecData.pallet.height,
                        volume: (ortecData.pallet.length * ortecData.pallet.width * ortecData.pallet.height) / 1000000000,
                        volumeUom: "m3",
                        weight: 15,
                        maxWeight: 2000,
                        maxLoadWeight: 1985,
                        externalReferences: {}
                    }
                },
                loadInstructions: loadInstructions
            };
        }

        // Prepare data to embed
        const initialData = {
            warehouseOrder: ortecData,
            currentTask: currentTask.block_data,
            taskId: currentTask.id,
            sequence: currentTask.sequence,
            totalTasks: tasks.length,
            warehouseOrderId
        };

        // Read index.html from dist
        const indexPath = path.join(distPath, 'index.html');
        if (!fs.existsSync(indexPath)) {
            return res.status(500).send('Frontend build not found. Run "npm run build" first.');
        }

        let html = fs.readFileSync(indexPath, 'utf8');

        // Inject initial data into HTML
        const dataScript = `
      <script>
        window.__INITIAL_DATA__ = ${JSON.stringify(initialData)};
      </script>
    `;

        // Insert before closing </head> tag
        html = html.replace('</head>', `${dataScript}</head>`);

        res.send(html);
    } catch (err) {
        next(err);
    }
});

// API-only server - frontends are served by Vite dev servers
// Admin Panel: http://localhost:3001 (Vite)
// 3D Viewer: http://localhost:5173 (Vite)
// Backend API: http://localhost:3000 (Express)

// Error handler (must be last)
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
    try {
        // Initialize database
        await initDatabase();

        // Start server
        app.listen(PORT, () => {
            logger.info(`🚀 Server running on port ${PORT}`);
            logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
            logger.info(`🗄️  Database: ${process.env.DB_TYPE || 'sqlite'}`);
            logger.info(`🌐 Base URL: ${process.env.BASE_URL || `http://localhost:${PORT}`}`);
        });
    } catch (err) {
        logger.error('Failed to start server:', err);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully...');
    await closeDatabase();
    process.exit(0);
});

process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully...');
    await closeDatabase();
    process.exit(0);
});

// Start the server
startServer();

module.exports = app;

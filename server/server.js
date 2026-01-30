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

// Serve testing tools
app.get('/tools/pallet-generator', (req, res) => {
    const toolPath = path.join(__dirname, '../tools/pallet-generator/index.html');
    if (fs.existsSync(toolPath)) {
        res.sendFile(toolPath);
    } else {
        res.status(404).send('Pallet Generator tool not found.');
    }
});

// Serve static files from React build
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    logger.info('Serving static files from:', distPath);
}

/**
 * Dynamic route: /:warehouseOrderId/task/:taskId
 * Serves React app with embedded data
 */
app.get('/:warehouseOrderId/task/:taskId', async (req, res, next) => {
    try {
        const { warehouseOrderId, taskId } = req.params;

        logger.info(`Serving task: ${warehouseOrderId} / ${taskId}`);

        // Get warehouse order
        const warehouseOrder = await getWarehouseOrder(warehouseOrderId);
        if (!warehouseOrder) {
            return res.status(404).send(`
        <!DOCTYPE html>
        <html>
          <head><title>404 - Not Found</title></head>
          <body>
            <h1>Warehouse Order Not Found</h1>
            <p>Warehouse Order ID: ${warehouseOrderId}</p>
          </body>
        </html>
      `);
        }

        // Get all tasks
        const tasks = await getWarehouseTasks(warehouseOrderId);

        // Find current task
        const currentTask = tasks.find(t => t.id === taskId);
        if (!currentTask) {
            return res.status(404).send(`
        <!DOCTYPE html>
        <html>
          <head><title>404 - Not Found</title></head>
          <body>
            <h1>Task Not Found</h1>
            <p>Task ID: ${taskId}</p>
          </body>
        </html>
      `);
        }

        // Mark task as in progress if pending
        await startTask(taskId);

        // Prepare data to embed
        const initialData = {
            warehouseOrder: warehouseOrder.ortec_data,
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

// Fallback: serve index.html for any other route (SPA support)
app.get('*', (req, res) => {
    const indexPath = path.join(distPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Application not built. Run "npm run build" first.');
    }
});

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

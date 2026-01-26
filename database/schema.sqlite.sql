-- ============================================
-- SQLite Schema for Pallet Visualizer
-- Alternative to PostgreSQL for simpler deployment
-- ============================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS active_sessions;
DROP TABLE IF EXISTS warehouse_tasks;
DROP TABLE IF EXISTS warehouse_orders;

-- ============================================
-- Table: warehouse_orders
-- Stores the complete Ortec JSON per warehouse order
-- ============================================
CREATE TABLE warehouse_orders (
  id TEXT PRIMARY KEY,                      -- resourceId from Ortec
  ortec_data TEXT NOT NULL,                 -- JSON stored as TEXT in SQLite
  created_at TEXT DEFAULT (datetime('now')),
  completed_at TEXT,
  status TEXT DEFAULT 'ACTIVE',             -- 'ACTIVE', 'COMPLETED', 'CANCELLED'
  sap_pshu_id TEXT,
  total_tasks INTEGER DEFAULT 0
);

-- Indexes
CREATE INDEX idx_wo_status ON warehouse_orders(status);
CREATE INDEX idx_wo_created ON warehouse_orders(created_at);

-- ============================================
-- Table: warehouse_tasks
-- Individual tasks (blocks) within a warehouse order
-- ============================================
CREATE TABLE warehouse_tasks (
  id TEXT PRIMARY KEY,                      -- UUID from Ortec
  warehouse_order_id TEXT NOT NULL,
  sequence INTEGER NOT NULL,
  block_data TEXT NOT NULL,                 -- JSON stored as TEXT
  package_id TEXT,
  serial_number TEXT,
  picking_location TEXT,
  status TEXT DEFAULT 'PENDING',
  started_at TEXT,
  completed_at TEXT,
  
  FOREIGN KEY (warehouse_order_id) 
    REFERENCES warehouse_orders(id) 
    ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_task_wo ON warehouse_tasks(warehouse_order_id);
CREATE INDEX idx_task_wo_seq ON warehouse_tasks(warehouse_order_id, sequence);
CREATE INDEX idx_task_status ON warehouse_tasks(status);

-- ============================================
-- Table: active_sessions
-- Tracks which AMR is working on which warehouse order
-- ============================================
CREATE TABLE active_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  amr_id TEXT,
  warehouse_order_id TEXT NOT NULL,
  current_task_id TEXT,
  last_activity TEXT DEFAULT (datetime('now')),
  
  FOREIGN KEY (warehouse_order_id) 
    REFERENCES warehouse_orders(id) 
    ON DELETE CASCADE,
  
  FOREIGN KEY (current_task_id) 
    REFERENCES warehouse_tasks(id) 
    ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_session_amr ON active_sessions(amr_id);
CREATE INDEX idx_session_activity ON active_sessions(last_activity);

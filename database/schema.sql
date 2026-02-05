-- ============================================
-- PostgreSQL Schema for Pallet Visualizer
-- ============================================

-- Drop existing tables if they exist (for clean reinstall)
DROP TABLE IF EXISTS active_sessions CASCADE;
DROP TABLE IF EXISTS warehouse_tasks CASCADE;
DROP TABLE IF EXISTS warehouse_orders CASCADE;

-- ============================================
-- Table: warehouse_orders
-- Stores the complete Ortec JSON per warehouse order
-- ============================================
CREATE TABLE warehouse_orders (
  id VARCHAR(100) PRIMARY KEY,              -- resourceId from Ortec (e.g., "PAL_IITE8612MIS-B3AG")
  ortec_data JSONB NOT NULL,                -- Full Ortec JSON (stored as JSONB for querying)
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'ACTIVE',      -- 'ACTIVE', 'COMPLETED', 'CANCELLED'
  sap_pshu_id VARCHAR(50),                  -- Optional: SAP PSHU reference
  total_tasks INT DEFAULT 0                 -- Count of loadInstructions
);

-- Indexes for performance
CREATE INDEX idx_wo_status ON warehouse_orders(status);
CREATE INDEX idx_wo_created_at ON warehouse_orders(created_at);

-- ============================================
-- Table: warehouse_tasks
-- Individual tasks (blocks) within a warehouse order
-- ============================================
CREATE TABLE warehouse_tasks (
  id VARCHAR(100) PRIMARY KEY,              -- id from Ortec (UUID)
  warehouse_order_id VARCHAR(100) NOT NULL, -- FK to warehouse_orders
  sequence INT NOT NULL,                    -- 1, 2, 3... (order of execution)
  block_data JSONB NOT NULL,                -- Full block JSON (x1, x2, y1, y2, z1, z2, etc.)
  package_id VARCHAR(100),                  -- packageId from Ortec
  serial_number VARCHAR(100),               -- serialNumber from Ortec
  picking_location VARCHAR(50),             -- pickingLocation from Ortec
  status VARCHAR(20) DEFAULT 'PENDING',     -- 'PENDING', 'IN_PROGRESS', 'COMPLETED'
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Foreign key constraint
  CONSTRAINT fk_warehouse_order 
    FOREIGN KEY (warehouse_order_id) 
    REFERENCES warehouse_orders(id) 
    ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_task_warehouse_order ON warehouse_tasks(warehouse_order_id);
CREATE INDEX idx_task_wo_sequence ON warehouse_tasks(warehouse_order_id, sequence);
CREATE INDEX idx_task_status ON warehouse_tasks(status);
CREATE INDEX idx_task_created_at ON warehouse_tasks(created_at);

-- ============================================
-- Table: active_sessions (Optional - for tracking AMRs)
-- Tracks which AMR is working on which warehouse order
-- ============================================
CREATE TABLE active_sessions (
  id SERIAL PRIMARY KEY,
  amr_id VARCHAR(20),                       -- AMR identifier (e.g., "AMR-1", "AMR-2")
  warehouse_order_id VARCHAR(100) NOT NULL,
  current_task_id VARCHAR(100),
  last_activity TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT fk_session_warehouse_order 
    FOREIGN KEY (warehouse_order_id) 
    REFERENCES warehouse_orders(id) 
    ON DELETE CASCADE,
  
  CONSTRAINT fk_session_task 
    FOREIGN KEY (current_task_id) 
    REFERENCES warehouse_tasks(id) 
    ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_session_amr ON active_sessions(amr_id);
CREATE INDEX idx_session_last_activity ON active_sessions(last_activity);

-- ============================================
-- Success message
-- ============================================
DO $$ 
BEGIN 
  RAISE NOTICE 'Database schema created successfully!';
END $$;

-- Migration: Add created_at and updated_at to warehouse_tasks
-- Date: 2026-02-05

-- Add created_at column (defaults to NOW for existing rows)
ALTER TABLE warehouse_tasks 
ADD COLUMN created_at TIMESTAMP DEFAULT NOW();

-- Add updated_at column (defaults to NOW for existing rows)
ALTER TABLE warehouse_tasks 
ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();

-- Create index on created_at for sorting performance
CREATE INDEX idx_task_created_at ON warehouse_tasks(created_at);

-- Migration: Add created_at and updated_at to warehouse_tasks (SQLite)
-- Date: 2026-02-05

-- Add created_at column (defaults to current timestamp for existing rows)
ALTER TABLE warehouse_tasks 
ADD COLUMN created_at TEXT DEFAULT (datetime('now'));

-- Add updated_at column (defaults to current timestamp for existing rows)
ALTER TABLE warehouse_tasks 
ADD COLUMN updated_at TEXT DEFAULT (datetime('now'));

-- Create index on created_at for sorting performance
CREATE INDEX idx_task_created_at ON warehouse_tasks(created_at);

-- Migration: Add task_url column to warehouse_tasks
-- Date: 2026-02-05

-- Add task_url column to warehouse_tasks table
ALTER TABLE warehouse_tasks ADD COLUMN task_url TEXT;

-- Update existing rows to generate task_url from warehouse_order_id and id
UPDATE warehouse_tasks 
SET task_url = 'http://localhost:5173/' || warehouse_order_id || '/task/' || id
WHERE task_url IS NULL;

-- Existing tables are kept when adopting Prisma. Fresh databases get the same schema.
BEGIN;

/*
Full employee table and manager relationship. 
Handle both a fresh database and the existing four-column practice table.
 */
CREATE TABLE IF NOT EXISTS
    employees (
        id TEXT PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE
    );

ALTER TABLE employees
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'Employee',
ADD COLUMN IF NOT EXISTS user_avatar TEXT NOT NULL DEFAULT '/users/dumplinh.jpg',
ADD COLUMN IF NOT EXISTS first_native_name TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS middle_native_name TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS last_native_name TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS department TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS building TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS room TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS desk_number INTEGER,
ADD COLUMN IF NOT EXISTS is_remote_work BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS phone TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS zoom_id TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS zoom_link TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS citizenship TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS birth_year INTEGER,
ADD COLUMN IF NOT EXISTS birth_month INTEGER,
ADD COLUMN IF NOT EXISTS birth_day INTEGER,
ADD COLUMN IF NOT EXISTS manager_id TEXT REFERENCES employees (id),
ADD COLUMN IF NOT EXISTS source_position INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS
    visas (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        employee_id TEXT NOT NULL REFERENCES employees (id),
        issuing_country TEXT NOT NULL,
        type TEXT NOT NULL,
        start_date_ms BIGINT NOT NULL,
        end_date_ms BIGINT NOT NULL,
        source_position INTEGER NOT NULL,
        UNIQUE (employee_id, source_position)
    );

-- Visa and request tables, employee relationships and indexes.
CREATE TABLE IF NOT EXISTS
    requests (
        id TEXT PRIMARY KEY,
        employee_id TEXT NOT NULL REFERENCES employees (id),
        type TEXT NOT NULL DEFAULT '',
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        note TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('approved', 'pending', 'rejected')),
        source_position INTEGER NOT NULL
    );

CREATE INDEX IF NOT EXISTS requests_employee_order_idx ON requests (employee_id, source_position);

CREATE TABLE IF NOT EXISTS
    auth_users (
        employee_id TEXT PRIMARY KEY REFERENCES employees (id),
        email TEXT NOT NULL UNIQUE,
        hashed_password TEXT NOT NULL,
        must_change_password BOOLEAN NOT NULL DEFAULT FALSE
    );

/*
SELECT
e.id,
e.first_name,
e.last_name,
m.id AS manager_id,
m.first_name AS manager_first_name,
m.last_name AS manager_last_name
FROM employees AS e
LEFT JOIN employees AS m
ON e.manager_id = m.id;
 */

CREATE TABLE IF NOT EXISTS schema_migrations (
  filename TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMIT;

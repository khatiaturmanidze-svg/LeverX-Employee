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

CREATE TABLE
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
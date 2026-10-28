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
-- Visa and request tables, employee relationships and indexes.
CREATE TABLE
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
# learning schema

```SQL
CREATE TABLE employees (
    id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    department TEXT,
    is_remote_work BOOLEAN NOT NULL DEFAULT FALSE,
    manager_id TEXT REFERENCES employees(id)
);

CREATE TABLE requests (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL REFERENCES employees(id),
    type TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    note TEXT,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected'))
);

```

- REFERENCES employees(id) creates a foreign key: PostgreSQL checks that the referenced employee exists. manager_id uses the same mechanism, but points back to the employees table

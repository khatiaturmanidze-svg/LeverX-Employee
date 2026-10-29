BEGIN;

-- Preserve the UTC calendar dates already used by the employee editor.
ALTER TABLE visas
  ALTER COLUMN start_date_ms TYPE DATE
    USING (to_timestamp(start_date_ms::double precision / 1000.0)
      AT TIME ZONE 'UTC')::date,
  ALTER COLUMN end_date_ms TYPE DATE
    USING (to_timestamp(end_date_ms::double precision / 1000.0)
      AT TIME ZONE 'UTC')::date;

ALTER TABLE visas RENAME COLUMN start_date_ms TO start_date;
ALTER TABLE visas RENAME COLUMN end_date_ms TO end_date;

COMMIT;

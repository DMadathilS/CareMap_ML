#!/bin/bash
set -e

echo "👤 Ensuring required roles exist..."

# Create user "Deep" with password
psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "DO \$\$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'Deep') THEN
    CREATE USER \"Deep\" WITH PASSWORD 'Deep@0506';
  END IF;
END \$\$;"

# Create role "postgres" if needed (for SQL ownership compatibility)
psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "DO \$\$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'postgres') THEN
    CREATE ROLE postgres;
  END IF;
END \$\$;"

echo "📦 Restoring HealthCareTest.sql..."
psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f /docker-entrypoint-initdb.d/HealthCareTest.sql

echo "✅ SQL restore completed successfully."

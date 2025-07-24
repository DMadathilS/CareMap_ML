#!/bin/bash
set -e

echo "Creating database 'Deep' if it doesn't exist..."
psql -U "$POSTGRES_USER" -d postgres -c "SELECT 1 FROM pg_database WHERE datname = 'Deep'" | grep -q 1 || \
psql -U "$POSTGRES_USER" -d postgres -c "CREATE DATABASE \"Deep\";"

echo "Restoring HealthCareTest.sql into 'Deep'..."
psql -U "$POSTGRES_USER" -d Deep -f /docker-entrypoint-initdb.d/HealthCareTest.sql

echo "✅ Restore complete"

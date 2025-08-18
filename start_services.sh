#!/bin/bash

echo "⏳ Waiting for PostgreSQL to be ready..."

until pg_isready -h db -p 5432 -U "$DB_USER"; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 2
done

echo "✅ Postgres is up - starting services..."

# Optionally run a test query to check if SQL ran
psql -h db -U "$DB_USER" -d "$DB_NAME" -c '\dt' || echo "⚠️ Table check failed"

# Start frontend and Streamlit in background
serve -s /app/Dev/UI/dist -l 5173 > /app/frontend.log 2>&1 &
streamlit run Dev/project_logger/streamlit_app.py --server.port=8501 --server.enableCORS false > /app/streamlit.log 2>&1 &

# Start FastAPI
exec uvicorn Dev.api.main:app --host 0.0.0.0 --port 8000

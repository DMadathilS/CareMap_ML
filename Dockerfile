# Use Python base
FROM python:3.11-slim

# Install Node.js (for frontend) and system packages
RUN apt-get update && apt-get install -y \
    curl wget unzip gnupg ca-certificates \
    nodejs npm \
    chromium chromium-driver \
    libglib2.0-0 libnss3 libgconf-2-4 libfontconfig1 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy backend requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install streamlit separately
RUN pip install streamlit

# Copy full app into image
COPY . .

# Install frontend dependencies
WORKDIR /app/Dev/UI
RUN npm install -g serve

# Build frontend
RUN rm -rf node_modules package-lock.json && npm install --legacy-peer-deps && npm run build


# Set back to main directory
WORKDIR /app

# Expose ports
EXPOSE 8000 5173 8501

# Run all services together
CMD bash -c "\
    export PYTHONPATH=/app && \
    python Dev/scrapers/orchestrate_data_pipeline.py & \
    uvicorn Dev.api.main:app --host 0.0.0.0 --port 8000 & \
    serve -s Dev/UI/dist -l 5173 & \
    streamlit run Dev/project_logger/streamlit_app.py --server.port=8501 --server.enableCORS false \
    "


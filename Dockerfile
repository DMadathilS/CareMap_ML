# Dockerfile
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app:/app/Dev

RUN apt-get update && apt-get install -y \
    curl wget unzip gnupg ca-certificates nodejs npm chromium chromium-driver \
    libglib2.0-0 libnss3 libgconf-2-4 libfontconfig1 \
    && npm install -g serve \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

COPY . .

WORKDIR /app/Dev/UI
RUN npm install --legacy-peer-deps && npm run build

WORKDIR /app
RUN mkdir -p /app/caremap_logs && touch /app/caremap_logs/scraper.log

EXPOSE 8000 5173 8501

COPY start_services.sh /app/start_services.sh
RUN chmod +x /app/start_services.sh

CMD ["/app/start_services.sh"]

# backend/Dockerfile

FROM python:3.11


RUN apt-get update && apt-get install -y \
    wget curl unzip gnupg ca-certificates \
    fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 \
    libcups2 libdbus-1-3 libgdk-pixbuf2.0-0 libnspr4 libnss3 \
    libx11-xcb1 libxcomposite1 libxdamage1 libxrandr2 xdg-utils \
    chromium chromium-driver \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*


WORKDIR /app

# Copy requirements from project root
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code from Dev/
COPY Dev/api/ ./api
COPY Dev/chatbot/ ./chatbot
COPY Dev/scrapers/ ./scrapers

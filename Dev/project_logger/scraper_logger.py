import logging
import os
import json
from datetime import datetime, timezone

class JsonScraperFormatter(logging.Formatter):
    def format(self, record):
        # Format log as structured JSON with UTC timestamp
        log_record = {
            "timestamp": datetime.now(timezone.utc).isoformat(timespec="milliseconds"),
            "level": record.levelname,
            "module": record.name,
            "message": record.getMessage(),
            "status": getattr(record, "status", "info"),
            "source": getattr(record, "source", "unknown"),
            "category": getattr(record, "category", "general"),
            "entity": getattr(record, "entity", None)
        }
        return json.dumps(log_record, ensure_ascii=False)

# === Config ===
LOG_DIR = os.path.join("data-collection", "log")
LOG_FILE = os.path.join(LOG_DIR, "scraper.log")

# Create directory if it doesn't exist
os.makedirs(LOG_DIR, exist_ok=True)

# Set up the logger
scraper_logger = logging.getLogger("ScraperLogger")
scraper_logger.setLevel(logging.DEBUG)

# File handler with UTF-8 and safe fallback
file_handler = logging.FileHandler(LOG_FILE, encoding="utf-8")
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(JsonScraperFormatter())

# Prevent duplicate handlers (important when reloading modules)
if not any(isinstance(h, logging.FileHandler) for h in scraper_logger.handlers):
    scraper_logger.addHandler(file_handler)

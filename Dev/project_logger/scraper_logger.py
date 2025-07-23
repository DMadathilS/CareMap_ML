import logging
import os
import json
from datetime import datetime, timezone

class JsonScraperFormatter(logging.Formatter):
    def format(self, record):
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
LOG_DIR = os.path.join("caremap_logs")
LOG_FILE = os.path.join(LOG_DIR, "scraper.log")
os.makedirs(LOG_DIR, exist_ok=True)

scraper_logger = logging.getLogger("ScraperLogger")
scraper_logger.setLevel(logging.DEBUG)
scraper_logger.propagate = False  # Prevent double logging

file_handler = logging.FileHandler(LOG_FILE, encoding="utf-8")
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(JsonScraperFormatter())

if not any(isinstance(h, logging.FileHandler) for h in scraper_logger.handlers):
    scraper_logger.addHandler(file_handler)

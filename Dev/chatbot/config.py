import os
import psycopg2
from pgvector.psycopg2 import register_vector
from sentence_transformers import SentenceTransformer
from langchain_groq import ChatGroq
from dotenv import load_dotenv

load_dotenv()

# DB
production = os.getenv("PRODUCTION", "false").lower() == "true"

# Choose DB host based on environment
db_host = os.getenv("DB_HOST_DOCKER") if production else os.getenv("DB_HOST")

# Set DB connection parameters
production = os.getenv("PRODUCTION", "false").lower() == "true"

# Choose DB host based on environment
db_host = os.getenv("DB_HOST_DOCKER") if production else os.getenv("DB_HOST")

# Set DB connection parameters
DB_PARAMS = {
    "dbname": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("PG_PASSWORD"),
    "host": db_host,
    "port": os.getenv("DB_PORT")
}
conn = psycopg2.connect(**DB_PARAMS)
register_vector(conn)
cur = conn.cursor()

# Embedder
EMBED_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
EMBEDDER = SentenceTransformer(EMBED_MODEL)

# LLM
LLM_MODEL = "llama3-8b-8192"
tool_llm = ChatGroq(model=LLM_MODEL, temperature=0.0, max_tokens=200, api_key=os.getenv("GROQ_API_KEY"))

# Constants
PAGE_SIZE = 5
REALTIME_PATH = "data-collection/Real-time/latest.json"

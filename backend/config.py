from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
# Embedding search configuration
EMBEDDING_SIMILARITY_THRESHOLD = float(os.getenv("EMBEDDING_SIMILARITY_THRESHOLD", 0.82))
EMBEDDING_SEARCH_CANDIDATES = int(os.getenv("EMBEDDING_SEARCH_CANDIDATES", 50))

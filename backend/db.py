import os
from pymongo import MongoClient
from pymongo.database import Database
from dotenv import load_dotenv

load_dotenv()

_client: MongoClient = None
_db: Database = None


def get_db() -> Database:
    global _client, _db
    if _db is None:
        mongo_uri = os.getenv("MONGO_URI")
        if not mongo_uri:
            raise RuntimeError("MONGO_URI environment variable not set")
        _client = MongoClient(mongo_uri)
        _db = _client["hirewise"]
        # Create indexes
        _db["users"].create_index("email", unique=True)
        _db["analyses"].create_index("user_id")
        _db["refresh_tokens"].create_index("token", unique=True)
        _db["refresh_tokens"].create_index("expires_at", expireAfterSeconds=0)
    return _db


def close_db():
    global _client, _db
    if _client:
        _client.close()
        _client = None
        _db = None
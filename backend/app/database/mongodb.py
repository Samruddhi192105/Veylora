import os

import certifi
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import PyMongoError

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
MONGODB_DATABASE = os.getenv("MONGODB_DATABASE")

if not MONGODB_URI:
    raise ValueError("MONGODB_URI is missing from the backend .env file")

if not MONGODB_DATABASE:
    raise ValueError("MONGODB_DATABASE is missing from the backend .env file")

client = MongoClient(
    MONGODB_URI,
    tlsCAFile=certifi.where(),
    serverSelectionTimeoutMS=10000,
)

db = client[MONGODB_DATABASE]


def check_mongodb_connection() -> bool:
    try:
        client.admin.command("ping")
        print("MongoDB Atlas connection successful.")
        return True
    except PyMongoError as error:
        print(f"MongoDB connection failed: {error}")
        return False

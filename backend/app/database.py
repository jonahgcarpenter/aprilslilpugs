import mysql.connector
from mysql.connector import pooling
from flask import current_app
from .config import Config
import logging

logger = logging.getLogger(__name__)
pool = None

def init_db(app):
    global pool
    try:
        pool = mysql.connector.pooling.MySQLConnectionPool(
            pool_name="mypool",
            pool_size=5,
            **Config.get_db_config()
        )
        logger.info("Database pool initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database pool: {e}")
        raise

def get_db_connection():
    try:
        if pool is None:
            raise RuntimeError("Database pool not initialized")
        return pool.get_connection()
    except Exception as e:
        logger.error(f"Failed to get database connection: {e}")
        raise

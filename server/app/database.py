"""
Database connection management module.
Handles MySQL connection pooling and provides connection interface.
"""
import mysql.connector
from mysql.connector import pooling
from flask import current_app
from .config import Config
import logging

logger = logging.getLogger(__name__)
pool = None

def init_db(app) -> None:
    """
    Initialize the database connection pool.
    
    Args:
        app: Flask application instance
    Raises:
        RuntimeError: If database configuration is invalid
    """
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
        raise RuntimeError(f"Database initialization failed: {e}")

def get_db_connection():
    """
    Get a connection from the pool.
    
    Returns:
        MySQLConnection: A database connection from the pool
    Raises:
        RuntimeError: If the pool is not initialized
    """
    if pool is None:
        raise RuntimeError("Database pool not initialized")
    try:
        return pool.get_connection()
    except Exception as e:
        logger.error(f"Failed to get database connection: {e}")
        raise

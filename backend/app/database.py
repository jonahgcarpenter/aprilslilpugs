import mysql.connector
from mysql.connector import Error
from flask import current_app
from .config import Config

def get_db_connection():
    try:
        # Log connection attempt
        db_config = Config.get_db_config()
        print("Attempting database connection with config:", {
            'host': db_config['host'],
            'user': db_config['user'],
            'database': db_config['database'],
            'port': db_config.get('port', 3306)
            # Excluding password for security
        })
        
        connection = mysql.connector.connect(**db_config)
        print("Database connection successful")
        return connection
    except mysql.connector.Error as err:
        print(f"Database connection failed: {err}")
        print(f"Error code: {err.errno}")
        print(f"SQLSTATE: {err.sqlstate}")
        print(f"Full error: {err.msg}")
        raise

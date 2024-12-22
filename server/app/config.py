"""
Application configuration management.
Handles all environment variables and configuration settings for the application.
"""
from datetime import timedelta
import os
from dotenv import load_dotenv

# Load environment variables
env_path = os.path.join('.env')
if os.path.exists(env_path):
    load_dotenv(env_path)
else:
    raise FileNotFoundError("Missing .env file in server directory")

def get_required_env(key: str) -> str:
    """
    Retrieve a required environment variable.
    Raises ValueError if the variable is not set.
    """
    value = os.getenv(key)
    if value is None:
        raise ValueError(f"Missing required environment variable: {key}")
    return value

class Config:
    """Central configuration class for the application."""
    
    # Core Flask Configuration
    SECRET_KEY = get_required_env('SECRET_KEY')
    DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    PORT = int(os.getenv('PORT', '5000'))
    
    # Security and Session Configuration
    SESSION_LIFETIME = int(os.getenv('SESSION_LIFETIME', '3600'))  # 1 hour default
    
    # File Upload Configuration
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', 'uploads')
    MAX_CONTENT_LENGTH = int(os.getenv('MAX_FILE_SIZE', '5242880'))  # 5MB default
    
    # CORS Configuration
    CORS_ORIGIN = 'http://localhost:5173'  # Vite development server
    CORS_HEADERS = ['Content-Type', 'Authorization']
    CORS_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    CORS_SUPPORTS_CREDENTIALS = True
    
    @staticmethod
    def get_db_config() -> dict:
        """Database connection configuration"""
        return {
            'host': get_required_env('MYSQL_HOST'),
            'port': int(os.getenv('MYSQL_PORT', '3306')),
            'user': get_required_env('MYSQL_USER'),
            'password': get_required_env('MYSQL_PASSWORD'),
            'database': get_required_env('MYSQL_DATABASE')
        }
    
    @staticmethod
    def get_redis_config() -> dict:
        """Redis connection configuration"""
        return {
            'host': get_required_env('REDIS_HOST'),
            'port': int(os.getenv('REDIS_PORT', '6379')),
            'db': int(os.getenv('REDIS_DB', '0')),
            'password': get_required_env('REDIS_PASSWORD'),
            'decode_responses': True
        }

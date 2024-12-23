"""Application configuration management"""
import os
from dotenv import load_dotenv

load_dotenv()

def get_env_or_raise(key: str) -> str:
    """Get environment variable or raise error if not found"""
    value = os.getenv(key)
    if value is None:
        raise ValueError(f"Required environment variable '{key}' is not set")
    return value

class Config:
    """Application configuration"""
    
    # Core Configuration
    SECRET_KEY = get_env_or_raise('SECRET_KEY')
    PORT = int(get_env_or_raise('WAITRESS_PORT'))
    DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    
    # CORS Configuration
    CORS_ORIGINS = get_env_or_raise('CORS_ORIGINS').split(',')
    CORS_HEADERS = [
        'Content-Type',
        'Authorization',
        'Access-Control-Allow-Credentials',
        'X-Requested-With'
    ]
    CORS_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    
    # File Upload Configuration
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5MB
    
    # Session Configuration
    SESSION_LIFETIME = int(get_env_or_raise('SESSION_LIFETIME'))
    
    @staticmethod
    def get_db_config():
        """Database connection configuration"""
        return {
            'host': get_env_or_raise('MYSQL_HOST'),
            'user': get_env_or_raise('MYSQL_USER'),
            'password': get_env_or_raise('MYSQL_PASSWORD'),
            'database': get_env_or_raise('MYSQL_DATABASE')
        }
    
    @staticmethod
    def get_redis_config():
        """Redis connection configuration"""
        return {
            'host': get_env_or_raise('REDIS_HOST'),
            'port': int(get_env_or_raise('REDIS_PORT')),
            'db': int(get_env_or_raise('REDIS_DB')),
            'password': get_env_or_raise('REDIS_PASSWORD'),
            'decode_responses': True
        }

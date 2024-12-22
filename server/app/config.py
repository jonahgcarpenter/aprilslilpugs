"""Application configuration management"""
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Application configuration"""
    
    # Core Configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-key-change-in-prod')
    PORT = int(os.getenv('PORT', '5000'))
    DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    
    # CORS Configuration
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:5173').split(',')
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
    SESSION_LIFETIME = int(os.getenv('SESSION_LIFETIME', '3600'))
    
    @staticmethod
    def get_db_config():
        """Database connection configuration"""
        return {
            'host': os.getenv('MYSQL_HOST', 'localhost'),
            'user': os.getenv('MYSQL_USER', 'root'),
            'password': os.getenv('MYSQL_PASSWORD', ''),
            'database': os.getenv('MYSQL_DATABASE', 'aprilslilpugs')
        }
    
    @staticmethod
    def get_redis_config():
        """Redis connection configuration"""
        return {
            'host': os.getenv('REDIS_HOST', 'localhost'),
            'port': int(os.getenv('REDIS_PORT', '6379')),
            'db': int(os.getenv('REDIS_DB', '0')),
            'password': os.getenv('REDIS_PASSWORD', None),
            'decode_responses': True
        }

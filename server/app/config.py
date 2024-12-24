"""Application configuration and environment management"""
import os
from dotenv import load_dotenv
from typing import Dict, Any
import logging
from pathlib import Path
import mysql.connector
from mysql.connector import Error

# Configure logging with more detail
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def find_env_file() -> Path:
    """Find and validate the environment file"""
    try:
        root_dir = Path(__file__).resolve().parent.parent.parent
        env_file = root_dir / '.env'
        
        logger.info(f"Project root directory: {root_dir}")
        logger.info(f"Looking for .env file at: {env_file}")
        
        if not root_dir.exists():
            raise FileNotFoundError(f"Project root directory not found: {root_dir}")
            
        if not env_file.exists():
            raise FileNotFoundError(
                f"\nEnvironment file not found at: {env_file}\n"
                f"Current working directory: {os.getcwd()}\n"
                f"Please ensure .env file exists in: {root_dir}"
            )
            
        if not os.access(env_file, os.R_OK):
            raise PermissionError(
                f"Permission denied: Cannot read .env file at {env_file}"
            )
            
        return env_file
    except Exception as e:
        logger.error(f"Error finding .env file: {str(e)}")
        raise

# Find and load environment file
env_file = find_env_file()
logger.info(f"Loading environment from: {env_file}")
load_dotenv(dotenv_path=env_file)

class Config:
    """Centralized configuration management"""
    
    @staticmethod
    def get_env_or_raise(key: str, default: Any = None) -> Any:
        """Get environment variable with validation"""
        value = os.getenv(key, default)
        if value is None:
            raise ValueError(f"Required environment variable '{key}' is not set")
        return value

    # Core Configuration
    DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    ENV = os.getenv('FLASK_ENV', 'development')
    SECRET_KEY = os.getenv('SECRET_KEY')
    
    if not SECRET_KEY:
        logger.error("SECRET_KEY environment variable is missing")
        logger.debug(f"Current environment variables: {dict(os.environ)}")
        raise ValueError("Required environment variable 'SECRET_KEY' is not set")
    
    # Server Configuration
    HOST = os.getenv('WAITRESS_HOST', '0.0.0.0')
    PORT = int(os.getenv('WAITRESS_PORT', '5000'))
    THREADS = int(os.getenv('WAITRESS_THREADS', '4'))
    
    # File Upload Settings
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5MB
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    
    # Session Configuration
    SESSION_LIFETIME = int(os.getenv('SESSION_LIFETIME', '1800'))
    SESSION_ACTIVITY_TIMEOUT = int(os.getenv('SESSION_ACTIVITY_TIMEOUT', '1800'))
    SESSION_CLEANUP_INTERVAL = int(os.getenv('SESSION_CLEANUP_INTERVAL', '300'))
    
    # Update static file configuration to serve from server/static
    _project_root = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
    STATIC_FOLDER = os.path.join(_project_root, 'static')
    
    # Log the static folder location during startup
    logger.info(f"Static files will be served from: {STATIC_FOLDER}")
    if not os.path.exists(STATIC_FOLDER):
        logger.warning(f"Static folder not found at: {STATIC_FOLDER}")
        os.makedirs(STATIC_FOLDER, exist_ok=True)
        logger.info(f"Created static folder at: {STATIC_FOLDER}")
    
    # Remove STATIC_URL_PATH setting to serve from root
    
    @classmethod
    def get_db_config(cls) -> Dict[str, Any]:
        """Database connection configuration"""
        return {
            'host': cls.get_env_or_raise('MYSQL_HOST'),
            'port': int(cls.get_env_or_raise('MYSQL_PORT', '3306')),
            'user': cls.get_env_or_raise('MYSQL_USER'),
            'password': cls.get_env_or_raise('MYSQL_PASSWORD'),
            'database': cls.get_env_or_raise('MYSQL_DATABASE')
        }
    
    @classmethod
    def get_db_connection(cls):
        """Get a database connection using configuration"""
        try:
            connection = mysql.connector.connect(**cls.get_db_config())
            return connection
        except Error as e:
            logger.error(f"Error connecting to MySQL database: {e}")
            raise

    @classmethod
    def execute_query(cls, query: str, params: tuple = None):
        """Execute a database query with proper connection handling"""
        connection = None
        cursor = None
        try:
            connection = cls.get_db_connection()
            cursor = connection.cursor(dictionary=True)
            cursor.execute(query, params)
            return cursor.fetchall()
        except Error as e:
            logger.error(f"Database query error: {e}")
            raise
        finally:
            if cursor:
                cursor.close()
            if connection and connection.is_connected():
                connection.close()

    @classmethod
    def get_redis_config(cls) -> Dict[str, Any]:
        """Redis connection configuration"""
        return {
            'host': cls.get_env_or_raise('REDIS_HOST'),
            'port': int(cls.get_env_or_raise('REDIS_PORT', '6379')),
            'db': int(cls.get_env_or_raise('REDIS_DB', '0')),
            'password': cls.get_env_or_raise('REDIS_PASSWORD'),
            'decode_responses': True,
            'socket_timeout': 5,
            'socket_connect_timeout': 5,
            'retry_on_timeout': True,
            'ssl': cls.get_env_or_raise('REDIS_SSL', 'False').lower() == 'true'
        }

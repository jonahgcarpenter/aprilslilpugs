import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Core MySQL configuration
    MYSQL_HOST = os.getenv('MYSQL_HOST')
    MYSQL_PORT = int(os.getenv('MYSQL_PORT')) if os.getenv('MYSQL_PORT') else None
    MYSQL_USER = os.getenv('MYSQL_USER')
    MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD')
    MYSQL_DATABASE = os.getenv('MYSQL_DATABASE')
    
    # Basic Flask configuration
    SECRET_KEY = os.getenv('SECRET_KEY')

    # Redis configuration
    REDIS_HOST = os.getenv('REDIS_HOST')
    REDIS_PORT = int(os.getenv('REDIS_PORT')) if os.getenv('REDIS_PORT') else None
    REDIS_DB = int(os.getenv('REDIS_DB')) if os.getenv('REDIS_DB') else None
    REDIS_PASSWORD = os.getenv('REDIS_PASSWORD')
    SESSION_LIFETIME = int(os.getenv('SESSION_LIFETIME')) if os.getenv('SESSION_LIFETIME') else None

    # Session configuration
    SESSION_TYPE = 'redis'
    PERMANENT_SESSION_LIFETIME = SESSION_LIFETIME
    SESSION_PERMANENT = True

    @staticmethod
    def get_redis_config():
        config = {}
        if Config.REDIS_HOST:
            config['host'] = Config.REDIS_HOST
        if Config.REDIS_PORT:
            config['port'] = Config.REDIS_PORT
        if Config.REDIS_DB is not None:
            config['db'] = Config.REDIS_DB
        if Config.REDIS_PASSWORD:
            config['password'] = Config.REDIS_PASSWORD
        
        config['decode_responses'] = True
        
        if not config.get('host') or not config.get('port'):
            raise ValueError("Missing required Redis configuration")
            
        return config

    @staticmethod
    def get_db_config():
        config = {}
        if Config.MYSQL_HOST:
            config['host'] = Config.MYSQL_HOST
        if Config.MYSQL_PORT:
            config['port'] = Config.MYSQL_PORT
        if Config.MYSQL_USER:
            config['user'] = Config.MYSQL_USER
        if Config.MYSQL_PASSWORD:
            config['password'] = Config.MYSQL_PASSWORD
        if Config.MYSQL_DATABASE:
            config['database'] = Config.MYSQL_DATABASE
        
        # Log config (excluding password)
        print("Database configuration:", {
            k: v for k, v in config.items() if k != 'password'
        })
        
        required_fields = ['host', 'user', 'database']
        missing_fields = [field for field in required_fields if field not in config]
        if missing_fields:
            raise ValueError(f"Missing required database configuration: {', '.join(missing_fields)}")
            
        return config

    @classmethod
    def validate(cls):
        required = ['MYSQL_HOST', 'MYSQL_PORT', 'MYSQL_USER', 
                   'MYSQL_DATABASE', 'REDIS_HOST',
                   'REDIS_PORT', 'SECRET_KEY']
        missing = [key for key in required if not getattr(cls, key)]
        if missing:
            raise ValueError(f"Missing required environment variables: {', '.join(missing)}")

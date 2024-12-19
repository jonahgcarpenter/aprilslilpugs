from datetime import timedelta
import os
from dotenv import load_dotenv

# Load environment variables from instance/.env
env_path = os.path.join('/app', 'instance', '.env')
if os.path.exists(env_path):
    load_dotenv(env_path)

class Config:
    # Flask config
    SECRET_KEY = os.getenv('SECRET_KEY')
    DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    PORT = int(os.getenv('PORT', '446'))
    
    # Session config
    SESSION_LIFETIME = int(os.getenv('SESSION_LIFETIME', '3600'))
    
    @staticmethod
    def get_db_config():
        return {
            'host': os.getenv('MYSQL_HOST'),
            'port': int(os.getenv('MYSQL_PORT', '3306')),
            'user': os.getenv('MYSQL_USER'),
            'password': os.getenv('MYSQL_PASSWORD'),
            'database': os.getenv('MYSQL_DATABASE')
        }
    
    @staticmethod
    def get_redis_config():
        return {
            'host': os.getenv('REDIS_HOST'),
            'port': int(os.getenv('REDIS_PORT', '6379')),
            'db': int(os.getenv('REDIS_DB', '0')),
            'password': os.getenv('REDIS_PASSWORD'),
            'decode_responses': True
        }

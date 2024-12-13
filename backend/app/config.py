import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Core MySQL configuration
    MYSQL_HOST = os.getenv('MYSQL_HOST')
    MYSQL_PORT = int(os.getenv('MYSQL_PORT'))
    MYSQL_USER = os.getenv('MYSQL_USER')
    MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD')
    MYSQL_DATABASE = os.getenv('MYSQL_DATABASE')
    
    # Basic Flask configuration
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev')

    @classmethod
    def validate(cls):
        required = ['MYSQL_HOST', 'MYSQL_PORT', 'MYSQL_USER', 
                   'MYSQL_PASSWORD', 'MYSQL_DATABASE']
        missing = [key for key in required if not getattr(cls, key)]
        if missing:
            raise ValueError(f"Missing required environment variables: {', '.join(missing)}")

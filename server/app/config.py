from os import environ
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Basic Flask Config
    SECRET_KEY = environ.get('FLASK_SECRET_KEY') or 'dev'
    
    # MySQL Configuration
    MYSQL_HOST = environ.get('MYSQL_HOST', 'localhost')
    MYSQL_USER = environ.get('MYSQL_USER')
    MYSQL_PASSWORD = environ.get('MYSQL_PASSWORD')
    MYSQL_DB = environ.get('MYSQL_DB')
    MYSQL_PORT = int(environ.get('MYSQL_PORT', 3306))

    @classmethod
    def validate(cls):
        required_vars = ['MYSQL_USER', 'MYSQL_PASSWORD', 'MYSQL_DB']
        missing = [var for var in required_vars if not environ.get(var)]
        if missing:
            raise ValueError(f"Missing required environment variables: {', '.join(missing)}")

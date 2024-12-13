import os
import secrets
from dotenv import load_dotenv

load_dotenv()

print("Loading environment variables...")

class Config:
    MYSQL_HOST = os.getenv('MYSQL_HOST')
    MYSQL_PORT = int(os.getenv('MYSQL_PORT'))
    MYSQL_USER = os.getenv('MYSQL_USER')
    MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD')
    MYSQL_DATABASE = os.getenv('MYSQL_DATABASE')

    # Generate a secure random key
    SECRET_KEY = secrets.token_hex(32)
    
    # Session configuration
    SESSION_TYPE = 'filesystem'
    SESSION_PERMANENT = True
    PERMANENT_SESSION_LIFETIME = 86400  # 24 hours in seconds
    SESSION_COOKIE_SECURE = False  # Must be False for local development with http
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    SESSION_REFRESH_EACH_REQUEST = True
    SESSION_COOKIE_NAME = 'session'  # Simplified cookie name
    SESSION_FILE_DIR = '/tmp/flask_session'  # Ensure this directory exists
    SESSION_FILE_THRESHOLD = 500  # Maximum number of sessions stored on disk
    SESSION_KEY_PREFIX = 'alp_'  # Add prefix to session keys
    SESSION_USE_SIGNER = True  # Add extra security
    
    # Production settings
    if os.environ.get('FLASK_ENV') == 'production':
        SERVER_NAME = 'aprilslilpugs.com'  # Replace with your domain
        PREFERRED_URL_SCHEME = 'https'

    @classmethod
    def validate(cls):
        required = ['MYSQL_HOST', 'MYSQL_PORT', 'MYSQL_USER', 'MYSQL_PASSWORD', 'MYSQL_DATABASE']
        missing = [key for key in required if not getattr(cls, key)]
        if missing:
            raise ValueError(f"Missing required environment variables: {', '.join(missing)}")
    
    @staticmethod
    def validate():
        if os.environ.get('FLASK_ENV') == 'production':
            assert Config.SESSION_COOKIE_SECURE, "HTTPS must be enabled in production"

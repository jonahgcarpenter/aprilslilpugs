"""Server configuration and startup utilities"""
import os
import logging
from app import create_app
from dotenv import load_dotenv

load_dotenv()

def setup_logging():
    """Configure logging for production"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('./logs/server.log'),
            logging.StreamHandler()
        ]
    )

def get_server_config(environment):
    """Get Waitress configuration based on environment"""
    if environment == 'production':
        return {
            'host': '0.0.0.0',  # Allow external connections
            'port': int(os.getenv('WAITRESS_PORT', 8000)),
            'threads': int(os.getenv('WAITRESS_THREADS', 16)),
            'connection_limit': int(os.getenv('WAITRESS_CONNECTION_LIMIT', 2000)),
            'channel_timeout': int(os.getenv('WAITRESS_CHANNEL_TIMEOUT', 60)),
            'cleanup_interval': int(os.getenv('WAITRESS_CLEANUP_INTERVAL', 30)),
            'ident': 'PugBreeder-Production'
        }
    return {
        'host': os.getenv('WAITRESS_HOST', 'localhost'),
        'port': int(os.getenv('WAITRESS_PORT', 5000)),
        'threads': int(os.getenv('WAITRESS_THREADS', 4)),
        'connection_limit': int(os.getenv('WAITRESS_CONNECTION_LIMIT', 1000)),
        'channel_timeout': int(os.getenv('WAITRESS_CHANNEL_TIMEOUT', 30)),
        'cleanup_interval': int(os.getenv('WAITRESS_CLEANUP_INTERVAL', 30)),
        'ident': os.getenv('WAITRESS_IDENT', 'PugBreeder')
    }

def run_server(environment='development'):
    """Run server using Waitress"""
    if environment == 'production':
        setup_logging()
    
    from waitress import serve
    config = get_server_config(environment)
    logger = logging.getLogger('waitress')
    logger.info(f"Starting Waitress server in {environment} mode on http://{config['host']}:{config['port']}")
    
    # Create app with environment string
    app = create_app(environment)
    serve(app, **config)

from app import create_app
from app.config import Config
from waitress import serve
import logging
from flask import request
import os
from dotenv import load_dotenv

# Load environment variables from root .env
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.DEBUG if os.getenv('FLASK_DEBUG') == 'True' else logging.INFO)
logger = logging.getLogger(__name__)

app = create_app(os.getenv('FLASK_ENV', 'development'))

# Debug: Print all registered routes
if os.getenv('FLASK_DEBUG') == 'True':
    print("\nRegistered Routes:")
    for rule in app.url_map.iter_rules():
        print(f"{rule.endpoint}: {rule.rule}")

@app.before_request
def log_request_info():
    if os.getenv('FLASK_DEBUG') == 'True':
        logger.debug('Headers: %s', request.headers)
        logger.debug('Body: %s', request.get_data())

# Error handlers
@app.errorhandler(404)
def not_found(e):
    if request.path.startswith('/api/'):
        return {"error": "API endpoint not found"}, 404
    return app.send_static_file('index.html')

@app.errorhandler(500)
def server_error(e):
    if request.path.startswith('/api/'):
        return {"error": "Internal server error"}, 500
    return app.send_static_file('index.html')

if __name__ == "__main__":
    port = int(os.getenv('WAITRESS_PORT', 5000))
    host = os.getenv('WAITRESS_HOST', '127.0.0.1')
    debug = os.getenv('FLASK_DEBUG') == 'True'
    
    if debug:
        app.run(host=host, port=port, debug=True)
    else:
        threads = int(os.getenv('WAITRESS_THREADS', 4))
        logger.info(f'Starting production server on {host}:{port} with {threads} threads')
        serve(app, host=host, port=port, threads=threads)

"""
Application factory module.
Handles Flask app initialization and configuration.
"""
from flask import Flask, send_from_directory
from .config import Config
from .routes import auth_bp, breeder_bp, aboutus_bp
import logging
import os

logger = logging.getLogger(__name__)

def create_app(environment: str = 'development') -> Flask:
    """Create and configure the Flask application"""
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Get the server directory path (one level up from app directory)
    server_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    static_folder = os.path.join(server_dir, 'static')
    
    logger.info(f"Setting static folder to: {static_folder}")
    
    # Initialize Flask app with correct static folder
    app = Flask(__name__, 
                static_folder=static_folder,
                static_url_path='')
    
    # Load configuration
    app.config.from_object(Config)
    
    # Register blueprints with /api prefix
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(breeder_bp, url_prefix='/api/breeder')
    app.register_blueprint(aboutus_bp, url_prefix='/api/aboutus')

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        """
        Serve static files from the static directory.
        - API routes (/api/*) are handled by the respective blueprints
        - Static files are served from the static directory
        - All other routes return index.html for client-side routing
        """
        if path.startswith('api/'):
            return {"error": "Not found"}, 404

        try:
            static_path = os.path.join(app.static_folder, path)
            index_path = os.path.join(app.static_folder, 'index.html')
            
            logger.info(f"Static folder configured as: {app.static_folder}")
            logger.info(f"Looking for file at: {static_path}")
            
            # First try to serve static files
            if path and os.path.exists(static_path):
                logger.info(f"Serving static file: {static_path}")
                return send_from_directory(app.static_folder, path)

            # For all other routes, serve index.html
            logger.info(f"Falling back to index.html at: {index_path}")
            if not os.path.exists(index_path):
                logger.error(f"index.html not found at: {index_path}")
                return {"error": "index.html not found"}, 404
                
            return send_from_directory(app.static_folder, 'index.html')

        except Exception as e:
            logger.error(f"Error serving file: {e}")
            logger.error(f"Static folder: {app.static_folder}")
            logger.error(f"Requested path: {path}")
            return {"error": "File not found"}, 404

    return app
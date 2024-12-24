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
    
    # Initialize Flask app without static folder
    app = Flask(__name__)
    
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
            # First try to serve static files
            if path and os.path.exists(os.path.join(app.config['STATIC_FOLDER'], path)):
                return send_from_directory(app.config['STATIC_FOLDER'], path)

            # For all other routes, serve index.html
            return send_from_directory(app.config['STATIC_FOLDER'], 'index.html')

        except Exception as e:
            logger.error(f"Error serving file: {e}")
            return {"error": "File not found"}, 404

    return app
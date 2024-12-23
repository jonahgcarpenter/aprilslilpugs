"""
Application factory module.
Handles Flask app initialization and configuration.
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from .config import Config
from .database import init_db
from .routes import main_bp, auth_bp, breeder_bp, aboutus_bp  # Changed from about_bp
import logging

logger = logging.getLogger(__name__)

def create_app(environment='development'):
    """
    Create and configure the Flask application.
    Args:
        environment (str): The environment to run in ('development' or 'production')
    """
    app = Flask(__name__)
    
    # Configure the app based on environment
    if environment == 'production':
        app.config['ENV'] = 'production'
        app.config['DEBUG'] = False
    else:
        app.config['ENV'] = 'development'
        app.config['DEBUG'] = True
    
    app.config.from_object(Config)

    # Configure logging
    logging.basicConfig(level=logging.INFO)

    # Configure CORS with better security settings
    CORS(app, 
         resources={r"/api/*": {
             "origins": Config.CORS_ORIGINS,
             "allow_credentials": True,
             "expose_headers": ['Content-Type', 'Authorization'],
             "methods": Config.CORS_METHODS,
             "supports_credentials": True,
             "max_age": 600  # Cache preflight requests for 10 minutes
         }},
         vary_header=True)

    @app.after_request
    def after_request(response):
        origin = request.headers.get('Origin')
        if origin in Config.CORS_ORIGINS:
            # Set CORS headers explicitly
            response.headers['Access-Control-Allow-Origin'] = origin
            response.headers['Access-Control-Allow-Credentials'] = 'true'
            response.headers['Access-Control-Allow-Methods'] = ', '.join(Config.CORS_METHODS)
            response.headers['Access-Control-Allow-Headers'] = ', '.join(Config.CORS_HEADERS)
            
            # Add security headers
            response.headers['X-Content-Type-Options'] = 'nosniff'
            response.headers['X-Frame-Options'] = 'DENY'
            response.headers['X-XSS-Protection'] = '1; mode=block'
            
        return response

    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify({
            "error": "Not Found",
            "message": "The requested resource was not found."
        }), 404

    @app.errorhandler(Exception)
    def handle_error(error):
        logger.error(f"Unhandled exception: {str(error)}", exc_info=True)
        response = jsonify({
            "error": "Internal Server Error",
            "message": str(error) if app.debug else "An unexpected error occurred."
        })
        return response, getattr(error, 'code', 500)

    try:
        # Initialize database connection
        init_db(app)
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise

    # Register blueprints with /api prefix
    blueprints = [
        (main_bp, '/api'),
        (auth_bp, '/api/auth'),
        (breeder_bp, '/api/breeder'),
        (aboutus_bp, '/api/aboutus')  # Changed URL prefix
    ]

    for blueprint, prefix in blueprints:
        app.register_blueprint(blueprint, url_prefix=prefix)
        logger.info(f"Registered blueprint: {blueprint.name} at {prefix}")

    return app
"""
Application factory module.
Handles Flask app initialization and configuration.
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from redis import Redis
import os
from .config import Config
from .database import init_db
from .routes import main_bp, auth_bp, breeder_bp, aboutus_bp

redis_client = None

def create_app(config_class=Config):
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(config_class)

    CORS(app, resources={
        r"/*": {
            "origins": ["http://localhost:5173"],  # Vite's default port
            "supports_credentials": True,
            "allow_headers": ["Content-Type", "Authorization"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
        }
    })

    # CORS preflight handler
    @app.after_request
    def after_request(response):
        if request.method == 'OPTIONS':
            response = app.make_default_options_response()
            
        # Only allow the Vite dev server origin
        response.headers.update({
            'Access-Control-Allow-Origin': 'http://localhost:5173',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Methods': ', '.join(Config.CORS_METHODS),
            'Access-Control-Allow-Headers': ', '.join(Config.CORS_HEADERS)
        })
        
        return response

    @app.errorhandler(Exception)
    def handle_error(error):
        response = jsonify({
            "error": str(error),
            "message": "An error occurred processing your request."
        })
        return response, getattr(error, 'code', 500)

    # Initialize Redis
    global redis_client
    redis_client = Redis(**Config.get_redis_config())
    
    # Initialize database
    init_db(app)

    # Register blueprints
    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp, url_prefix='/api/auth')  # Changed from '/auth' to '/api/auth'
    app.register_blueprint(breeder_bp)
    app.register_blueprint(aboutus_bp)

    @app.route('/api/test')
    def test():
        return {"message": "API working!"}

    return app
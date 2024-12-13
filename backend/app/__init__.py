from flask import Flask
from flask_session import Session
from flask_cors import CORS
import os
from .config import Config
from .routes import bp

def create_app():
    app = Flask(__name__)
    
    # Set fixed secret key and session directory
    SESSION_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'flask_sessions')
    os.makedirs(SESSION_DIR, exist_ok=True)
    
    app.config.update(
        SECRET_KEY='dev-key-123',  # Fixed key for development
        SESSION_TYPE='filesystem',
        SESSION_FILE_DIR=SESSION_DIR,
        SESSION_PERMANENT=True,
        PERMANENT_SESSION_LIFETIME=86400,
        SESSION_FILE_THRESHOLD=500,
        SESSION_COOKIE_NAME='alp_session',
        SESSION_COOKIE_SECURE=False,
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE='Lax',
        SESSION_USE_SIGNER=True,
        SESSION_REFRESH_EACH_REQUEST=True
    )
    
    # Initialize session
    Session(app)
    
    # Initialize CORS
    CORS(app, 
         supports_credentials=True,
         resources={r"/api/*": {
             "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
             "methods": ["GET", "POST", "OPTIONS"],
             "allow_headers": ["Content-Type"],
             "expose_headers": ["Content-Type"]
         }})
    
    # Load remaining config after session setup
    app.config.from_object('app.config.Config')
    
    # Register blueprints
    app.register_blueprint(bp)

    return app

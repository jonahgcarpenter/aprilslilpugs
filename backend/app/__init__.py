from flask import Flask
from redis import Redis
import os
from .config import Config
from .database import init_db
from .routes import main_bp, auth_bp, breeder_bp, aboutus_bp

redis_client = None

def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)
    
    # Ensure instance folder exists
    os.makedirs(app.instance_path, exist_ok=True)

    # Load configurations
    if test_config is None:
        app.config.from_object(Config)
        app.config.from_pyfile('config.py', silent=True)
    else:
        app.config.update(test_config)

    # Initialize Redis
    global redis_client
    redis_client = Redis(**Config.get_redis_config())
    
    # Initialize database
    init_db(app)

    # Register blueprints
    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(breeder_bp)
    app.register_blueprint(aboutus_bp)

    return app
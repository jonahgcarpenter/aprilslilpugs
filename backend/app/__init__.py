from flask import Flask
from flask_cors import CORS
from .config import Config
from .routes import bp
from .routes.auth import auth_bp
from .routes.breeder import breeder_bp
from .routes.litters import litters
from .routes.grumbles import grumbles
from .routes.puppies import puppies

def create_app(test_config=None):
    app = Flask(__name__)
    
    # Load configuration
    if test_config is None:
        app.config.from_object(Config)
        Config.validate()
    else:
        app.config.update(test_config)

    # Configure session
    app.secret_key = app.config['SECRET_KEY']
    
    # Enable CORS
    CORS(app, supports_credentials=True)

    # Register blueprints
    app.register_blueprint(bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(breeder_bp)
    app.register_blueprint(litters)
    app.register_blueprint(grumbles)
    app.register_blueprint(puppies)

    return app

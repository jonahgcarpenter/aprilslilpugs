from flask import Flask
from flask_cors import CORS
from .config import Config

def create_app(test_config=None):
    app = Flask(__name__)
    
    # Load configuration
    if test_config is None:
        app.config.from_object(Config)
        Config.validate()
    else:
        app.config.update(test_config)

    # Enable CORS
    CORS(app, supports_credentials=True)

    # Register blueprints
    from .routes import bp
    app.register_blueprint(bp)

    return app

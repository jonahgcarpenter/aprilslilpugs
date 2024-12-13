from flask import Flask
from flask_cors import CORS
from .config import Config

def create_app(config_class=Config):
    config_class.validate()
    
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Update CORS configuration
    CORS(app, 
         resources={
             r"/api/*": {
                 "origins": ["http://localhost:5173"],
                 "methods": ["GET", "POST", "OPTIONS"],
                 "allow_headers": ["Content-Type"],
                 "supports_credentials": True,
                 "max_age": 600
             }
         })

    from .routes import bp
    app.register_blueprint(bp)

    @app.errorhandler(404)
    def not_found(e):
        return {"error": "Route not found"}, 404

    @app.errorhandler(500)
    def server_error(e):
        return {"error": "Internal server error"}, 500

    return app

from flask import Flask, send_from_directory, make_response, g
from .config import Config
from .routes import init_routes
from .utils.logger import setup_logger
from .db import mysql
import os

def create_app():
    Config.validate()
    
    app_mode = os.environ.get('APP_MODE', 'production').lower()
    
    if app_mode == 'production':
        dist_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'dist'))
        app = Flask(__name__, static_folder=dist_path, static_url_path='')
        
        @app.route('/', defaults={'path': ''})
        @app.route('/<path:path>')
        def serve(path):
            if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
                return send_from_directory(app.static_folder, path)
            else:
                return send_from_directory(app.static_folder, 'index.html')
    else:
        app = Flask(__name__)
    
    app.config.from_object(Config)
    setup_logger(app)
    
    @app.teardown_appcontext
    def close_db_connection(exception):
        db = getattr(g, '_database', None)
        if db is not None:
            db.close()
    
    try:
        mysql.init_app(app)
        with app.app_context():
            cursor = mysql.connection.cursor()
            cursor.execute('SELECT 1')
            cursor.close()
            app.logger.info("Successfully connected to MySQL")
    except Exception as e:
        app.logger.error(f"Failed to connect to MySQL: {e}")
        raise
    
    init_routes(app)
    app.logger.info("Application startup complete")
    return app
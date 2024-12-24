from flask import Blueprint, jsonify, current_app
from .auth import auth_bp
from .breeder import breeder_bp
from .about import about_bp
import os

api_bp = Blueprint('api', __name__)

def init_routes(app):
    app.logger.info('Initializing routes...')
    app.register_blueprint(api_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(breeder_bp, url_prefix='/api/breeder')
    app.register_blueprint(about_bp, url_prefix='/api/about')
    app.logger.info('Routes initialized successfully')

@api_bp.route('/health')
def health():
    current_app.logger.debug("Health check endpoint called")
    return jsonify({"status": "healthy"})

__all__ = ['auth_bp', 'breeder_bp', 'about_bp', 'api_bp']

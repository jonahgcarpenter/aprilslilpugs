from flask import Blueprint, send_from_directory, current_app
import os

main_bp = Blueprint('main', __name__)

# API routes should come first for specificity
@main_bp.route('/api/<path:path>')
def api_routes(path):
    # Handle API routes here
    return {'error': 'API endpoint not found'}, 404

# Static file serving and SPA fallback
@main_bp.route('/', defaults={'path': ''})
@main_bp.route('/<path:path>')
def serve_frontend(path):
    # Get the absolute path to the frontend/dist directory
    dist_dir = os.path.join('/app', 'frontend', 'dist')
    
    # First try to serve the exact file
    if path and os.path.exists(os.path.join(dist_dir, path)):
        return send_from_directory(dist_dir, path)
    
    # For all other routes, serve index.html to support SPA routing
    return send_from_directory(dist_dir, 'index.html')
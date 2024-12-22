"""
Main route handler for serving frontend assets and API fallback.
"""
from flask import Blueprint, send_from_directory, current_app, redirect, url_for
import os

main_bp = Blueprint('main', __name__)

@main_bp.route('/api/<path:path>')
def api_routes(path):
    """Handle unknown API routes with proper 404 response"""
    return {'error': 'API endpoint not found', 'path': path}, 404

# Static file serving and SPA fallback
@main_bp.route('/', defaults={'path': ''})
@main_bp.route('/<path:path>') 
def serve_frontend(path):
    # In development, redirect ALL non-API routes to Vite dev server
    if current_app.debug:
        vite_url = f'http://localhost:5173/{path}' if path else 'http://localhost:5173/'
        return redirect(vite_url)
    
    # In production, serve from the built files
    dist_dir = os.path.join(current_app.root_path, 'client', 'dist')
    
    # Try to serve requested file
    if path:
        try:
            return send_from_directory(dist_dir, path)
        except:
            # If file not found, fallback to index.html
            pass
    
    # Serve index.html for root path or if file not found (SPA fallback)
    try:
        return send_from_directory(dist_dir, 'index.html')
    except:
        return 'Frontend assets not found. Make sure you have built the frontend.', 404
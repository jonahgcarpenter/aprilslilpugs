"""
Main route handler for API endpoints.
"""
from flask import Blueprint, jsonify

main_bp = Blueprint('main', __name__)

@main_bp.route('/health')  # Will be /api/health
def health_check():
    """Basic health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'aprilslilpugs-api'
    })

@main_bp.route('/<path:path>')  # Will be /api/<path>
def api_routes(path):
    """Handle unknown API routes with proper 404 response"""
    return {'error': 'API endpoint not found', 'path': path}, 404
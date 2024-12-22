"""Middleware for request processing"""
from functools import wraps
from flask import request, current_app, jsonify, session
from typing import Callable

def login_required(f: Callable) -> Callable:
    """Ensure route is only accessible to authenticated users"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({"error": "Authentication required"}), 401
        return f(*args, **kwargs)
    return decorated_function

def security_headers(f: Callable) -> Callable:
    """Add security headers to responses"""
    @wraps(f)
    def wrapped(*args, **kwargs):
        response = f(*args, **kwargs)
        if isinstance(response, tuple):
            response, status_code = response
        else:
            status_code = 200
            
        headers = {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block'
        }
        
        if isinstance(response, dict):
            response = jsonify(response)
            
        for key, value in headers.items():
            response.headers[key] = value
            
        return response, status_code
    return wrapped

from functools import wraps
from flask import session, jsonify, current_app
from flask import make_response

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        print("Current session in middleware:", dict(session))  # Debug log
        if not session.get('logged_in'):
            response = jsonify({
                "error": "Authentication required",
                "authenticated": False,
                "isAdmin": False
            })
            response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
            response.headers.add('Access-Control-Allow-Credentials', 'true')
            response.status_code = 401
            return response
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('logged_in') or not session.get('is_admin'):
            response = jsonify({
                "error": "Admin access required",
                "authenticated": session.get('logged_in', False),
                "isAdmin": False
            })
            response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
            response.headers.add('Access-Control-Allow-Credentials', 'true')
            response.status_code = 403
            return response
        return f(*args, **kwargs)
    return decorated_function

def check_auth():
    is_authenticated = session.get('logged_in', False)
    is_admin = session.get('is_admin', False)
    return jsonify({
        "authenticated": is_authenticated,
        "isAdmin": is_admin
    })

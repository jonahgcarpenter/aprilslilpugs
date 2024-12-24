"""
Authentication routes module.

Endpoints:
    GET  /api/auth/health        : Service health check
    POST /api/auth/login         : User authentication and session creation
    POST /api/auth/logout        : Session termination
    GET  /api/auth/check-session : Validate current session and return user data
"""
# Standard library imports
import json
import time
import uuid
import logging
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from werkzeug.exceptions import HTTPException

# Third party imports
from flask import Blueprint, jsonify, request
import bcrypt
import redis

# Local imports
from ..config import Config

logger = logging.getLogger(__name__)

auth_bp = Blueprint('auth', __name__)

# Initialize Redis connection using config
try:
    redis_client = redis.Redis(**Config.get_redis_config())
    redis_client.ping()  # Test connection
    REDIS_AVAILABLE = True
except (redis.RedisError, Exception) as e:
    logger.warning(f"Redis connection failed: {e}. Running without session storage.")
    redis_client = None
    REDIS_AVAILABLE = False

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

class AuthError(Exception):
    """Custom exception for authentication errors"""
    def __init__(self, message: str, code: int = 401):
        self.message = message
        self.code = code

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def store_session(session_token: str, session_data: Dict[str, Any], expiry: int) -> bool:
    """Store session data with improved security and validation"""
    if not REDIS_AVAILABLE or not session_token or not session_data:
        return False
    try:
        session_key = f"session:{session_token}"
        session_data.update({
            'last_activity': int(time.time()),
            'created': int(time.time()),
            'user_agent': request.headers.get('User-Agent'),
            'ip': request.remote_addr
        })
        return bool(redis_client.setex(session_key, expiry, json.dumps(session_data)))
    except Exception as e:
        logger.error(f"Session storage error: {e}")
        return False

def get_session(session_token: str) -> dict:
    """Retrieve session data safely"""
    if not REDIS_AVAILABLE or not session_token:
        return None
    try:
        session_key = f"session:{session_token}"
        data = redis_client.get(session_key)
        return json.loads(data) if data else None
    except Exception as e:
        logger.error(f"Session retrieval error: {e}")
        return None

@auth_bp.errorhandler(Exception)
def handle_error(error):
    if isinstance(error, HTTPException):
        return jsonify({"error": error.description}), error.code
    
    logger.exception("Unexpected error occurred")
    return jsonify({"error": "Internal server error"}), 500

@auth_bp.route('/health', methods=['GET'])  # Will be /api/auth/health
def health_check():
    """Health check endpoint for service monitoring"""
    status = {
        'database': False,
        'redis': False,
        'status': 'unhealthy',
        'errors': {}
    }
    
    try:
        # Check database
        conn = Config.get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT 1')
        cursor.fetchone()
        cursor.close()
        conn.close()
        status['database'] = True
    except Exception as e:
        error_details = str(e)
        print(f"Database health check failed: {error_details}")
        status['errors']['database'] = error_details
    
    try:
        # Check Redis
        redis_client.ping()
        status['redis'] = True
    except Exception as e:
        error_details = str(e)
        print(f"Redis health check failed: {error_details}")
        status['errors']['redis'] = error_details
    
    if status['database'] and status['redis']:
        status['status'] = 'healthy'
    
    return jsonify(status)

@auth_bp.route('/login', methods=['POST'])  # Will be /api/auth/login
def login():
    """Enhanced login with rate limiting and security headers"""
    try:
        # Rate limiting check
        client_ip = request.remote_addr
        if redis_client and redis_client.get(f"login_attempts:{client_ip}"):
            return jsonify({
                "status": "error",
                "message": "Too many login attempts"
            }), 429

        data = request.get_json()
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({"status": "error", "message": "Email and password are required"}), 400

        conn = Config.get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        try:
            cursor.execute("""
                SELECT id, email, firstName, password, active 
                FROM breeder 
                WHERE email = %s AND active > 0
            """, (data['email'],))
            user = cursor.fetchone()

            if not user or not bcrypt.checkpw(data['password'].encode('utf-8'), user['password'].encode('utf-8')):
                if redis_client:
                    redis_client.setex(f"login_attempts:{client_ip}", 300, "1")
                return jsonify({
                    "status": "error",
                    "message": "Invalid credentials"
                }), 401

            session_token = str(uuid.uuid4())
            session_data = {
                'user_id': user['id'],
                'created_at': int(time.time()),
                'last_activity': int(time.time())
            }
            
            store_session(session_token, session_data, Config.SESSION_LIFETIME)
            
            response = jsonify({
                "status": "success",
                "data": {
                    "authenticated": True,
                    "user": {
                        "id": user['id'],
                        "email": user['email'],
                        "firstName": user['firstName'],
                        "isAdmin": user['active'] == 2  # active=2 means admin
                    }
                }
            })
            
            response.set_cookie(
                'session_token',
                session_token,
                httponly=True,
                secure=not Config.DEBUG,
                samesite='Lax',
                max_age=Config.SESSION_LIFETIME,
                path='/'
            )
            
            return response

        finally:
            cursor.close()
            conn.close()
            
    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({
            "status": "error",
            "message": "Authentication failed"
        }), 500

@auth_bp.route('/logout', methods=['POST'])  # Will be /api/auth/logout
def logout():
    try:
        session_token = request.cookies.get('session_token')
        if not session_token:
            return jsonify({
                "status": "success",
                "message": "Already logged out"
            })

        # Verify session before logout
        session_data = get_session(session_token)
        if session_data and REDIS_AVAILABLE:
            redis_client.delete(f"session:{session_token}")
        
        response = jsonify({
            "status": "success",
            "message": "Logout successful"
        })
        response.delete_cookie('session_token', path='/')
        return response

    except Exception as e:
        logger.error(f"Logout error: {e}")
        return jsonify({
            "status": "error",
            "message": "Logout failed"
        }), 500

@auth_bp.route('/check-session', methods=['GET'])  # Will be /api/auth/check-session
def check_session():
    """Check if user has a valid session and return user data if authenticated"""
    try:
        session_token = request.cookies.get('session_token')
        if not session_token:
            return jsonify({
                "status": "success",
                "data": {
                    "authenticated": False,
                    "reason": "no_session"
                }
            }), 200

        session_data = get_session(session_token)
        if not session_data:
            response = jsonify({
                "status": "success",
                "data": {
                    "authenticated": False,
                    "reason": "invalid_session"
                }
            })
            response.delete_cookie('session_token', path='/')
            return response, 200

        # Check session activity timeout
        last_activity = session_data.get('last_activity', 0)
        if time.time() - last_activity > Config.SESSION_ACTIVITY_TIMEOUT:
            if REDIS_AVAILABLE:
                redis_client.delete(f"session:{session_token}")
            response = jsonify({
                "status": "success",
                "data": {
                    "authenticated": False,
                    "reason": "session_timeout"
                }
            })
            response.delete_cookie('session_token', path='/')
            return response, 200

        # Get user data
        conn = Config.get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        try:
            cursor.execute("""
                SELECT id, email, firstName, active 
                FROM breeder 
                WHERE id = %s AND active > 0
            """, (session_data['user_id'],))
            user = cursor.fetchone()

            if not user:
                if REDIS_AVAILABLE:
                    redis_client.delete(f"session:{session_token}")
                response = jsonify({
                    "status": "success",
                    "data": {
                        "authenticated": False,
                        "reason": "user_not_found"
                    }
                })
                response.delete_cookie('session_token', path='/')
                return response, 200

            # Update session activity timestamp
            session_data['last_activity'] = int(time.time())
            store_session(session_token, session_data, Config.SESSION_LIFETIME)

            return jsonify({
                "status": "success",
                "data": {
                    "authenticated": True,
                    "user": {
                        "id": user['id'],
                        "email": user['email'],
                        "firstName": user['firstName'],
                        "isAdmin": user['active'] == 2
                    }
                }
            }), 200

        finally:
            cursor.close()
            conn.close()

    except Exception as e:
        logger.error(f"Session check error: {e}")
        return jsonify({
            "status": "error",
            "message": "Session check failed",
            "error": str(e) if Config.DEBUG else None
        }), 500
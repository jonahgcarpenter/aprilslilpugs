"""
Authentication routes module.
Handles user authentication, session management, and registration.

Routes:
    - /health   : Service health check
    - /login    : User authentication
    - /logout   : Session termination
    - /session  : Session validation
    - /register : New user registration
"""
# Standard library imports
import json
import time
import uuid
import logging

# Third party imports
from flask import Blueprint, jsonify, request
from flask_cors import cross_origin
import bcrypt
import redis

# Local imports
from app.database import get_db_connection
from app.config import Config

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

def store_session(session_token: str, session_data: dict, expiry: int) -> bool:
    """Store session data safely"""
    if not REDIS_AVAILABLE:
        return False
    try:
        session_key = f"session:{session_token}"
        return redis_client.setex(session_key, expiry, json.dumps(session_data))
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
        conn = get_db_connection()
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

@auth_bp.route('/login', methods=['POST', 'OPTIONS'])  # Will be /api/auth/login
@cross_origin(supports_credentials=True)
def login():
    if request.method == 'OPTIONS':
        return handle_preflight()

    try:
        data = request.get_json()
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({"status": "error", "message": "Email and password are required"}), 400

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        try:
            cursor.execute("""
                SELECT id, email, firstName, password, active 
                FROM breeder 
                WHERE email = %s AND active = 1
            """, (data['email'],))
            user = cursor.fetchone()

            if not user or not bcrypt.checkpw(data['password'].encode('utf-8'), user['password'].encode('utf-8')):
                return jsonify({
                    "status": "error",
                    "message": "Invalid credentials"
                }), 401

            session_token = str(uuid.uuid4())
            session_data = {
                'user_id': user['id'],
                'created_at': int(time.time())
            }
            
            store_session(session_token, session_data, Config.SESSION_LIFETIME)
            
            response = jsonify({
                "status": "success",
                "data": {
                    "authenticated": True,
                    "user": {
                        "id": user['id'],
                        "email": user['email'],
                        "firstName": user['firstName']
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
@cross_origin(supports_credentials=True)
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

@auth_bp.route('/session', methods=['GET'])  # Will be /api/auth/session
@cross_origin(supports_credentials=True)
def check_session():
    try:
        session_token = request.cookies.get('session_token')
        if not session_token:
            return jsonify({
                "status": "success",
                "data": {
                    "authenticated": False
                }
            })

        session_data = get_session(session_token)
        if not session_data:
            response = jsonify({
                "status": "success",
                "data": {
                    "authenticated": False
                }
            })
            response.delete_cookie('session_token', path='/')
            return response

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        try:
            cursor.execute("""
                SELECT id, email, firstName, active 
                FROM breeder 
                WHERE id = %s AND active = 1
            """, (session_data['user_id'],))
            user = cursor.fetchone()

            if not user:
                if REDIS_AVAILABLE:
                    redis_client.delete(f"session:{session_token}")
                response = jsonify({
                    "status": "success",
                    "data": {
                        "authenticated": False
                    }
                })
                response.delete_cookie('session_token', path='/')
                return response

            return jsonify({
                "status": "success",
                "data": {
                    "authenticated": True,
                    "user": {
                        "id": user['id'],
                        "email": user['email'],
                        "firstName": user['firstName']
                    }
                }
            })

        finally:
            cursor.close()
            conn.close()

    except Exception as e:
        logger.error(f"Session check error: {e}")
        return jsonify({
            "status": "error",
            "message": "Session check failed"
        }), 500

@auth_bp.route('/register', methods=['POST', 'OPTIONS'])  # Will be /api/auth/register
@cross_origin(supports_credentials=True)
def register_breeder():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    print("Registration request received")
    print("Request headers:", dict(request.headers))
    
    try:
        # Handle multipart form data
        email = request.form.get('email')
        password = request.form.get('password')
        user_detail = json.loads(request.form.get('userDetail', '{}'))
        profile_image = request.files.get('profileImage')
        
        breeder_data = {
            'email': email,
            'password': password,
            'firstName': user_detail.get('firstName'),
            'lastName': user_detail.get('lastName'),
            'city': user_detail.get('city'),
            'state': user_detail.get('state'),
            'experienceYears': user_detail.get('experienceYears'),
            'story': user_detail.get('story'),
            'phone': user_detail.get('phone'),
            'profile_image': None
        }

        # Validate required fields
        required_fields = ['email', 'password', 'firstName', 'lastName']
        missing_fields = [field for field in required_fields if not breeder_data.get(field)]
        if missing_fields:
            return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400

        # Process profile image if provided
        if profile_image:
            if not allowed_file(profile_image.filename):
                return jsonify({
                    "error": f"Invalid file type. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
                }), 415
            
            if len(profile_image.read()) > MAX_FILE_SIZE:
                return jsonify({
                    "error": f"File size too large. Maximum size: {MAX_FILE_SIZE/1024/1024}MB"
                }), 413
            
            # Reset file pointer after reading
            profile_image.seek(0)
            breeder_data['profile_image'] = profile_image.read()

        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if email exists
        cursor.execute('SELECT id FROM breeder WHERE email = %s', (breeder_data['email'],))
        if cursor.fetchone():
            return jsonify({"error": "Email already registered"}), 409

        # Hash password
        hashed_password = bcrypt.hashpw(breeder_data['password'].encode('utf-8'), bcrypt.gensalt())

        # Updated insert query with profile_image
        insert_query = """
            INSERT INTO breeder (
                email, password, firstName, lastName,
                city, state, experienceYears, story, phone,
                profile_image
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        cursor.execute(insert_query, (
            breeder_data['email'],
            hashed_password,
            breeder_data['firstName'],
            breeder_data['lastName'],
            breeder_data['city'],
            breeder_data['state'],
            breeder_data['experienceYears'],
            breeder_data['story'],
            breeder_data['phone'],
            breeder_data['profile_image']
        ))
        
        conn.commit()
        return jsonify({
            "message": "Breeder registered successfully",
            "id": cursor.lastrowid
        }), 201

    except Exception as e:
        print(f"Registration error: {e}")
        return jsonify({"error": str(e)}), 500

    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

def handle_preflight():
    response = jsonify({})
    response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response
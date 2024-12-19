from flask import Blueprint, jsonify, request, session, current_app
from app.database import get_db_connection
from app.config import Config
import redis
import bcrypt
import os
import json
import time
from werkzeug.utils import secure_filename
from werkzeug.exceptions import HTTPException
import logging
import uuid

logger = logging.getLogger(__name__)

auth_bp = Blueprint('auth', __name__)

# Initialize Redis connection using config
redis_client = redis.Redis(**Config.get_redis_config())

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def create_session(user_id):
    """Create a new session token and store in Redis"""
    session_token = str(uuid.uuid4())
    session_key = f"session:{session_token}"
    session_data = {
        'user_id': user_id,
        'created_at': int(time.time())
    }
    redis_client.setex(
        session_key,
        Config.SESSION_LIFETIME,
        json.dumps(session_data)
    )
    return session_token

def get_session(session_token):
    """Get session data from Redis"""
    if not session_token:
        return None
    session_key = f"session:{session_token}"
    data = redis_client.get(session_key)
    if data:
        redis_client.expire(session_key, Config.SESSION_LIFETIME)  # Extend session
        return json.loads(data)
    return None

@auth_bp.errorhandler(Exception)
def handle_error(error):
    if isinstance(error, HTTPException):
        return jsonify({"error": error.description}), error.code
    
    logger.exception("Unexpected error occurred")
    return jsonify({"error": "Internal server error"}), 500

@auth_bp.route('/api/health', methods=['GET'])
def health_check():
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

@auth_bp.route('/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({"error": "Email and password are required"}), 400

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        try:
            # Get user from database
            cursor.execute("SELECT id, email, firstName, password FROM breeder WHERE email = %s", (data['email'],))
            user = cursor.fetchone()

            if not user or not bcrypt.checkpw(data['password'].encode('utf-8'), user['password'].encode('utf-8')):
                return jsonify({"error": "Invalid credentials"}), 401

            # Create session
            session_token = create_session(user['id'])
            
            response = jsonify({
                "success": True,
                "user": {
                    "id": user['id'],
                    "email": user['email'],
                    "firstName": user['firstName']
                }
            })
            
            # Set session cookie
            response.set_cookie(
                'session_token',
                session_token,
                httponly=True,
                secure=False,  # Set to True in production with HTTPS
                samesite='Lax',
                max_age=Config.SESSION_LIFETIME
            )
            
            return response

        finally:
            cursor.close()
            conn.close()

    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({"error": "Login failed"}), 500

@auth_bp.route('/auth/logout', methods=['POST'])
def legacy_logout():
    return logout()

@auth_bp.route('/api/auth/logout', methods=['POST'])
def logout():
    try:
        session_token = request.cookies.get('session_token')
        if session_token:
            redis_client.delete(f"session:{session_token}")
        
        response = jsonify({
            "message": "Logout successful",
            "authenticated": False
        })
        response.delete_cookie('session_token')
        return response

    except Exception as e:
        logger.error(f"Logout error: {e}")
        return jsonify({
            "message": "Logged out but session cleanup failed",
            "authenticated": False
        })

@auth_bp.route('/api/auth/session', methods=['GET'])
def check_session():
    try:
        session_token = request.cookies.get('session_token')
        session_data = get_session(session_token)
        
        if not session_data:
            return jsonify({"authenticated": False}), 401

        try:
            # Get user info from database
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT id, email, firstName FROM breeder WHERE id = %s", (session_data['user_id'],))
            user = cursor.fetchone()
            print(f"User data from DB: {user}")
            
            if not user:
                print("User not found in database")
                redis_client.delete(f"session:{session_token}")
                return jsonify({"authenticated": False}), 401

            return jsonify({
                "authenticated": True,
                "user": {
                    "id": user['id'],
                    "email": user['email'],
                    "firstName": user['firstName']
                }
            }), 200

        finally:
            if 'cursor' in locals():
                cursor.close()
            if 'conn' in locals():
                conn.close()

    except redis.RedisError as e:
        print(f"Redis error: {e}")
        return jsonify({"error": "Session store error", "authenticated": False}), 500
    except Exception as e:
        print(f"Session check error: {e}")
        logger.error(f"Session check error: {e}")
        return jsonify({
            "error": str(e),
            "authenticated": False,
            "message": "Session check failed"
        }), 500

@auth_bp.route('/api/auth/register', methods=['POST', 'OPTIONS'])
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
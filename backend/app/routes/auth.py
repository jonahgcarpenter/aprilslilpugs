from flask import Blueprint, jsonify, request, session, current_app
from flask_cors import CORS
from ..database import get_db_connection
from ..config import Config
import redis
import bcrypt

auth_bp = Blueprint('auth', __name__)
CORS(auth_bp, supports_credentials=True, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173", "http://localhost:3000"],  # Add Vite's default port
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"],
        "expose_headers": ["Content-Type"],
    }
})

# Initialize Redis connection using config
redis_client = redis.Redis(**Config.get_redis_config())

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

@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    print("Login request received")
    print("Request headers:", dict(request.headers))
    print("Request body:", request.get_data(as_text=True))
    
    response_headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Credentials': 'true'
    }
    
    try:
        if not request.is_json:
            print("Error: Request is not JSON")
            return jsonify({"error": "Invalid request format"}), 400, response_headers

        if not current_app.config['SECRET_KEY']:
            print("Error: Missing SECRET_KEY")
            return jsonify({"error": "Server configuration error: Missing secret key"}), 500, response_headers

        data = request.get_json()
        print("Parsed JSON data:", data)
        
        if not data or 'email' not in data or 'password' not in data:
            print("Error: Missing email or password in request")
            return jsonify({"error": "Email and password required"}), 400, response_headers

        try:
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)
        except Exception as db_error:
            print(f"Database connection error: {db_error}")
            return jsonify({"error": f"Database connection error: {str(db_error)}"}), 500, response_headers
            
        try:
            cursor.execute("""
                SELECT id, email, password 
                FROM breeder 
                WHERE email = %s
            """, (data['email'],))
            
            user = cursor.fetchone()
        except Exception as query_error:
            print(f"Database query error: {query_error}")
            return jsonify({"error": f"Database query error: {str(query_error)}"}), 500, response_headers

        if not user:
            print("Error: User not found")
            return jsonify({"error": "User not found"}), 401, response_headers
            
        if not bcrypt.checkpw(data['password'].encode('utf-8'), user['password'].encode('utf-8')):
            print("Error: Invalid password")
            return jsonify({"error": "Invalid password"}), 401, response_headers

        try:
            session['user_id'] = user['id']
            redis_client.set(
                f"session:{user['id']}", 
                'active', 
                ex=Config.SESSION_LIFETIME
            )
        except Exception as redis_error:
            print(f"Session storage error: {redis_error}")
            return jsonify({"error": f"Session storage error: {str(redis_error)}"}), 500, response_headers

        return jsonify({"message": "Login successful"}), 200, response_headers

    except Exception as e:
        print(f"Unexpected error in login route: {e}")
        return jsonify({"error": "Internal server error"}), 500, response_headers
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

@auth_bp.route('/api/auth/logout', methods=['POST'])
def logout():
    try:
        user_id = session.get('user_id')
        if (user_id):
            redis_client.delete(f"session:{user_id}")
            session.clear()
            
        return jsonify({"message": "Logout successful"})

    except Exception as e:
        print(f"Logout error: {e}")
        return jsonify({"error": str(e)}), 500

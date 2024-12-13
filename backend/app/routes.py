from flask import Blueprint, jsonify, request, send_file, make_response, session
from flask_session import Session
from mysql.connector import Error
from .database import get_db_connection
import base64
import io
import secrets
from flask_cors import CORS
from .utils import check_password
from .middleware import login_required
from datetime import timedelta, datetime
import os

bp = Blueprint('main', __name__)
CORS(bp, supports_credentials=True, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Add Session configuration
def init_session(app):
    if not os.path.exists('/tmp/flask_session'):
        os.makedirs('/tmp/flask_session')
    
    app.config.from_object('app.config.Config')
    app.config['SESSION_FILE_DIR'] = '/tmp/flask_session'
    app.secret_key = secrets.token_hex(32)  # Generate new secret key
    Session(app)

@bp.route('/')
def health_check():
    return jsonify({"status": "Server is running"})

@bp.route('/api/breeder', methods=['GET'])
def get_breeder_info():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT firstName, lastName, city, state, 
                   experienceYears, story, phone, email,
                   profile_image
            FROM breeder 
            LIMIT 1
        """)
        
        breeder = cursor.fetchone()
        
        if breeder:
            if (breeder['profile_image']):
                image_base64 = base64.b64encode(breeder['profile_image']).decode('utf-8')
                breeder['profile_image'] = f"data:image/jpeg;base64,{image_base64}"
            return jsonify(breeder)
        return jsonify({"error": "Breeder not found"}), 404

    except Error as e:
        print(f"Database error: {str(e)}")
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

@bp.route('/api/test', methods=['GET'])
def test_route():
    return jsonify({"message": "Backend is working!"})

@bp.route('/api/breeder/image', methods=['POST', 'OPTIONS'])
def upload_profile_image():
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

    try:
        if 'image' not in request.files:
            response = jsonify({"error": "No image file provided"})
        else:
            image = request.files['image']
            if image.filename == '':
                response = jsonify({"error": "No image selected"})
            else:
                image_binary = image.read()
                conn = get_db_connection()
                cursor = conn.cursor()
                
                cursor.execute("""
                    UPDATE breeder 
                    SET profile_image = %s 
                    WHERE id = 1
                """, (image_binary,))
                
                conn.commit()
                response = jsonify({"message": "Image uploaded successfully"})
                
                if 'cursor' in locals():
                    cursor.close()
                if 'conn' in locals():
                    conn.close()

        # Add CORS headers to all responses
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

    except Exception as e:
        print(f"Upload error: {str(e)}")
        response = jsonify({"error": str(e)})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 500

@bp.route('/api/breeder/update', methods=['POST', 'OPTIONS'])
def update_breeder_info():
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

    try:
        data = request.json
        print("Received update data:", data)  # Debug log
        
        if not data:
            response = jsonify({"error": "No data provided"})
            response.status_code = 400
        else:
            required_fields = ['firstName', 'lastName', 'city', 'state', 
                             'experienceYears', 'story', 'phone', 'email']
            
            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                response = jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"})
                response.status_code = 400
            else:
                conn = get_db_connection()
                cursor = conn.cursor()
                
                update_query = """
                    UPDATE breeder 
                    SET firstName = %s, 
                        lastName = %s,
                        city = %s,
                        state = %s,
                        experienceYears = %s,
                        story = %s,
                        phone = %s,
                        email = %s
                    WHERE id = 1
                """
                
                cursor.execute(update_query, (
                    data['firstName'],
                    data['lastName'],
                    data['city'],
                    data['state'],
                    int(data['experienceYears']),
                    data['story'],
                    data['phone'],
                    data['email']
                ))
                
                conn.commit()
                
                if cursor.rowcount == 0:
                    response = jsonify({"message": "No changes were made"})
                else:
                    response = jsonify({"message": "Breeder information updated successfully"})
                
                cursor.close()
                conn.close()

        # Add CORS headers to all responses
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

    except Exception as e:
        print(f"Update error: {str(e)}")
        response = jsonify({"error": str(e)})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        response.status_code = 500
        return response

@bp.route('/api/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return handle_options_request()

    try:
        data = request.json
        print("Login attempt with:", data)
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT id, email, password, firstName, lastName, is_admin 
            FROM breeder 
            WHERE email = %s
        """, (data['email'],))
        
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if user and check_password(data['password'], user['password']):
            # Clear and set new session data
            session.clear()
            session.permanent = True
            
            # Set session data directly
            session['user_id'] = user['id']
            session['email'] = user['email']
            session['name'] = f"{user['firstName']} {user['lastName']}"
            session['logged_in'] = True
            session['is_admin'] = bool(user['is_admin'])
            
            # Force session save
            session.modified = True
            
            print("New session data:", dict(session))
            
            response = jsonify({
                "message": "Login successful",
                "authenticated": True,
                "isAdmin": session['is_admin'],
                "user": {
                    "id": session['user_id'],
                    "email": session['email'],
                    "name": session['name']
                }
            })
            
            # Set headers
            response.headers.update({
                'Access-Control-Allow-Origin': 'http://localhost:5173',
                'Access-Control-Allow-Credentials': 'true',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            })
            
            return response
            
        return create_error_response("Invalid credentials", 401)

    except Exception as e:
        print(f"Login error: {str(e)}")
        return create_error_response(str(e), 500)

@bp.route('/api/check-auth', methods=['GET'])
def check_auth():
    session_data = dict(session)
    print("Full session data:", session_data)
    
    is_authenticated = bool(session.get('logged_in', False))
    is_admin = bool(session.get('is_admin', False))
    
    response_data = {
        "authenticated": is_authenticated,
        "isAdmin": is_admin,
        "user": {
            "id": session.get('user_id'),
            "email": session.get('email'),
            "name": session.get('name')
        } if is_authenticated else None
    }
    
    print("Sending auth response:", response_data)
    
    response = jsonify(response_data)
    response.headers.update({
        'Access-Control-Allow-Origin': 'http://localhost:5173',
        'Access-Control-Allow-Credentials': 'true',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
    })
    
    return response

@bp.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return create_success_response({"message": "Logged out successfully"})

@bp.route('/api/reset-password', methods=['POST', 'OPTIONS'])
def reset_password():
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

    try:
        data = request.json
        if not data or 'email' not in data or 'newPassword' not in data:
            return create_error_response("Email and new password are required", 400)

        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Hash the new password using bcrypt instead of werkzeug
        from .utils import hash_password  # Use the same hashing as login
        hashed_password = hash_password(data['newPassword'])
        
        # Update the password
        cursor.execute("""
            UPDATE breeder 
            SET password = %s 
            WHERE email = %s
        """, (hashed_password, data['email']))
        
        conn.commit()
        
        if cursor.rowcount == 0:
            cursor.close()
            conn.close()
            return create_error_response("Email not found", 404)
            
        cursor.close()
        conn.close()
        
        return create_success_response({"message": "Password reset successful"})

    except Exception as e:
        print(f"Password reset error: {str(e)}")
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()
        return create_error_response(str(e), 500)

# Helper functions for consistent responses
def create_success_response(data):
    response = jsonify(data)
    response.headers.update({
        'Access-Control-Allow-Origin': 'http://localhost:5173',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Expose-Headers': 'Content-Type',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    })
    return response

def create_error_response(message, status_code):
    response = jsonify({"error": message})
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    response.status_code = status_code
    return response

def handle_options_request():
    response = make_response()
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

# Example of using the login_required decorator
@bp.route('/api/protected-route', methods=['GET'])
@login_required
def protected_route():
    return create_success_response({"message": "This is a protected route"})

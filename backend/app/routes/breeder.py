from flask import Blueprint, jsonify, request, session
from flask_cors import CORS
from functools import wraps
from ..database import get_db_connection
from mysql.connector import Error
import base64

breeder_bp = Blueprint('breeder', __name__)
CORS(breeder_bp, supports_credentials=True)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({"error": "Authentication required"}), 401
        return f(*args, **kwargs)
    return decorated_function

@breeder_bp.route('/api/breeder', methods=['GET'])
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
            if breeder['profile_image']:
                image_base64 = base64.b64encode(breeder['profile_image']).decode('utf-8')
                breeder['profile_image'] = f"data:image/jpeg;base64,{image_base64}"
            return jsonify(breeder)
        return jsonify({"error": "Breeder not found"}), 404

    except Error as e:
        print(f"Database error: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

@breeder_bp.route('/api/breeder/update', methods=['POST'])
@login_required
def update_breeder_info():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400

        required_fields = ['firstName', 'lastName', 'city', 'state', 
                         'experienceYears', 'story', 'phone', 'email']
        
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400

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
        return jsonify({"message": "Breeder information updated successfully"})

    except Exception as e:
        print(f"Update error: {e}")
        return jsonify({"error": str(e)}), 500

    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

@breeder_bp.route('/api/breeder/image', methods=['POST'])
@login_required
def upload_profile_image():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image file provided"}), 400

        image = request.files['image']
        if image.filename == '':
            return jsonify({"error": "No image selected"}), 400

        image_binary = image.read()
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE breeder 
            SET profile_image = %s 
            WHERE id = 1
        """, (image_binary,))
        
        conn.commit()
        return jsonify({"message": "Image uploaded successfully"})

    except Exception as e:
        print(f"Upload error: {e}")
        return jsonify({"error": str(e)}), 500

    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

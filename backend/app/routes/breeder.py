from flask import Blueprint, jsonify, request, session, current_app
from functools import wraps
from app.database import get_db_connection
import base64

breeder_bp = Blueprint('breeder', __name__)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({"error": "Authentication required"}), 401
        return f(*args, **kwargs)
    return decorated_function

@breeder_bp.route('/api/breeder/profile', methods=['GET'])
def get_breeder_profile():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        try:
            cursor.execute("""
                SELECT 
                    firstName, lastName, city, state,
                    experienceYears, story, phone, email,
                    profile_image
                FROM breeder 
                LIMIT 1
            """)
            
            breeder = cursor.fetchone()
            
            if not breeder:
                return jsonify({"error": "No breeder profile found"}), 404
                
            # Convert profile_image bytes to base64 string if it exists
            if breeder['profile_image']:
                breeder['profile_image'] = base64.b64encode(breeder['profile_image']).decode('utf-8')
                
            return jsonify(breeder)

        finally:
            cursor.close()
            conn.close()
            
    except Exception as e:
        current_app.logger.error(f"Error fetching breeder profile: {e}")
        return jsonify({"error": "Failed to fetch breeder profile"}), 500
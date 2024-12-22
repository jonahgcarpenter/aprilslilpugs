"""Breeder profile management routes"""
from flask import Blueprint, jsonify, request, current_app
from flask_cors import cross_origin
from app.database import get_db_connection
from app.utils.validation import validate_breeder_data
from app.utils.image import process_image
from app.middleware import login_required, security_headers
import base64

breeder_bp = Blueprint('breeder', __name__)

@breeder_bp.route('/profile', methods=['GET'])
@cross_origin(supports_credentials=True)
@security_headers
def get_breeder_profile():
    """Retrieve breeder profile information"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        try:
            cursor.execute("""
                SELECT firstName, lastName, city, state,
                       experienceYears, story, phone, email,
                       profile_image
                FROM breeder 
                WHERE active = 1
                LIMIT 1
            """)
            
            breeder = cursor.fetchone()
            if not breeder:
                return jsonify({"error": "No breeder profile found"}), 404
                
            if breeder['profile_image']:
                breeder['profile_image'] = base64.b64encode(breeder['profile_image']).decode('utf-8')
                
            return jsonify({
                "status": "success",
                "data": breeder
            })

        finally:
            cursor.close()
            conn.close()
            
    except Exception as e:
        current_app.logger.error(f"Error fetching breeder profile: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@breeder_bp.route('/profile', methods=['PUT'])
@login_required
@cross_origin(supports_credentials=True)
@security_headers
def update_breeder_profile():
    try:
        data = request.form.to_dict()
        errors = validate_breeder_data(data)
        
        if errors:
            return jsonify({"errors": errors}), 400
            
        if 'profile_image' in request.files:
            image_data = request.files['profile_image'].read()
            processed_image = process_image(image_data)
            if processed_image:
                data['profile_image'] = processed_image
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        try:
            update_fields = [f"{k} = %s" for k in data.keys()]
            query = f"""
                UPDATE breeder 
                SET {', '.join(update_fields)}
                WHERE id = %s
            """
            values = list(data.values()) + [request.user_id]
            
            cursor.execute(query, values)
            conn.commit()
            
            return jsonify({
                "status": "success",
                "message": "Profile updated successfully"
            })
            
        finally:
            cursor.close()
            conn.close()
            
    except Exception as e:
        current_app.logger.error(f"Profile update error: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
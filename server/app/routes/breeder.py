from flask import Blueprint, jsonify, current_app
import base64
from ..db import mysql

breeder_bp = Blueprint('breeder', __name__)

@breeder_bp.route('/', methods=['GET'])
def get_breeder():
    cursor = None
    try:
        cursor = mysql.connection.cursor()
        # Fetch the first breeder from the database
        cursor.execute("""
            SELECT 
                id, email, firstName, lastName, 
                city, state, experienceYears, story,
                phone, profile_image
            FROM breeders
            LIMIT 1
        """)
        
        breeder = cursor.fetchone()
        
        if not breeder:
            return jsonify({
                "status": "error",
                "message": "No breeder found"
            }), 404

        breeder_data = {
            "id": breeder['id'],
            "email": breeder['email'],
            "firstName": breeder['firstName'] or "",
            "lastName": breeder['lastName'] or "",
            "city": breeder['city'] or "",
            "state": breeder['state'] or "",
            "experienceYears": breeder['experienceYears'] or 0,
            "story": breeder['story'] or "",
            "phone": breeder['phone'] or "",
            "profile_image": base64.b64encode(breeder['profile_image']).decode('utf-8') if breeder['profile_image'] else None
        }

        return jsonify({
            "status": "success",
            "data": breeder_data
        })

    except Exception as e:
        current_app.logger.error(f"Database error: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "Failed to fetch breeder data"
        }), 500
    finally:
        if cursor:
            cursor.close()
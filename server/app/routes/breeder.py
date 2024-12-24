from flask import Blueprint, jsonify, current_app
import base64
from ..db import mysql

breeder_bp = Blueprint('breeder', __name__)

@breeder_bp.route('/', methods=['GET'])
def get_breeder():
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
        cursor.close()
        
        if not breeder:
            return jsonify({
                "status": "error",
                "message": "No breeder found"
            }), 404

        breeder_data = {
            "id": breeder[0],
            "email": breeder[1],
            "firstName": breeder[2] or "",
            "lastName": breeder[3] or "",
            "city": breeder[4] or "",
            "state": breeder[5] or "",
            "experienceYears": breeder[6] or 0,
            "story": breeder[7] or "",
            "phone": breeder[8] or "",
            "profile_image": base64.b64encode(breeder[9]).decode('utf-8') if breeder[9] else None
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
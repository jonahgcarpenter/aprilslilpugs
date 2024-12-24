"""
Breeder profile management routes.
"""
from flask import Blueprint, jsonify, request, current_app
import base64
from typing import Optional
from ..config import Config
import logging

logger = logging.getLogger(__name__)
breeder_bp = Blueprint('breeder', __name__)

@breeder_bp.route('/breeders', methods=['GET'])  # Simplified route
def get_breeders():
    try:
        conn = Config.get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute("""
                SELECT firstName, lastName, city, state, phone, email,
                       experienceYears, story, profile_image
                FROM breeder 
                WHERE active = 1
            """)
            
            breeders = cursor.fetchall()
            
            # Convert column names to dictionary
            columns = [desc[0] for desc in cursor.description]
            breeder_data = []
            
            for breeder in breeders:
                breeder_dict = dict(zip(columns, breeder))
                if breeder_dict['profile_image']:
                    breeder_dict['profile_image'] = base64.b64encode(breeder_dict['profile_image']).decode()
                breeder_data.append(breeder_dict)

            return jsonify({
                "status": "success",
                "data": breeder_data
            })

        finally:
            cursor.close()
            conn.close()

    except Exception as e:
        logger.error(f"Error fetching breeder data: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500

@breeder_bp.route('/breeders/<int:breeder_id>', methods=['GET'])
def get_breeder(breeder_id):
    try:
        conn = Config.get_db_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute("""
                SELECT firstName, lastName, city, state, phone, email,
                       experienceYears, story, profile_image
                FROM breeder 
                WHERE id = %s AND active = 1
            """, (breeder_id,))
            
            breeder = cursor.fetchone()
            if not breeder:
                return jsonify({"error": "Breeder not found"}), 404

            # Convert column names to dictionary
            columns = [desc[0] for desc in cursor.description]
            breeder_dict = dict(zip(columns, breeder))
            
            # Convert profile_image bytes to base64 if exists
            if breeder_dict['profile_image']:
                breeder_dict['profile_image'] = base64.b64encode(breeder_dict['profile_image']).decode()

            return jsonify(breeder_dict)

        finally:
            cursor.close()
            conn.close()

    except Exception as e:
        logger.error(f"Error fetching breeder: {e}")
        return jsonify({"error": str(e)}), 500

@breeder_bp.route('/breeders', methods=['POST'])
def create_breeder():
    """Create a new breeder profile"""
    try:
        data = request.get_json()
        conn = Config.get_db_connection()
        cursor = conn.cursor()

        try:
            # Convert profile image if provided
            profile_image = None
            if 'profile_image' in data:
                profile_image = base64.b64decode(data['profile_image'])

            cursor.execute("""
                INSERT INTO breeder (
                    firstName, lastName, city, state,
                    experienceYears, story, phone, email,
                    profile_image, active
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, 1)
            """, (
                data.get('firstName'),
                data.get('lastName'),
                data.get('city'),
                data.get('state'),
                data.get('experienceYears'),
                data.get('story'),
                data.get('phone'),
                data.get('email').lower() if data.get('email') else None,
                profile_image
            ))
            
            conn.commit()
            return jsonify({
                "status": "success",
                "message": "Breeder profile created successfully"
            })

        finally:
            cursor.close()
            conn.close()

    except Exception as e:
        logger.error(f"Error creating breeder profile: {e}")
        return jsonify({
            "status": "error",
            "message": "Failed to create breeder profile"
        }), 500

@breeder_bp.route('/breeders', methods=['PATCH'])
def update_breeder():
    """Update an existing breeder profile"""
    try:
        data = request.get_json()
        conn = Config.get_db_connection()
        cursor = conn.cursor()

        try:
            # Build dynamic update query based on provided fields
            update_fields = []
            params = []
            
            field_mapping = {
                'firstName': 'firstName',
                'lastName': 'lastName',
                'city': 'city',
                'state': 'state',
                'experienceYears': 'experienceYears',
                'story': 'story',
                'phone': 'phone',
                'email': 'email',
                'profile_image': 'profile_image'
            }

            for key, db_field in field_mapping.items():
                if key in data:
                    value = data[key]
                    if key == 'email' and value:
                        value = value.lower()
                    elif key == 'profile_image' and value:
                        value = base64.b64decode(value)
                    update_fields.append(f"{db_field} = %s")
                    params.append(value)

            if not update_fields:
                return jsonify({
                    "status": "error",
                    "message": "No fields to update"
                }), 400

            # Add WHERE clause parameter
            params.append(1)  # breeder_id = 1
            
            query = f"""
                UPDATE breeder 
                SET {', '.join(update_fields)}
                WHERE id = %s
            """
            
            cursor.execute(query, params)
            conn.commit()

            return jsonify({
                "status": "success",
                "message": "Breeder profile updated successfully"
            })

        finally:
            cursor.close()
            conn.close()

    except Exception as e:
        logger.error(f"Error updating breeder profile: {e}")
        return jsonify({
            "status": "error",
            "message": "Failed to update breeder profile"
        }), 500
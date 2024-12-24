from flask import Blueprint, jsonify, request, current_app
import bcrypt
from ..db import mysql

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({
            "status": "error",
            "message": "Email and password are required"
        }), 400

    try:
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT * FROM breeders WHERE email = %s", (email,))
        user = cursor.fetchone()  # Will return a dict due to DictCursor

        if user:
            if bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
                # Update is_active status
                cursor.execute(
                    "UPDATE breeders SET is_active = TRUE WHERE id = %s",
                    (user['id'],)
                )
                mysql.connection.commit()  # Important: Commit the changes
                cursor.close()
                
                return jsonify({
                    "status": "success",
                    "message": "Login successful",
                    "data": {
                        "email": user['email'],
                        "id": user['id']
                    }
                })
        
        cursor.close()
        return jsonify({
            "status": "error",
            "message": "Invalid email or password"
        }), 401

    except Exception as e:
        current_app.logger.error(f"Login error: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "An error occurred during login"
        }), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    try:
        data = request.get_json()
        breeder_id = data.get('breederId')
        
        if not breeder_id:
            return jsonify({
                "status": "error",
                "message": "Breeder ID is required"
            }), 400

        cursor = mysql.connection.cursor()
        cursor.execute(
            "UPDATE breeders SET is_active = FALSE WHERE id = %s",
            (breeder_id,)
        )
        mysql.connection.commit()
        cursor.close()

        return jsonify({
            "status": "success",
            "message": "Logged out successfully"
        })

    except Exception as e:
        current_app.logger.error(f"Logout error: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "An error occurred during logout"
        }), 500
from flask import Blueprint, jsonify
from mysql.connector import Error
from .database import get_db_connection

bp = Blueprint('main', __name__)

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
                   experienceYears, story, phone, email 
            FROM breeder 
            LIMIT 1
        """)
        
        breeder = cursor.fetchone()
        
        if breeder:
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

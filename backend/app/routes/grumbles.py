from flask import Blueprint, request, jsonify, session
from ..database import get_db_connection
from functools import wraps
import mysql.connector
from mysql.connector import Error

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({"error": "Authentication required"}), 401
        return f(*args, **kwargs)
    return decorated_function

grumbles = Blueprint('grumbles', __name__)

VALID_COLORS = ['black', 'fawn', 'apricot']

@grumbles.route('/grumbles', methods=['GET'])
def get_all_grumbles():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute('SELECT * FROM grumble')
        grumbles = cursor.fetchall()
        return jsonify(grumbles)
    except Error as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()

@grumbles.route('/grumbles/<int:id>', methods=['GET'])
def get_grumble(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute('SELECT * FROM grumble WHERE id = %s', (id,))
        grumble = cursor.fetchone()
        if not grumble:
            return jsonify({"error": "Grumble not found"}), 404
        return jsonify(grumble)
    except Error as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()

@grumbles.route('/grumbles', methods=['POST'])
@login_required
def create_grumble():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400

    required_fields = ['name', 'gender', 'color']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    if data.get('color') not in VALID_COLORS:
        return jsonify({"error": "Invalid color"}), 400

    if data.get('gender') not in ['male', 'female']:
        return jsonify({"error": "Invalid gender"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO grumble (breeder_id, name, gender, color) VALUES (%s, %s, %s, %s)',
            (session['user_id'], data['name'], data['gender'], data['color'])
        )
        conn.commit()
        new_id = cursor.lastrowid
        return jsonify({'id': new_id, 'message': 'Grumble created successfully'}), 201
    except Error as e:
        conn.rollback()
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()

@grumbles.route('/grumbles/<int:id>', methods=['PUT'])
@login_required
def update_grumble(id):
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Check if grumble exists and belongs to user
        cursor.execute('SELECT breeder_id FROM grumble WHERE id = %s', (id,))
        grumble = cursor.fetchone()
        if not grumble:
            return jsonify({"error": "Grumble not found"}), 404
        if grumble['breeder_id'] != session['user_id']:
            return jsonify({"error": "Not authorized to modify this grumble"}), 403

        if 'color' in data and data['color'] not in VALID_COLORS:
            return jsonify({"error": "Invalid color"}), 400

        if 'gender' in data and data['gender'] not in ['male', 'female']:
            return jsonify({"error": "Invalid gender"}), 400

        update_fields = []
        update_values = []
        for field in ['name', 'gender', 'color']:
            if field in data:
                update_fields.append(f"{field} = %s")
                update_values.append(data[field])
        
        if not update_fields:
            return jsonify({"error": "No valid fields to update"}), 400

        update_values.append(id)
        query = f"UPDATE grumble SET {', '.join(update_fields)} WHERE id = %s"
        cursor.execute(query, update_values)
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"error": "No changes made"}), 400

        return jsonify({'message': 'Grumble updated successfully'})
    except Error as e:
        conn.rollback()
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()

@grumbles.route('/grumbles/<int:id>', methods=['DELETE'])
@login_required
def delete_grumble(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Check if grumble exists and belongs to user
        cursor.execute('SELECT breeder_id FROM grumble WHERE id = %s', (id,))
        grumble = cursor.fetchone()
        if not grumble:
            return jsonify({"error": "Grumble not found"}), 404
        if grumble['breeder_id'] != session['user_id']:
            return jsonify({"error": "Not authorized to delete this grumble"}), 403

        # Check if grumble is used in any litters
        cursor.execute('SELECT id FROM litter WHERE mom_id = %s OR dad_id = %s', (id, id))
        if cursor.fetchone():
            return jsonify({"error": "Cannot delete grumble that is used in litters"}), 400

        cursor.execute('DELETE FROM grumble WHERE id = %s', (id,))
        conn.commit()
        
        if cursor.rowcount == 0:
            return jsonify({"error": "Grumble not found"}), 404
            
        return jsonify({'message': 'Grumble deleted successfully'})
    except Error as e:
        conn.rollback()
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()

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

puppies = Blueprint('puppies', __name__)

VALID_COLORS = ['black', 'fawn', 'apricot']

@puppies.route('/puppies', methods=['GET'])
def get_all_puppies():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute('SELECT * FROM puppy')
        puppies = cursor.fetchall()
        return jsonify(puppies)
    except Error as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()

@puppies.route('/puppies/<int:id>', methods=['GET'])
def get_puppy(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute('SELECT * FROM puppy WHERE id = %s', (id,))
        puppy = cursor.fetchone()
        if not puppy:
            return jsonify({"error": "Puppy not found"}), 404
        return jsonify(puppy)
    except Error as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals(): conn.close()

@puppies.route('/puppies', methods=['POST'])
@login_required
def create_puppy():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400

    required_fields = ['litter_id', 'name', 'gender', 'color', 'status']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    if data.get('color') not in VALID_COLORS:
        return jsonify({"error": "Invalid color"}), 400

    if data.get('gender') not in ['male', 'female']:
        return jsonify({"error": "Invalid gender"}), 400

    if data.get('status') not in ['available', 'reserved']:
        return jsonify({"error": "Invalid status"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Verify litter exists and belongs to user
        cursor.execute('SELECT breeder_id FROM litter WHERE id = %s', (data['litter_id'],))
        litter = cursor.fetchone()
        if not litter:
            return jsonify({"error": "Litter not found"}), 404
        if litter['breeder_id'] != session['user_id']:
            return jsonify({"error": "Not authorized to add puppies to this litter"}), 403

        cursor.execute(
            'INSERT INTO puppy (litter_id, breeder_id, name, gender, color, status) VALUES (%s, %s, %s, %s, %s, %s)',
            (data['litter_id'], session['user_id'], data['name'], data['gender'], data['color'], data['status'])
        )
        conn.commit()
        return jsonify({'id': cursor.lastrowid, 'message': 'Puppy created successfully'}), 201
    except Error as e:
        conn.rollback()
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    finally:
        if 'cursor' in locals': cursor.close()
        if 'conn' in locals': conn.close()

@puppies.route('/puppies/<int:id>', methods=['PUT'])
@login_required
def update_puppy(id):
    data = request.json
    if data.get('color') not in VALID_COLORS:
        return jsonify({"error": "Invalid color"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'UPDATE puppy SET litter_id = %s, breeder_id = %s, name = %s, gender = %s, color = %s, status = %s WHERE id = %s',
        (data['litter_id'], data['breeder_id'], data['name'], data['gender'], data['color'], data['status'], id)
    )
    conn.commit()
    cursor.close()
    return jsonify({'message': 'Puppy updated'})

@puppies.route('/puppies/<int:id>', methods=['DELETE'])
@login_required
def delete_puppy(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM puppy WHERE id = %s', (id,))
    conn.commit()
    cursor.close()
    return jsonify({'message': 'Puppy deleted'})

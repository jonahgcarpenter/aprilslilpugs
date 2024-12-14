from flask import Blueprint, request, jsonify, session
from ..database import get_db_connection
from functools import wraps
from datetime import datetime

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({"error": "Authentication required"}), 401
        return f(*args, **kwargs)
    return decorated_function

litters = Blueprint('litters', __name__)

@litters.route('/litters', methods=['GET'])
def get_all_litters():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute('SELECT * FROM litter')
    litters = cursor.fetchall()
    cursor.close()
    return jsonify(litters)

@litters.route('/litters/<int:id>', methods=['GET'])
def get_litter(id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute('SELECT * FROM litter WHERE id = %s', (id,))
    litter = cursor.fetchone()
    cursor.close()
    return jsonify(litter) if litter else ('Litter not found', 404)

@litters.route('/litters', methods=['POST'])
@login_required
def create_litter():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO litter (breeder_id, mom_id, dad_id, birth_date) VALUES (%s, %s, %s, %s)',
        (data['breeder_id'], data['mom_id'], data['dad_id'], data['birth_date'])
    )
    conn.commit()
    cursor.close()
    return jsonify({'id': cursor.lastrowid}), 201

@litters.route('/litters/<int:id>', methods=['PUT'])
@login_required
def update_litter(id):
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'UPDATE litter SET breeder_id = %s, mom_id = %s, dad_id = %s, birth_date = %s WHERE id = %s',
        (data['breeder_id'], data['mom_id'], data['dad_id'], data['birth_date'], id)
    )
    conn.commit()
    cursor.close()
    return jsonify({'message': 'Litter updated'})

@litters.route('/litters/<int:id>', methods=['DELETE'])
@login_required
def delete_litter(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM litter WHERE id = %s', (id,))
    conn.commit()
    cursor.close()
    return jsonify({'message': 'Litter deleted'})

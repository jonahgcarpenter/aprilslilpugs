from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Error handlers
@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Route not found"}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Internal server error"}), 500

# Health check route
@app.route('/')
def health_check():
    return jsonify({"status": "Server is running"})

def get_db_connection():
    try:
        return mysql.connector.connect(
            host=os.getenv('MYSQL_HOST'),
            port=int(os.getenv('MYSQL_PORT')),
            user=os.getenv('MYSQL_USER'),
            password=os.getenv('MYSQL_PASSWORD'),
            database=os.getenv('MYSQL_DATABASE')
        )
    except Error as e:
        print(f"Database connection failed: {e}")
        raise e

@app.route('/api/breeder', methods=['GET'])
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
        print(f"Database error: {str(e)}")  # Enhanced error logging
        return jsonify({"error": f"Database error: {str(e)}"}), 500  # Return actual error message
    
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

@app.route('/api/test', methods=['GET'])
def test_route():
    return jsonify({"message": "Backend is working!"})

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

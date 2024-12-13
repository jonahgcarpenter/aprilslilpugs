from flask import Blueprint, jsonify, request, send_file, make_response
from mysql.connector import Error
from .database import get_db_connection
import base64
import io

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
                   experienceYears, story, phone, email,
                   profile_image
            FROM breeder 
            LIMIT 1
        """)
        
        breeder = cursor.fetchone()
        
        if breeder:
            if (breeder['profile_image']):
                image_base64 = base64.b64encode(breeder['profile_image']).decode('utf-8')
                breeder['profile_image'] = f"data:image/jpeg;base64,{image_base64}"
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

@bp.route('/api/breeder/image', methods=['POST', 'OPTIONS'])
def upload_profile_image():
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

    try:
        if 'image' not in request.files:
            response = jsonify({"error": "No image file provided"})
        else:
            image = request.files['image']
            if image.filename == '':
                response = jsonify({"error": "No image selected"})
            else:
                image_binary = image.read()
                conn = get_db_connection()
                cursor = conn.cursor()
                
                cursor.execute("""
                    UPDATE breeder 
                    SET profile_image = %s 
                    WHERE id = 1
                """, (image_binary,))
                
                conn.commit()
                response = jsonify({"message": "Image uploaded successfully"})
                
                if 'cursor' in locals():
                    cursor.close()
                if 'conn' in locals():
                    conn.close()

        # Add CORS headers to all responses
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

    except Exception as e:
        print(f"Upload error: {str(e)}")
        response = jsonify({"error": str(e)})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 500

@bp.route('/api/breeder/update', methods=['POST', 'OPTIONS'])
def update_breeder_info():
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

    try:
        data = request.json
        print("Received update data:", data)  # Debug log
        
        if not data:
            response = jsonify({"error": "No data provided"})
            response.status_code = 400
        else:
            required_fields = ['firstName', 'lastName', 'city', 'state', 
                             'experienceYears', 'story', 'phone', 'email']
            
            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                response = jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"})
                response.status_code = 400
            else:
                conn = get_db_connection()
                cursor = conn.cursor()
                
                update_query = """
                    UPDATE breeder 
                    SET firstName = %s, 
                        lastName = %s,
                        city = %s,
                        state = %s,
                        experienceYears = %s,
                        story = %s,
                        phone = %s,
                        email = %s
                    WHERE id = 1
                """
                
                cursor.execute(update_query, (
                    data['firstName'],
                    data['lastName'],
                    data['city'],
                    data['state'],
                    int(data['experienceYears']),
                    data['story'],
                    data['phone'],
                    data['email']
                ))
                
                conn.commit()
                
                if cursor.rowcount == 0:
                    response = jsonify({"message": "No changes were made"})
                else:
                    response = jsonify({"message": "Breeder information updated successfully"})
                
                cursor.close()
                conn.close()

        # Add CORS headers to all responses
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

    except Exception as e:
        print(f"Update error: {str(e)}")
        response = jsonify({"error": str(e)})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        response.status_code = 500
        return response

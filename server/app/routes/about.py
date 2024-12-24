from flask import Blueprint, jsonify, current_app
from ..db import mysql

about_bp = Blueprint('about', __name__)

@about_bp.route('/', methods=['GET'])
def about():
    try:
        cursor = mysql.connection.cursor()
        
        # Get breeder ID
        cursor.execute("SELECT id FROM breeders LIMIT 1")
        breeder_result = cursor.fetchone()
        
        if not breeder_result:
            return jsonify({
                "status": "error",
                "message": "No breeder found"
            }), 404
            
        breeder_id = breeder_result[0]
        
        # Fetch all requirements and group by type
        cursor.execute("""
            SELECT type, description 
            FROM breeder_requirements 
            WHERE breeder_id = %s 
            ORDER BY type, id
        """, (breeder_id,))
        
        results = cursor.fetchall()
        cursor.close()

        # Group results by type
        about_data = {
            "breeding_standards": [],
            "services_provided": [],
            "what_we_require": []
        }

        for row in results:
            if row[0] == 'breeding_standard':
                about_data["breeding_standards"].append(row[1])
            elif row[0] == 'service':
                about_data["services_provided"].append(row[1])
            elif row[0] == 'requirement':
                about_data["what_we_require"].append(row[1])

        return jsonify({
            "status": "success",
            "data": about_data
        })

    except Exception as e:
        current_app.logger.error(f"Error: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "Failed to fetch about data"
        }), 500
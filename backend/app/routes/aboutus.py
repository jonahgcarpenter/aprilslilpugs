from flask import Blueprint, jsonify, request
from app.database import get_db_connection

aboutus_bp = Blueprint('aboutus', __name__)

@aboutus_bp.route('/api/aboutus', methods=['GET'])
def get_aboutus_info():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Always use breeder_id = 1
        breeder_id = 1
        
        # Get breeding standards
        cursor.execute("""
            SELECT item 
            FROM about_us_items 
            WHERE section = 'breeding_standards' 
            AND breeder_id = %s 
            ORDER BY display_order, id
        """, (breeder_id,))
        breeding_standards = [row['item'] for row in cursor.fetchall()]
        
        # Get services provided
        cursor.execute("""
            SELECT item 
            FROM about_us_items 
            WHERE section = 'services_provided' 
            AND breeder_id = %s 
            ORDER BY display_order, id
        """, (breeder_id,))
        services_provided = [row['item'] for row in cursor.fetchall()]
        
        # Get what we require
        cursor.execute("""
            SELECT item 
            FROM about_us_items 
            WHERE section = 'what_we_require' 
            AND breeder_id = %s 
            ORDER BY display_order, id
        """, (breeder_id,))
        what_we_require = [row['item'] for row in cursor.fetchall()]
        
        return jsonify({
            'breeding_standards': breeding_standards,
            'services_provided': services_provided,
            'what_we_require': what_we_require
        })

    except Exception as e:
        print(f"Database error: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

@aboutus_bp.route('/api/aboutus', methods=['POST'])
def update_aboutus_info():
    try:
        data = request.json
        conn = get_db_connection()
        cursor = conn.cursor()

        # Always use breeder_id = 1
        breeder_id = 1

        # Clear existing items for this breeder
        cursor.execute("DELETE FROM about_us_items WHERE breeder_id = %s", (breeder_id,))

        # Insert new breeding standards
        for i, item in enumerate(data.get('breeding_standards', [])):
            cursor.execute("""
                INSERT INTO about_us_items (breeder_id, section, item, display_order)
                VALUES (%s, 'breeding_standards', %s, %s)
            """, (breeder_id, item, i))

        # Insert new services provided
        for i, item in enumerate(data.get('services_provided', [])):
            cursor.execute("""
                INSERT INTO about_us_items (breeder_id, section, item, display_order)
                VALUES (%s, 'services_provided', %s, %s)
            """, (breeder_id, item, i))

        # Insert what we require
        for i, item in enumerate(data.get('what_we_require', [])):
            cursor.execute("""
                INSERT INTO about_us_items (breeder_id, section, item, display_order)
                VALUES (%s, 'what_we_require', %s, %s)
            """, (breeder_id, item, i))

        conn.commit()
        return jsonify({"message": "About us information updated successfully"})

    except Exception as e:
        print(f"Database error: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

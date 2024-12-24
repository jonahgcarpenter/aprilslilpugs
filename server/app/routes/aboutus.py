"""
About Us content management routes.

Endpoints:
    GET   /api/aboutus/ : Retrieve all about us sections (breeding standards, services, requirements)
    PATCH /api/aboutus/ : Update all about us sections
"""
from flask import Blueprint, jsonify, request
from typing import Dict, List
import logging
from ..config import Config

logger = logging.getLogger(__name__)
aboutus_bp = Blueprint('aboutus', __name__)

@aboutus_bp.route('/', methods=['GET'])
def get_aboutus_info():
    """Retrieve about us sections using a single efficient query"""
    try:
        conn = Config.get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Use a single query to get all sections, properly ordered
        cursor.execute("""
            SELECT section, item 
            FROM about_us_items 
            WHERE breeder_id = 1
            ORDER BY section, display_order, created_at
        """)
        
        # Initialize the response structure
        result = {
            'breeding_standards': [],
            'services_provided': [],
            'what_we_require': []
        }
        
        # Organize items by section
        for row in cursor.fetchall():
            if row['section'] in result:
                result[row['section']].append(row['item'])

        return jsonify({
            "status": "success",
            "data": result
        })

    except Exception as e:
        logger.error(f"Database error: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
    
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

@aboutus_bp.route('/', methods=['PATCH'])
def update_aboutus_info():
    """Update about us sections maintaining proper order and timestamps"""
    try:
        data = request.get_json()
        conn = Config.get_db_connection()
        cursor = conn.cursor()

        # Start transaction
        conn.begin()
        
        try:
            # Clear existing items for breeder_id 1
            cursor.execute("DELETE FROM about_us_items WHERE breeder_id = 1")
            
            # Insert new items with proper section names and order
            for section in ['breeding_standards', 'services_provided', 'what_we_require']:
                items = data.get(section, [])
                if items:  # Only update sections that are provided in the PATCH request
                    for order, item in enumerate(items):
                        cursor.execute("""
                            INSERT INTO about_us_items 
                            (breeder_id, section, item, display_order) 
                            VALUES (%s, %s, %s, %s)
                        """, (1, section, item, order))
            
            # Commit transaction
            conn.commit()
            
            return jsonify({
                "status": "success",
                "message": "About us information updated successfully"
            })
            
        except Exception as e:
            conn.rollback()
            raise e

    except Exception as e:
        logger.error(f"Database error: {str(e)}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
    
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

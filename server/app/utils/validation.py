"""Validation utilities for request data"""
from typing import Dict, Any, List, Optional
import re
import logging

logger = logging.getLogger(__name__)

try:
    from PIL import Image
    from io import BytesIO
    HAS_PIL = True
except ImportError:
    logger.warning("PIL not installed. Image validation will be limited.")
    HAS_PIL = False

class ValidationError(Exception):
    def __init__(self, message: str, field: Optional[str] = None):
        self.message = message
        self.field = field

def validate_email(email: str) -> bool:
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def validate_phone(phone: str) -> bool:
    pattern = r'^\+?1?\d{9,15}$'
    return bool(re.match(pattern, phone))

def validate_password(password: str) -> Dict[str, Any]:
    errors = []
    if len(password) < 8:
        errors.append("Password must be at least 8 characters")
    if not re.search(r'[A-Z]', password):
        errors.append("Password must contain an uppercase letter")
    if not re.search(r'[a-z]', password):
        errors.append("Password must contain a lowercase letter")
    if not re.search(r'\d', password):
        errors.append("Password must contain a number")
    return {"valid": len(errors) == 0, "errors": errors}

def validate_image(image_data: bytes) -> Dict[str, Any]:
    if not HAS_PIL:
        return {
            "valid": True,  # Fallback to accepting images without validation
            "format": "unknown",
            "dimensions": (0, 0),
            "errors": ["Image validation unavailable - PIL not installed"]
        }
        
    try:
        image = Image.open(BytesIO(image_data))
        width, height = image.size
        format = image.format.lower()
        
        return {
            "valid": True,
            "format": format,
            "dimensions": (width, height),
            "errors": []
        }
    except Exception as e:
        return {
            "valid": False,
            "errors": [str(e)]
        }

def validate_breeder_data(data: Dict[str, Any]) -> List[str]:
    errors = []
    
    if not data.get('email') or not validate_email(data['email']):
        errors.append("Invalid email address")
    
    if data.get('phone') and not validate_phone(data['phone']):
        errors.append("Invalid phone number")
        
    if not data.get('firstName') or len(data['firstName']) < 2:
        errors.append("First name is required (minimum 2 characters)")
        
    if not data.get('lastName') or len(data['lastName']) < 2:
        errors.append("Last name is required (minimum 2 characters)")
        
    return errors

"""
Routes package initialization.
Contains all API route blueprints:
- auth: Authentication and session management
- breeder: Breeder profile operations
- aboutus: About Us content management
"""
from .auth import auth_bp
from .breeder import breeder_bp
from .aboutus import aboutus_bp

__all__ = ['auth_bp', 'breeder_bp', 'aboutus_bp']

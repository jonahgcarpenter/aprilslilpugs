from flask import Blueprint
from .main import main_bp
from .auth import auth_bp
from .breeder import breeder_bp
from .aboutus import aboutus_bp

bp = Blueprint('main', __name__)

__all__ = ['main_bp', 'auth_bp', 'breeder_bp', "aboutus_bp"]

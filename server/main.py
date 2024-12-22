"""
Main entry point for the Pug Breeder application server.
Initializes and runs the Flask application with configured settings.
"""
from app import create_app
from app.config import Config

app = create_app()

if __name__ == "__main__":
    app.run(
        host='localhost',  # Restrict to local access for security
        port=Config.PORT,
        debug=Config.DEBUG  # Controlled via environment variables
    )
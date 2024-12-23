"""Server entry point"""
import os
from dotenv import load_dotenv
from app import create_app

def load_environment():
    """Load environment variables from .env.development"""
    load_dotenv('.env.development')
    return "development"

# Create the Flask application instance
env = load_environment()
app = create_app(env)

if __name__ == "__main__":
    app.run(
        host='0.0.0.0',
        port=int(os.getenv('WAITRESS_PORT', '5000')),
        debug=True,
        use_reloader=True
    )

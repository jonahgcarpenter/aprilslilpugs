"""Server entry point"""
import os
import sys
from dotenv import load_dotenv
from server_config import run_server

if __name__ == "__main__":
    # Default to development if not specified
    env = os.getenv("FLASK_ENV", "development")
    env_file = f".env.{env}"
    
    if not os.path.exists(env_file):
        print(f"Error: Environment file {env_file} not found")
        sys.exit(1)
        
    load_dotenv(env_file)
    os.environ['FLASK_ENV'] = env  # Ensure FLASK_ENV is set
    
    try:
        run_server(environment=env)
    except Exception as e:
        print(f"Critical error starting server: {e}")
        sys.exit(1)

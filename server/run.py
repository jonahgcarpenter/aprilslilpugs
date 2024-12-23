"""Server entry point"""
import os
import sys
from dotenv import load_dotenv

def load_environment():
    """Load environment variables from .env.development"""
    env_file = ".env.development"
    
    if not os.path.exists(env_file):
        print(f"Error: Environment file {env_file} not found")
        sys.exit(1)
        
    load_dotenv(env_file)
    
    # Ensure API prefix is set
    if not os.getenv('API_PREFIX'):
        os.environ['API_PREFIX'] = '/api'
        
    return "development"

if __name__ == "__main__":
    env = load_environment()
    
    from server_config import run_server
    try:
        # Only pass the environment parameter
        run_server(environment=env)
    except Exception as e:
        print(f"Critical error starting server: {e}")
        sys.exit(1)

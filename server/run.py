from app import create_app
import os
import sys

app = create_app()

if __name__ == "__main__":
    app_mode = os.environ.get('APP_MODE', 'production').lower()
    host = os.environ.get('FLASK_HOST', 'localhost')
    port = int(os.environ.get('FLASK_PORT', 9600))
    
    try:
        # Only enable debug mode in development
        debug_mode = False
        if app_mode == 'development':
            try:
                import ctypes
                debug_mode = True
            except ImportError:
                print("Warning: Debug mode not available due to missing dependencies")
                debug_mode = False
        
        app.run(host=host, port=port, debug=debug_mode)
    except Exception as e:
        print(f"Error starting server: {e}")
        sys.exit(1)

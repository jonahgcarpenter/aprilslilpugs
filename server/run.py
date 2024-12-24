from app import create_app
import os

app = create_app()

if __name__ == "__main__":
    app_mode = os.environ.get('APP_MODE', 'production').lower()
    app.run(host='localhost', port=5000, debug=(app_mode == 'development'))

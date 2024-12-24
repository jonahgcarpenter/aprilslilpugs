from app import create_app
import os

app = create_app()

if __name__ == "__main__":
    app_mode = os.environ.get('APP_MODE', 'production').lower()
    host = os.environ.get('FLASK_HOST', 'localhost')
    port = int(os.environ.get('FLASK_PORT', 5000))
    app.run(host=host, port=port, debug=(app_mode == 'development'))

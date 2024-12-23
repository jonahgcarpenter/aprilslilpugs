"""Server configuration and startup utilities"""
import os
from app import create_app

def run_server(environment='development'):
    """Run server using appropriate server based on environment"""
    app = create_app(environment)
    
    if environment == 'development':
        app.run(
            host='0.0.0.0',
            port=int(os.getenv('WAITRESS_PORT', '5000')),
            debug=True,
            use_reloader=True,
            extra_files=['.env.development']
        )
    else:
        from waitress import serve
        from .config import Config
        serve(app, **Config.get_server_config())

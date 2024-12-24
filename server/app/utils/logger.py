import logging
import sys

def setup_logger(app):
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(logging.Formatter(
        '%(asctime)s - %(levelname)s - %(message)s'
    ))
    console_handler.setLevel(logging.DEBUG)

    app.logger.addHandler(console_handler)
    app.logger.setLevel(logging.DEBUG)
    
    app.logger.info('Logger initialized')

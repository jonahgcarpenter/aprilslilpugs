import pymysql
from pymysql.cursors import DictCursor
from flask import current_app, g

class MySQL:
    def __init__(self):
        self.app = None

    def init_app(self, app):
        self.app = app

    def get_connection(self):
        if not hasattr(g, '_database'):
            g._database = pymysql.connect(
                host=self.app.config['MYSQL_HOST'],
                user=self.app.config['MYSQL_USER'],
                password=self.app.config['MYSQL_PASSWORD'],
                db=self.app.config['MYSQL_DB'],
                port=self.app.config['MYSQL_PORT'],
                cursorclass=DictCursor,
                autocommit=True
            )
        return g._database

    @property
    def connection(self):
        return self.get_connection()

mysql = MySQL()
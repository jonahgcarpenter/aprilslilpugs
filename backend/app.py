from flask import Flask
from flask_mysqldb import MySQL

app = Flask(__name__)

app.config['MYSQL_HOST'] = "db"
app.config['MYSQL_USER'] = "root"
app.config['MYSQL_PASSWORD'] = ""
app.config['MYSQL_DB'] = "mydatabase"

@app.route('/')
def index():
    return "Hello World"

if __name__ == '__main__':
    app.run(debug=True,)


# Plan to resolve import issues in VS Code:
# Verify VS Code is using correct Python interpreter
# Create VS Code workspace settings
# Reload VS Code window
from flask import Flask, send_from_directory, redirect
from flask_cors import CORS

app = Flask(__name__, static_url_path='')
CORS(app)

@app.route('/')
def index():
    return send_from_directory('.', 'register.html')

@app.route('/login')
def login():
    return send_from_directory('.', 'login.html')

@app.route('/register')
def register():
    return send_from_directory('.', 'register.html')

@app.route('/dashboard')
def dashboard():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_file(path):
    return send_from_directory('.', path)

if __name__ == '__main__':
    app.run(port=3000, debug=True) 
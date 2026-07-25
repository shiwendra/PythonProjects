from flask import Flask, jsonify, render_template, request
from datetime import datetime
import uuid

app = Flask(__name__)

passwords = []


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/passwords', methods=['GET'])
def get_passwords():
    return jsonify(passwords)


@app.route('/api/passwords', methods=['POST'])
def add_password():
    data = request.get_json(silent=True) or {}

    site = (data.get('site') or '').strip()
    username = (data.get('username') or '').strip()
    password = (data.get('password') or '').strip()

    if not site or not username or not password:
        return jsonify({'error': 'Site, username, and password are required'}), 400

    entry = {
        'id': str(uuid.uuid4()),
        'site': site,
        'username': username,
        'password': password,
        'created_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }

    passwords.append(entry)
    return jsonify(entry), 201


@app.route('/api/passwords/<password_id>', methods=['PUT'])
def update_password(password_id):
    data = request.get_json(silent=True) or {}

    site = (data.get('site') or '').strip()
    username = (data.get('username') or '').strip()
    password = (data.get('password') or '').strip()

    if not site or not username or not password:
        return jsonify({'error': 'Site, username, and password are required'}), 400

    for item in passwords:
        if item['id'] == password_id:
            item['site'] = site
            item['username'] = username
            item['password'] = password
            item['updated_at'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            return jsonify(item)

    return jsonify({'error': 'Password not found'}), 404


@app.route('/api/passwords/<password_id>', methods=['DELETE'])
def delete_password(password_id):
    global passwords
    password_list = [item for item in passwords if item['id'] != password_id]

    if len(password_list) == len(passwords):
        return jsonify({'error': 'Password not found'}), 404

    passwords = password_list
    return jsonify({'message': 'Password deleted successfully'})


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

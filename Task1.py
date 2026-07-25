from flask import Flask, request, jsonify
app=Flask(__name__)

@app.route('/')
def home():
    return "Welcome to the Flask APP!"  

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "Application is running"})
@app.route('/greet/<string:name>', methods=['GET', 'POST'])
def greet(name):
    return jsonify({"message": f"Hello, {name}!"})

if __name__ == '__main__':
    app.run(host='localhost', port=5000, debug=True)
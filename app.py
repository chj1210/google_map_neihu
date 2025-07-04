from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/api/v1/status')
def get_status():
    return jsonify({"status": "ok", "message": "Backend is running"})

if __name__ == '__main__':
    app.run(debug=True)
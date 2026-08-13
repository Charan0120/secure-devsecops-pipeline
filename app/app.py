from flask import Flask,request

app = Flask(__name__)

@app.route('/')
def home():
    return """
    <h1>Secure DevSecOps Pipeline version 2</h1>
    """
@app.route("/test")
def test_vulnerability():
    user_input = request.args.get("code")
    exec(user_input)
    return "Executed"

@app.route('/health')
def health():
    return {"status": "healthy"}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

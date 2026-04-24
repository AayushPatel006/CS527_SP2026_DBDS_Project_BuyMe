from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import text
from sqlalchemy.orm import Session

from db_setup import SessionLocal

app = Flask(__name__)

CORS(
    app,
    resources={r"/api/*": {"origins": "http://localhost:8080"}},
    supports_credentials=True,
    methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.route("/")
def helloworld():
    print("Hello, World!")  
    return "Hello, World!"

@app.route("/api/login", methods=["POST", "OPTIONS"])
def login():
    if request.method == "OPTIONS":
        return jsonify({"message": "ok"}), 200

    data = request.get_json(silent=True) or {}
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()
    #print(username)
    #print(password)
    db: Session = next(get_db())

    try:
        query = text("""
            SELECT id, username, email, role, is_active
            FROM users
            WHERE username = :username
              AND password_hash = :password
              AND deleted_at IS NULL
            LIMIT 1
        """)

        user = db.execute(
            query,
            {
                "username": username,
                "password": password,
            }
        ).mappings().first()

        if user is None:
            return jsonify({"detail": "Invalid username or password"}), 401

        if not user["is_active"]:
            return jsonify({"detail": "Account is inactive"}), 403

        return jsonify({
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "role": user["role"],
        }), 200

    finally:
        db.close()


if __name__ == "__main__":
    app.run(debug=True, port=5000)
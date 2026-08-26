from flask import jsonify, request

from services.auth_service import (
    authenticate_user, create_user, delete_user,
    get_all_users, get_user_by_id, update_user,
)
from utils.jwt_helper import create_token, token_required


def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user, error = authenticate_user(email, password)
    if error:
        return jsonify({"error": error}), 401

    token = create_token(user["id"], user["email"], user["role"])
    return jsonify({"token": token, "user": user}), 200


def register():
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    role = data.get("role", "staff")
    avatar_url = (data.get("avatar_url") or "").strip() or None

    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    if role not in ("admin", "manager", "staff"):
        role = "staff"

    user_id, error = create_user(name, email, password, role, avatar_url)
    if error:
        return jsonify({"error": error}), 409

    user = get_user_by_id(user_id)
    token = create_token(user["id"], user["email"], user["role"])
    return jsonify({"message": "Account created successfully", "token": token, "user": user}), 201


def profile():
    user = get_user_by_id(request.user["user_id"])
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user), 200


# ── Staff Management (admin + manager) ───────────────────────────────────────

def list_users():
    caller_role = request.user.get("role")
    users, error = get_all_users()
    if error:
        return jsonify({"error": error}), 400

    if caller_role == "manager":
        users = [u for u in users if u["role"] == "staff"]

    return jsonify({"users": users}), 200


def create_staff():
    caller_role = request.user.get("role")
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    role = data.get("role", "staff")
    avatar_url = (data.get("avatar_url") or "").strip() or None

    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    if role not in ("admin", "manager", "staff"):
        return jsonify({"error": "Invalid role"}), 400

    if caller_role == "manager" and role in ("admin", "manager"):
        return jsonify({"error": "Managers can only create staff accounts"}), 403

    user_id, error = create_user(name, email, password, role, avatar_url)
    if error:
        return jsonify({"error": error}), 409

    return jsonify({"message": "User created successfully", "user_id": user_id}), 201


def edit_user(user_id):
    caller_role = request.user.get("role")
    caller_id = request.user.get("user_id")

    target = get_user_by_id(user_id)
    if not target:
        return jsonify({"error": "User not found"}), 404

    if caller_role == "manager" and target["role"] in ("admin", "manager"):
        return jsonify({"error": "Insufficient permissions"}), 403

    data = request.get_json() or {}
    name = (data.get("name") or "").strip() or target["name"]
    email = (data.get("email") or "").strip().lower() or target["email"]
    role = data.get("role", target["role"])
    password = data.get("password") or None
    avatar_url = data.get("avatar_url") if "avatar_url" in data else target.get("avatar_url")

    if role not in ("admin", "manager", "staff"):
        return jsonify({"error": "Invalid role"}), 400

    if caller_role == "manager" and role in ("admin", "manager"):
        return jsonify({"error": "Managers cannot assign admin or manager roles"}), 403

    ok, error = update_user(user_id, name, email, role, password, avatar_url)
    if not ok:
        return jsonify({"error": error}), 400

    return jsonify({"message": "User updated"}), 200


def remove_user(user_id):
    caller_id = request.user.get("user_id")
    if caller_id == user_id:
        return jsonify({"error": "Cannot delete your own account"}), 400

    target = get_user_by_id(user_id)
    if not target:
        return jsonify({"error": "User not found"}), 404

    ok, error = delete_user(user_id)
    if not ok:
        return jsonify({"error": error}), 400

    return jsonify({"message": "User deleted"}), 200

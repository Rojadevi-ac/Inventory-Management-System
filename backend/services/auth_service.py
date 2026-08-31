from datetime import datetime, date
from config.db import get_connection
from models.user_model import hash_password, verify_password


def _format_user(u):
    if not u:
        return u
    for k, v in list(u.items()):
        if isinstance(v, (datetime, date)) or hasattr(v, "isoformat"):
            u[k] = v.isoformat()
        elif hasattr(v, "as_tuple"):
            u[k] = float(v)
    return u


def create_user(name, email, password, role="staff", avatar_url=None):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id FROM users WHERE email = %s OR name = %s", (email, name))
            if cursor.fetchone():
                return None, "Email or username already registered"

            hashed = hash_password(password)
            cursor.execute(
                "INSERT INTO users (name, email, password, role, avatar_url) VALUES (%s, %s, %s, %s, %s)",
                (name, email, hashed, role, avatar_url),
            )
            conn.commit()
            return cursor.lastrowid, None
    finally:
        conn.close()


def authenticate_user(email, password):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT id, name, email, password, role, avatar_url FROM users WHERE email = %s OR name = %s",
                (email, email),
            )
            user = cursor.fetchone()
            if not user or not verify_password(password, user["password"]):
                return None, "Invalid username/email or password"
            user.pop("password")
            return _format_user(user), None
    finally:
        conn.close()


def get_user_by_id(user_id):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT id, name, email, role, avatar_url, created_at FROM users WHERE id = %s",
                (user_id,),
            )
            return _format_user(cursor.fetchone())
    finally:
        conn.close()


def get_all_users():
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT id, name, email, role, avatar_url, created_at FROM users ORDER BY created_at DESC"
            )
            users = [_format_user(u) for u in cursor.fetchall()]
            return users, None
    except Exception as e:
        return [], str(e)
    finally:
        conn.close()


def update_user(user_id, name, email, role, password=None, avatar_url=None):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id FROM users WHERE (email = %s OR name = %s) AND id != %s", (email, name, user_id))
            if cursor.fetchone():
                return False, "Email or username already in use"

            if password:
                hashed = hash_password(password)
                cursor.execute(
                    "UPDATE users SET name=%s, email=%s, role=%s, avatar_url=%s, password=%s WHERE id=%s",
                    (name, email, role, avatar_url, hashed, user_id),
                )
            else:
                cursor.execute(
                    "UPDATE users SET name=%s, email=%s, role=%s, avatar_url=%s WHERE id=%s",
                    (name, email, role, avatar_url, user_id),
                )
            conn.commit()
            return True, None
    except Exception as e:
        conn.rollback()
        return False, str(e)
    finally:
        conn.close()


def delete_user(user_id):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id FROM users WHERE id = %s", (user_id,))
            if not cursor.fetchone():
                return False, "User not found"
            cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
            conn.commit()
            return True, None
    except Exception as e:
        conn.rollback()
        return False, str(e)
    finally:
        conn.close()

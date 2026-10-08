import os
import time
import threading
import urllib.parse
import pymysql
from pymysql.cursors import DictCursor
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost").strip()
DB_USER = os.getenv("DB_USER", "root").strip()
DB_PASS = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "ims_db").strip()
DB_PORT = int(os.getenv("DB_PORT", 3306))

# Parse DATABASE_URL / MYSQL_URL if provided
MYSQL_URL = os.getenv("MYSQL_URL") or os.getenv("DATABASE_URL") or ""
if MYSQL_URL and ("mysql" in MYSQL_URL or "://" in MYSQL_URL):
    try:
        parsed = urllib.parse.urlparse(MYSQL_URL)
        if parsed.hostname:
            DB_HOST = parsed.hostname
        if parsed.username:
            DB_USER = parsed.username
        if parsed.password:
            DB_PASS = parsed.password
        if parsed.path and parsed.path.strip("/"):
            DB_NAME = parsed.path.strip("/")
        if parsed.port:
            DB_PORT = int(parsed.port)
    except Exception as parse_err:
        print(f"[DB Config Warning] Failed to parse MYSQL_URL: {parse_err}")

# Clean DB_HOST if user pasted protocol prefix
if "://" in DB_HOST:
    DB_HOST = DB_HOST.split("://")[-1].split("/")[0].split(":")[0]

# DB Auto-Wake & Keep-Alive Settings
DB_KEEP_ALIVE_INTERVAL = int(os.getenv("DB_KEEP_ALIVE_INTERVAL", "600"))  # 10 minutes default


def get_connection(max_retries=5, retry_delay=3):
    """Establishes MySQL DB connection with automatic retry & backoff for serverless/cloud DBs."""
    last_exception = None

    for attempt in range(1, max_retries + 1):
        try:
            connect_kwargs = {
                "host": DB_HOST,
                "user": DB_USER,
                "password": DB_PASS,
                "database": DB_NAME,
                "port": DB_PORT,
                "cursorclass": DictCursor,
                "autocommit": False,
                "connect_timeout": 15,
                "read_timeout": 15,
                "write_timeout": 15,
                "init_command": "SET time_zone = '+00:00'",
            }

            # Enable SSL if DB_SSL=true or ssl mode is required
            if os.getenv("DB_SSL") == "true" or "aivencloud.com" in DB_HOST:
                connect_kwargs["ssl"] = {"ssl_mode": "REQUIRED"}

            conn = pymysql.connect(**connect_kwargs)
            return conn
        except Exception as e:
            last_exception = e
            print(f"[DB Connection] Attempt {attempt}/{max_retries} failed on '{DB_HOST}:{DB_PORT}' ({e}). Retrying...")

            if attempt < max_retries:
                time.sleep(retry_delay)

    raise last_exception


def ensure_db_indexes():
    """Optimizes DB query performance and ensures system_settings table and imsuser viewer account exist."""
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            # 1. Ensure system_settings table
            cursor.execute(
                """CREATE TABLE IF NOT EXISTS system_settings (
                    setting_key VARCHAR(50) PRIMARY KEY,
                    setting_value TEXT,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )"""
            )
            cursor.execute(
                "INSERT IGNORE INTO system_settings (setting_key, setting_value) VALUES ('timezone', 'Asia/Kolkata')"
            )

            # 2. Modify users role column to VARCHAR(20) to support viewer role
            try:
                cursor.execute("ALTER TABLE users MODIFY COLUMN role VARCHAR(20) NOT NULL DEFAULT 'staff'")
                conn.commit()
            except Exception:
                conn.rollback()

            # 3. Ensure read-only viewer user 'imsuser@ims.com' with password 'qwerty123'
            import bcrypt
            hashed_pw = bcrypt.hashpw("qwerty123".encode("utf-8"), bcrypt.gensalt(10)).decode("utf-8")
            cursor.execute("SELECT id FROM users WHERE email = %s OR name = %s", ("imsuser@ims.com", "imsuser"))
            existing = cursor.fetchone()
            if existing:
                cursor.execute(
                    "UPDATE users SET name=%s, email=%s, password=%s, role=%s WHERE id=%s",
                    ("imsuser", "imsuser@ims.com", hashed_pw, "viewer", existing["id"])
                )
            else:
                cursor.execute(
                    "INSERT INTO users (name, email, password, role, avatar_url) VALUES (%s, %s, %s, %s, %s)",
                    ("imsuser", "imsuser@ims.com", hashed_pw, "viewer", "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80")
                )

            conn.commit()

            # 4. Indexes
            index_statements = [
                "CREATE INDEX idx_users_email ON users(email)",
                "CREATE INDEX idx_products_status ON products(status)",
                "CREATE INDEX idx_products_category ON products(category_id)",
                "CREATE INDEX idx_inventory_product ON inventory(product_id)",
                "CREATE INDEX idx_inventory_qty ON inventory(quantity, reorder_level)",
                "CREATE INDEX idx_purchases_supplier ON purchases(supplier_id)",
                "CREATE INDEX idx_purchases_product ON purchases(product_id)",
                "CREATE INDEX idx_orders_product ON orders(product_id)",
                "CREATE INDEX idx_issues_supplier ON supplier_issues(supplier_id)",
                "CREATE INDEX idx_issues_purchase ON supplier_issues(purchase_id)",
                "CREATE INDEX idx_transactions_date ON transactions(transaction_date)",
            ]
            for stmt in index_statements:
                try:
                    cursor.execute(stmt)
                    conn.commit()
                except Exception:
                    conn.rollback()
    except Exception as e:
        print(f"Db optimization check: {e}")
    finally:
        conn.close()


# ---- Background Keep-Alive Heartbeat Ping Thread ---------------------------
_keep_alive_started = False


def _db_keep_alive_loop():
    """Periodic background heartbeat thread sending SELECT 1 to prevent cloud DB inactivity poweroff."""
    print(f"[DB Keep-Alive] Started background ping loop (Interval: {DB_KEEP_ALIVE_INTERVAL}s)")
    while True:
        try:
            time.sleep(DB_KEEP_ALIVE_INTERVAL)
            conn = get_connection(max_retries=3, retry_delay=2)
            try:
                with conn.cursor() as cursor:
                    cursor.execute("SELECT 1")
                conn.close()
                print("[DB Keep-Alive] Heartbeat ping successful.")
            except Exception as pe:
                conn.close()
                print(f"[DB Keep-Alive Warning] Heartbeat query failed: {pe}")
        except Exception as e:
            print(f"[DB Keep-Alive Error] Heartbeat ping error: {e}")


def start_db_keep_alive():
    """Starts the background keep-alive thread if not already running."""
    global _keep_alive_started
    if not _keep_alive_started:
        _keep_alive_started = True
        thread = threading.Thread(target=_db_keep_alive_loop, daemon=True)
        thread.start()


# Initialize db indexes and start keep-alive thread on boot
try:
    ensure_db_indexes()
    start_db_keep_alive()
except Exception as boot_err:
    print(f"[DB Initialization Warning] {boot_err}")

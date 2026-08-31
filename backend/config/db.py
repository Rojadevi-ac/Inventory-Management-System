import os
import pymysql
from pymysql.cursors import DictCursor
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASS = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "ims_db")
DB_PORT = int(os.getenv("DB_PORT", 3306))


def get_connection():
    return pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASS,
        database=DB_NAME,
        port=DB_PORT,
        cursorclass=DictCursor,
        autocommit=False,
        connect_timeout=3,
        read_timeout=5,
        write_timeout=5,
        init_command="SET time_zone = '+00:00'",
    )


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


# Run index and settings initialization check on module import
try:
    ensure_db_indexes()
except Exception:
    pass

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
    )


def ensure_db_indexes():
    """Optimizes DB query performance by creating essential database indexes if missing."""
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
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
                    # Index already exists or table not created yet
                    conn.rollback()
    except Exception as e:
        print(f"Index optimization check: {e}")
    finally:
        conn.close()


# Run index optimization check on module import
try:
    ensure_db_indexes()
except Exception:
    pass

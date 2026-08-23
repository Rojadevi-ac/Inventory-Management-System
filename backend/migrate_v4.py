"""
Migration v4: Create product_logs table for tracking staff activity history (Purchases, Orders, Updates, etc.)
Safe for existing data.
Run: python migrate_v4.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config.db import get_connection


def tbl_exists(cur, table):
    cur.execute(
        "SELECT COUNT(*) AS c FROM information_schema.TABLES "
        "WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=%s", (table,))
    return cur.fetchone()["c"] > 0


def run():
    conn = get_connection()
    ok, skip = 0, 0
    try:
        with conn.cursor() as c:
            if tbl_exists(c, "product_logs"):
                print("[SKIP] product_logs table already exists"); skip += 1
            else:
                c.execute("""
                    CREATE TABLE product_logs (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        product_id INT NOT NULL,
                        user_id INT DEFAULT NULL,
                        action_type ENUM('PURCHASE', 'ORDER', 'CREATE', 'UPDATE', 'ARCHIVE', 'RESTORE', 'REORDER_UPDATE') NOT NULL,
                        quantity INT DEFAULT NULL,
                        previous_stock INT DEFAULT NULL,
                        new_stock INT DEFAULT NULL,
                        details TEXT DEFAULT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
                        INDEX idx_product_logs_prod (product_id),
                        INDEX idx_product_logs_user (user_id),
                        INDEX idx_product_logs_action (action_type),
                        INDEX idx_product_logs_date (created_at)
                    )
                """)
                conn.commit()
                print("[OK]   Created product_logs table"); ok += 1

            # Populate initial logs from existing purchases and orders if table was just created
            c.execute("SELECT COUNT(*) AS c FROM product_logs")
            count = c.fetchone()["c"]
            if count == 0:
                # 1. Backfill from purchases
                c.execute("""
                    INSERT INTO product_logs (product_id, user_id, action_type, quantity, details, created_at)
                    SELECT pu.product_id, pu.created_by, 'PURCHASE', pu.quantity,
                           CONCAT('Purchased ', pu.quantity, ' units from ', COALESCE(s.name, 'Direct Supplier')),
                           pu.purchase_date
                    FROM purchases pu
                    LEFT JOIN suppliers s ON pu.supplier_id = s.id
                """)
                p_count = c.rowcount

                # 2. Backfill from orders
                c.execute("""
                    INSERT INTO product_logs (product_id, user_id, action_type, quantity, details, created_at)
                    SELECT o.product_id, o.created_by, 'ORDER', o.quantity,
                           CONCAT('Placed order for ', o.quantity, ' units'),
                           o.order_date
                    FROM orders o
                """)
                o_count = c.rowcount
                conn.commit()
                print(f"[OK]   Backfilled {p_count} purchase logs and {o_count} order logs into product_logs")
                ok += 1

    finally:
        conn.close()

    print(f"\nDone. {ok} applied, {skip} skipped.")


if __name__ == "__main__":
    print("Running IMS migration v4...\n")
    run()

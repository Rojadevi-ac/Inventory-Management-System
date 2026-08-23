"""
Migration script: applies all schema changes to the existing live ims_db
without dropping and recreating (safe for existing data).
Run once: python migrate.py
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config.db import get_connection


def column_exists(cursor, table, column):
    cursor.execute(
        """SELECT COUNT(*) AS cnt FROM information_schema.COLUMNS
           WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = %s AND COLUMN_NAME = %s""",
        (table, column),
    )
    return cursor.fetchone()["cnt"] > 0


def index_exists(cursor, table, index_name):
    cursor.execute(
        """SELECT COUNT(*) AS cnt FROM information_schema.STATISTICS
           WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = %s AND INDEX_NAME = %s""",
        (table, index_name),
    )
    return cursor.fetchone()["cnt"] > 0


def fk_exists(cursor, table, fk_name):
    cursor.execute(
        """SELECT COUNT(*) AS cnt FROM information_schema.TABLE_CONSTRAINTS
           WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = %s
           AND CONSTRAINT_NAME = %s AND CONSTRAINT_TYPE = 'FOREIGN KEY'""",
        (table, fk_name),
    )
    return cursor.fetchone()["cnt"] > 0


def run_migrations():
    conn = get_connection()
    applied = 0
    skipped = 0

    try:
        with conn.cursor() as cursor:

            # 1. Add 'manager' to users.role ENUM
            try:
                cursor.execute(
                    "ALTER TABLE users MODIFY COLUMN role ENUM('admin','manager','staff') NOT NULL DEFAULT 'staff'"
                )
                conn.commit()
                print("  [OK]   Migration 1: Added 'manager' role to users.role ENUM")
                applied += 1
            except Exception as e:
                if "1060" in str(e) or "duplicate" in str(e).lower():
                    print("  [SKIP] Migration 1: already applied")
                    skipped += 1
                else:
                    print(f"  [FAIL] Migration 1: {e}")

            # 2. Create suppliers table
            try:
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS suppliers (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(150) NOT NULL,
                        contact_person VARCHAR(100) DEFAULT NULL,
                        phone VARCHAR(30) DEFAULT NULL,
                        email VARCHAR(150) DEFAULT NULL,
                        address TEXT DEFAULT NULL,
                        started_at DATE NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                conn.commit()
                print("  [OK]   Migration 2: Created suppliers table")
                applied += 1
            except Exception as e:
                print(f"  [FAIL] Migration 2: {e}")

            # 3. Add supplier_id column to purchases
            if column_exists(cursor, "purchases", "supplier_id"):
                print("  [SKIP] Migration 3: purchases.supplier_id already exists")
                skipped += 1
            else:
                try:
                    cursor.execute(
                        "ALTER TABLE purchases ADD COLUMN supplier_id INT DEFAULT NULL"
                    )
                    conn.commit()
                    print("  [OK]   Migration 3: Added purchases.supplier_id column")
                    applied += 1
                except Exception as e:
                    print(f"  [FAIL] Migration 3: {e}")

            # 4. Add FK constraint on purchases.supplier_id
            if fk_exists(cursor, "purchases", "fk_purchases_supplier"):
                print("  [SKIP] Migration 4: FK fk_purchases_supplier already exists")
                skipped += 1
            else:
                try:
                    cursor.execute(
                        """ALTER TABLE purchases
                           ADD CONSTRAINT fk_purchases_supplier
                           FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL"""
                    )
                    conn.commit()
                    print("  [OK]   Migration 4: Added FK purchases.supplier_id -> suppliers.id")
                    applied += 1
                except Exception as e:
                    print(f"  [FAIL] Migration 4: {e}")

            # 5. Add index on suppliers.name
            if index_exists(cursor, "suppliers", "idx_suppliers_name"):
                print("  [SKIP] Migration 5: idx_suppliers_name already exists")
                skipped += 1
            else:
                try:
                    cursor.execute("CREATE INDEX idx_suppliers_name ON suppliers(name)")
                    conn.commit()
                    print("  [OK]   Migration 5: Created idx_suppliers_name index")
                    applied += 1
                except Exception as e:
                    print(f"  [FAIL] Migration 5: {e}")

    finally:
        conn.close()

    print(f"\nDone. {applied} applied, {skipped} skipped.")


if __name__ == "__main__":
    print("Running IMS database migrations...\n")
    run_migrations()

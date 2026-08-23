"""
Migration v3: Add image_url to products, avatar_url to users, logo_url to suppliers.
Safe for existing data.
Run: python migrate_v3.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config.db import get_connection


def col_exists(cur, table, col):
    cur.execute(
        "SELECT COUNT(*) AS c FROM information_schema.COLUMNS "
        "WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=%s AND COLUMN_NAME=%s",
        (table, col))
    return cur.fetchone()["c"] > 0


def run():
    conn = get_connection()
    ok, skip = 0, 0
    try:
        with conn.cursor() as c:
            # 1. products.image_url
            if col_exists(c, "products", "image_url"):
                print("[SKIP] 1: products.image_url exists"); skip += 1
            else:
                c.execute("ALTER TABLE products ADD COLUMN image_url TEXT DEFAULT NULL AFTER barcode")
                conn.commit()
                print("[OK]   1: Added products.image_url"); ok += 1

            # 2. users.avatar_url
            if col_exists(c, "users", "avatar_url"):
                print("[SKIP] 2: users.avatar_url exists"); skip += 1
            else:
                c.execute("ALTER TABLE users ADD COLUMN avatar_url TEXT DEFAULT NULL AFTER role")
                conn.commit()
                print("[OK]   2: Added users.avatar_url"); ok += 1

            # 3. suppliers.logo_url
            if col_exists(c, "suppliers", "logo_url"):
                print("[SKIP] 3: suppliers.logo_url exists"); skip += 1
            else:
                c.execute("ALTER TABLE suppliers ADD COLUMN logo_url TEXT DEFAULT NULL AFTER email")
                conn.commit()
                print("[OK]   3: Added suppliers.logo_url"); ok += 1

    finally:
        conn.close()

    print(f"\nDone. {ok} applied, {skip} skipped.")


if __name__ == "__main__":
    print("Running IMS migration v3...\n")
    run()

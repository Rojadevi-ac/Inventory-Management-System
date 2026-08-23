"""
Migration v2: Add categories table, product status/category_id, purchase search support.
Safe for existing data — no drops, no truncations.
Run once: python migrate_v2.py
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


def tbl_exists(cur, table):
    cur.execute(
        "SELECT COUNT(*) AS c FROM information_schema.TABLES "
        "WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=%s", (table,))
    return cur.fetchone()["c"] > 0


def fk_exists(cur, table, fk):
    cur.execute(
        "SELECT COUNT(*) AS c FROM information_schema.TABLE_CONSTRAINTS "
        "WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=%s AND CONSTRAINT_NAME=%s "
        "AND CONSTRAINT_TYPE='FOREIGN KEY'", (table, fk))
    return cur.fetchone()["c"] > 0


def idx_exists(cur, table, idx):
    cur.execute(
        "SELECT COUNT(*) AS c FROM information_schema.STATISTICS "
        "WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=%s AND INDEX_NAME=%s",
        (table, idx))
    return cur.fetchone()["c"] > 0


def run():
    conn = get_connection()
    ok, skip = 0, 0
    try:
        with conn.cursor() as c:

            # 1. Create categories table
            if tbl_exists(c, "categories"):
                print("[SKIP] 1: categories table exists"); skip += 1
            else:
                c.execute("""
                    CREATE TABLE categories (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(100) NOT NULL UNIQUE,
                        description TEXT DEFAULT NULL,
                        status ENUM('active','inactive') NOT NULL DEFAULT 'active',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    )
                """)
                conn.commit()
                print("[OK]   1: Created categories table"); ok += 1

            # 2. Add category_id to products
            if col_exists(c, "products", "category_id"):
                print("[SKIP] 2: products.category_id exists"); skip += 1
            else:
                c.execute("ALTER TABLE products ADD COLUMN category_id INT DEFAULT NULL")
                conn.commit()
                print("[OK]   2: Added products.category_id"); ok += 1

            # 3. Add FK for category_id
            if fk_exists(c, "products", "fk_products_category"):
                print("[SKIP] 3: FK fk_products_category exists"); skip += 1
            else:
                c.execute(
                    "ALTER TABLE products ADD CONSTRAINT fk_products_category "
                    "FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL"
                )
                conn.commit()
                print("[OK]   3: Added FK products.category_id -> categories.id"); ok += 1

            # 4. Add status column to products (for soft-delete)
            if col_exists(c, "products", "status"):
                print("[SKIP] 4: products.status exists"); skip += 1
            else:
                c.execute(
                    "ALTER TABLE products ADD COLUMN status ENUM('active','inactive') "
                    "NOT NULL DEFAULT 'active'"
                )
                conn.commit()
                print("[OK]   4: Added products.status column"); ok += 1

            # 5. Migrate existing category text into categories table
            c.execute(
                "SELECT DISTINCT category FROM products "
                "WHERE category IS NOT NULL AND category != ''"
            )
            cats = [r["category"] for r in c.fetchall()]
            inserted = 0
            for cat in cats:
                c.execute("SELECT id FROM categories WHERE name = %s", (cat,))
                if not c.fetchone():
                    c.execute(
                        "INSERT INTO categories (name) VALUES (%s)", (cat,)
                    )
                    inserted += 1
            conn.commit()
            if inserted:
                print(f"[OK]   5: Migrated {inserted} categories from products"); ok += 1
            else:
                print("[SKIP] 5: All categories already migrated"); skip += 1

            # 6. Populate category_id from existing text
            c.execute(
                "UPDATE products p JOIN categories cat ON p.category = cat.name "
                "SET p.category_id = cat.id WHERE p.category_id IS NULL"
            )
            affected = c.rowcount
            conn.commit()
            if affected:
                print(f"[OK]   6: Linked {affected} products to category_id"); ok += 1
            else:
                print("[SKIP] 6: All products already linked"); skip += 1

            # 7. Index on products.status
            if idx_exists(c, "products", "idx_products_status"):
                print("[SKIP] 7: idx_products_status exists"); skip += 1
            else:
                c.execute("CREATE INDEX idx_products_status ON products(status)")
                conn.commit()
                print("[OK]   7: Created idx_products_status"); ok += 1

    finally:
        conn.close()

    print(f"\nDone. {ok} applied, {skip} skipped.")


if __name__ == "__main__":
    print("Running IMS migration v2...\n")
    run()

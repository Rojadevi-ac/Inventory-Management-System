"""
Migration v5: Create supplier_issues table for tracking damaged/defective products linked to Supplier & Purchase.
Safe for existing data.
Run: python migrate_v5.py
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
            if tbl_exists(c, "supplier_issues"):
                print("[SKIP] supplier_issues table already exists"); skip += 1
            else:
                c.execute("""
                    CREATE TABLE supplier_issues (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        issue_number VARCHAR(50) NOT NULL UNIQUE,
                        supplier_id INT NOT NULL,
                        purchase_id INT NOT NULL,
                        product_id INT NOT NULL,
                        quantity INT NOT NULL,
                        issue_type VARCHAR(50) NOT NULL,
                        reason VARCHAR(100) NOT NULL,
                        status ENUM('Reported', 'Under Review', 'Approved', 'Return Requested', 'Returned', 'Replacement Requested', 'Replacement Received', 'Resolved', 'Rejected') NOT NULL DEFAULT 'Reported',
                        resolution VARCHAR(50) DEFAULT NULL,
                        notes TEXT DEFAULT NULL,
                        deduct_inventory BOOLEAN DEFAULT TRUE,
                        inventory_deducted BOOLEAN DEFAULT FALSE,
                        issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        created_by INT DEFAULT NULL,
                        resolved_by INT DEFAULT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
                        FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE,
                        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
                        FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,
                        INDEX idx_issue_supplier (supplier_id),
                        INDEX idx_issue_purchase (purchase_id),
                        INDEX idx_issue_product (product_id),
                        INDEX idx_issue_status (status),
                        INDEX idx_issue_type (issue_type),
                        INDEX idx_issue_number (issue_number),
                        INDEX idx_issue_date (issue_date)
                    )
                """)
                conn.commit()
                print("[OK]   Created supplier_issues table"); ok += 1

            # Seed sample supplier damage issues if none exist
            c.execute("SELECT COUNT(*) AS c FROM supplier_issues")
            if c.fetchone()["c"] == 0:
                c.execute("""
                    SELECT pu.id AS purchase_id, pu.product_id, pu.supplier_id, pu.quantity
                    FROM purchases pu
                    WHERE pu.supplier_id IS NOT NULL
                    ORDER BY pu.id ASC
                    LIMIT 3
                """)
                sample_purchases = c.fetchall()

                samples = [
                    ("ISS-2026-0001", "Damaged", "Leakage", "Under Review", None, "5 packets were found leaking upon supplier delivery", 5),
                    ("ISS-2026-0002", "Defective", "Packaging Damage", "Approved", "Replacement", "Packaging was torn during handling by supplier transit", 3),
                    ("ISS-2026-0003", "Wrong Product", "Incorrect Variant", "Resolved", "Return to Supplier", "Received different variant than invoiced purchase order", 2),
                ]

                for idx, pur in enumerate(sample_purchases):
                    if idx < len(samples):
                        inum, itype, rsn, stat, resol, notes, qty = samples[idx]
                        c.execute("""
                            INSERT INTO supplier_issues (
                                issue_number, supplier_id, purchase_id, product_id,
                                quantity, issue_type, reason, status, resolution, notes, created_by
                            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        """, (
                            inum, pur["supplier_id"], pur["purchase_id"], pur["product_id"],
                            qty, itype, rsn, stat, resol, notes, 1
                        ))
                conn.commit()
                print("[OK]   Inserted sample supplier issues for demonstration"); ok += 1

    finally:
        conn.close()

    print(f"\nDone. {ok} applied, {skip} skipped.")


if __name__ == "__main__":
    print("Running IMS migration v5...\n")
    run()

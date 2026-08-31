import random
from datetime import datetime
from config.db import get_connection
from services.log_service import record_log
from utils.timezone import get_ist_now


def _format_dict(d):
    if not d:
        return d
    for k, v in list(d.items()):
        if isinstance(v, datetime) or hasattr(v, "isoformat"):
            d[k] = v.isoformat()
        elif hasattr(v, "as_tuple"):  # Decimal
            d[k] = float(v)
    return d


def _generate_issue_number(cursor):
    year = datetime.now().year
    cursor.execute("SELECT COUNT(*) AS total FROM supplier_issues")
    count = cursor.fetchone()["total"] + 1
    return f"ISS-{year}-{count:04d}"


def get_purchases_by_supplier(supplier_id):
    """
    Get all purchases made from a supplier with product details and reported damage calculation.
    """
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """SELECT pu.id AS purchase_id, pu.quantity AS purchased_quantity,
                          pu.purchase_date, pu.supplier_id,
                          p.id AS product_id, p.name AS product_name, p.sku, p.size,
                          COALESCE(SUM(si.quantity), 0) AS already_reported_damage
                   FROM purchases pu
                   JOIN products p ON pu.product_id = p.id
                   LEFT JOIN supplier_issues si ON si.purchase_id = pu.id AND si.product_id = pu.product_id AND si.status != 'Rejected'
                   WHERE pu.supplier_id = %s
                   GROUP BY pu.id, pu.quantity, pu.purchase_date, pu.supplier_id, p.id, p.name, p.sku, p.size
                   ORDER BY pu.purchase_date DESC""",
                (supplier_id,),
            )
            purchases = [_format_dict(p) for p in cursor.fetchall()]
            for p in purchases:
                p["purchase_no"] = f"PUR-{int(p['purchase_id']):04d}"
                p["purchased_quantity"] = int(p["purchased_quantity"])
                p["already_reported_damage"] = int(p["already_reported_damage"])
                p["remaining_quantity"] = max(0, p["purchased_quantity"] - p["already_reported_damage"])
            return purchases
    finally:
        conn.close()


def get_purchase_product_damage_summary(purchase_id, product_id):
    """
    Get purchased quantity, already reported damage, and remaining quantity for a purchase-product pair.
    """
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """SELECT pu.quantity AS purchased_quantity, p.name AS product_name, p.sku,
                          COALESCE(SUM(si.quantity), 0) AS already_reported_damage
                   FROM purchases pu
                   JOIN products p ON pu.product_id = p.id
                   LEFT JOIN supplier_issues si ON si.purchase_id = pu.id AND si.product_id = pu.product_id AND si.status != 'Rejected'
                   WHERE pu.id = %s AND pu.product_id = %s
                   GROUP BY pu.quantity, p.name, p.sku""",
                (purchase_id, product_id),
            )
            row = cursor.fetchone()
            if not row:
                return None, "Purchase or product not found"
            
            purchased_qty = int(row["purchased_quantity"])
            already_damaged = int(row["already_reported_damage"])
            remaining_qty = max(0, purchased_qty - already_damaged)

            return {
                "purchased_quantity": purchased_qty,
                "already_reported_damage": already_damaged,
                "remaining_quantity": remaining_qty,
                "product_name": row["product_name"],
                "sku": row["sku"],
            }, None
    finally:
        conn.close()


def create_supplier_issue(supplier_id, purchase_id, product_id, quantity,
                          issue_type, reason, notes=None, deduct_inventory=True, user_id=None):
    if quantity <= 0:
        return None, "Quantity must be greater than zero"

    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            # 1. Validate Purchase & Product Relationship
            cursor.execute(
                """SELECT pu.quantity AS purchased_qty, pu.supplier_id, p.name AS product_name, p.sku
                   FROM purchases pu
                   JOIN products p ON pu.product_id = p.id
                   WHERE pu.id = %s AND pu.product_id = %s AND pu.supplier_id = %s""",
                (purchase_id, product_id, supplier_id),
            )
            pur = cursor.fetchone()
            if not pur:
                return None, "Selected product does not belong to this purchase or supplier"

            # 2. Check remaining damage capacity
            cursor.execute(
                """SELECT COALESCE(SUM(quantity), 0) AS reported_qty
                   FROM supplier_issues
                   WHERE purchase_id = %s AND product_id = %s AND status != 'Rejected'""",
                (purchase_id, product_id),
            )
            reported = int(cursor.fetchone()["reported_qty"])
            remaining = int(pur["purchased_qty"]) - reported

            if quantity > remaining:
                return None, f"Damage quantity exceeds the remaining quantity for this purchase. Remaining available: {remaining} units."

            # 3. Create Issue
            issue_number = _generate_issue_number(cursor)
            now_str = get_ist_now()

            cursor.execute(
                """INSERT INTO supplier_issues (
                    issue_number, supplier_id, purchase_id, product_id,
                    quantity, issue_type, reason, status, notes, deduct_inventory,
                    issue_date, created_by
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, 'Reported', %s, %s, %s, %s)""",
                (issue_number, supplier_id, purchase_id, product_id,
                 quantity, issue_type, reason, notes, deduct_inventory, now_str, user_id),
            )
            issue_id = cursor.lastrowid

            # 4. Deduct inventory if required (e.g. damaged while in stock)
            if deduct_inventory:
                cursor.execute(
                    "SELECT quantity FROM inventory WHERE product_id = %s FOR UPDATE",
                    (product_id,),
                )
                inv = cursor.fetchone()
                prev_stock = int(inv["quantity"]) if inv else 0
                new_stock = max(0, prev_stock - quantity)

                cursor.execute(
                    "UPDATE inventory SET quantity = %s WHERE product_id = %s",
                    (new_stock, product_id),
                )
                cursor.execute(
                    "UPDATE supplier_issues SET inventory_deducted = TRUE WHERE id = %s",
                    (issue_id,),
                )

                # Record stock movement transaction
                cursor.execute(
                    """INSERT INTO transactions (product_id, type, quantity, transaction_date, reference_id)
                       VALUES (%s, 'OUT', %s, %s, %s)""",
                    (product_id, quantity, now_str, issue_id),
                )

                # Record audit log
                record_log(
                    cursor,
                    product_id=product_id,
                    action_type="UPDATE",
                    user_id=user_id,
                    quantity=quantity,
                    previous_stock=prev_stock,
                    new_stock=new_stock,
                    details=f"Supplier Issue Reported ({issue_number}): {quantity} units flagged as {issue_type} ({reason})",
                )

            conn.commit()
            return issue_id, None
    except Exception as e:
        conn.rollback()
        return None, str(e)
    finally:
        conn.close()


def update_supplier_issue_status(issue_id, status, resolution=None, notes=None, user_id=None):
    valid_statuses = [
        'Reported', 'Under Review', 'Approved', 'Return Requested', 'Returned',
        'Replacement Requested', 'Replacement Received', 'Resolved', 'Rejected'
    ]
    if status not in valid_statuses:
        return None, f"Invalid status. Allowed: {', '.join(valid_statuses)}"

    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM supplier_issues WHERE id = %s", (issue_id,))
            issue = cursor.fetchone()
            if not issue:
                return None, "Supplier issue not found"

            now_str = get_ist_now()

            # If issue was Rejected and inventory was previously deducted, restore inventory
            if status == "Rejected" and issue["inventory_deducted"] and issue["status"] != "Rejected":
                cursor.execute(
                    "UPDATE inventory SET quantity = quantity + %s WHERE product_id = %s",
                    (issue["quantity"], issue["product_id"]),
                )
                cursor.execute(
                    "UPDATE supplier_issues SET inventory_deducted = FALSE WHERE id = %s",
                    (issue_id,),
                )
                cursor.execute(
                    """INSERT INTO transactions (product_id, type, quantity, transaction_date, reference_id)
                       VALUES (%s, 'IN', %s, %s, %s)""",
                    (issue["product_id"], issue["quantity"], now_str, issue_id),
                )

            # If status transitioned to Resolved, ensure resolution is noted
            new_resolution = resolution if resolution is not None else issue["resolution"]
            new_notes = notes if notes is not None else issue["notes"]
            resolved_by = user_id if status in ("Resolved", "Approved", "Rejected") else issue["resolved_by"]

            cursor.execute(
                """UPDATE supplier_issues
                   SET status = %s, resolution = %s, notes = %s, resolved_by = %s
                   WHERE id = %s""",
                (status, new_resolution, new_notes, resolved_by, issue_id),
            )

            # Record audit log
            cursor.execute("SELECT quantity FROM inventory WHERE product_id = %s", (issue["product_id"],))
            inv = cursor.fetchone()
            stock_now = int(inv["quantity"]) if inv else 0
            resol_txt = f" (Resolution: {new_resolution})" if new_resolution else ""

            record_log(
                cursor,
                product_id=issue["product_id"],
                action_type="UPDATE",
                user_id=user_id,
                previous_stock=stock_now,
                new_stock=stock_now,
                details=f"Supplier Issue {issue['issue_number']} status changed to '{status}'{resol_txt}",
            )

            conn.commit()
            return issue_id, None
    except Exception as e:
        conn.rollback()
        return None, str(e)
    finally:
        conn.close()


def get_supplier_issues(search=None, supplier_id=None, purchase_id=None, product_id=None,
                        issue_type=None, status=None, resolution=None,
                        date_from=None, date_to=None, page=1, per_page=10):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            conditions = []
            params = []

            if search:
                conditions.append(
                    "(si.issue_number LIKE %s OR s.name LIKE %s OR CAST(pu.id AS CHAR) LIKE %s OR p.name LIKE %s OR p.sku LIKE %s)"
                )
                term = f"%{search}%"
                params.extend([term, term, term, term, term])
            if supplier_id:
                conditions.append("si.supplier_id = %s")
                params.append(supplier_id)
            if purchase_id:
                conditions.append("si.purchase_id = %s")
                params.append(purchase_id)
            if product_id:
                conditions.append("si.product_id = %s")
                params.append(product_id)
            if issue_type:
                conditions.append("si.issue_type = %s")
                params.append(issue_type)
            if status:
                conditions.append("si.status = %s")
                params.append(status)
            if resolution:
                conditions.append("si.resolution = %s")
                params.append(resolution)
            if date_from:
                conditions.append("DATE(si.issue_date) >= %s")
                params.append(date_from)
            if date_to:
                conditions.append("DATE(si.issue_date) <= %s")
                params.append(date_to)

            where = f"WHERE {' AND '.join(conditions)}" if conditions else ""
            offset = (page - 1) * per_page

            cursor.execute(
                f"""SELECT COUNT(*) AS total FROM supplier_issues si
                    JOIN suppliers s ON si.supplier_id = s.id
                    JOIN purchases pu ON si.purchase_id = pu.id
                    JOIN products p ON si.product_id = p.id
                    {where}""",
                params,
            )
            total = int(cursor.fetchone()["total"])

            cursor.execute(
                f"""SELECT si.*,
                           s.name AS supplier_name, s.logo_url AS supplier_logo,
                           pu.purchase_date, pu.quantity AS purchased_quantity,
                           p.name AS product_name, p.sku, p.size, p.image_url AS product_image,
                           u.name AS created_by_name,
                           ru.name AS resolved_by_name
                    FROM supplier_issues si
                    JOIN suppliers s ON si.supplier_id = s.id
                    JOIN purchases pu ON si.purchase_id = pu.id
                    JOIN products p ON si.product_id = p.id
                    LEFT JOIN users u ON si.created_by = u.id
                    LEFT JOIN users ru ON si.resolved_by = ru.id
                    {where}
                    ORDER BY si.created_at DESC
                    LIMIT %s OFFSET %s""",
                params + [per_page, offset],
            )
            issues = [_format_dict(row) for row in cursor.fetchall()]
            for row in issues:
                row["purchase_no"] = f"PUR-{int(row['purchase_id']):04d}"
            return issues, total, None
    except Exception as e:
        return [], 0, str(e)
    finally:
        conn.close()


def get_supplier_quality_summary(supplier_id):
    """
    Get comprehensive quality and damage statistics for a supplier.
    """
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            # 1. Total purchases
            cursor.execute("SELECT COUNT(*) AS c FROM purchases WHERE supplier_id = %s", (supplier_id,))
            total_purchases = int(cursor.fetchone()["c"])

            # 2. Issues summary
            cursor.execute(
                """SELECT
                    COUNT(*) AS total_issues,
                    COALESCE(SUM(CASE WHEN issue_type = 'Damaged' THEN quantity ELSE 0 END), 0) AS damaged_qty,
                    COALESCE(SUM(CASE WHEN issue_type = 'Defective' THEN quantity ELSE 0 END), 0) AS defective_qty,
                    COALESCE(SUM(CASE WHEN status = 'Returned' OR resolution = 'Return to Supplier' THEN quantity ELSE 0 END), 0) AS returned_qty,
                    COALESCE(SUM(CASE WHEN status = 'Replacement Received' OR resolution = 'Replacement' THEN quantity ELSE 0 END), 0) AS replacement_qty,
                    COALESCE(SUM(CASE WHEN status NOT IN ('Resolved', 'Rejected') THEN 1 ELSE 0 END), 0) AS pending_issues
                   FROM supplier_issues
                   WHERE supplier_id = %s""",
                (supplier_id,),
            )
            summary = cursor.fetchone()

            # 3. Recent issues
            cursor.execute(
                """SELECT si.*, p.name AS product_name, p.sku
                   FROM supplier_issues si
                   JOIN products p ON si.product_id = p.id
                   WHERE si.supplier_id = %s
                   ORDER BY si.created_at DESC
                   LIMIT 10""",
                (supplier_id,),
            )
            recent_issues = [_format_dict(r) for r in cursor.fetchall()]
            for r in recent_issues:
                r["purchase_no"] = f"PUR-{int(r['purchase_id']):04d}"

            return {
                "total_purchases": total_purchases,
                "total_issues": int(summary["total_issues"]),
                "damaged_quantity": int(summary["damaged_qty"]),
                "defective_quantity": int(summary["defective_qty"]),
                "returned_quantity": int(summary["returned_qty"]),
                "replacement_quantity": int(summary["replacement_qty"]),
                "pending_issues": int(summary["pending_issues"]),
                "recent_issues": recent_issues,
            }, None
    except Exception as e:
        return None, str(e)
    finally:
        conn.close()

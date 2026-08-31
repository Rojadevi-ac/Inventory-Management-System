from config.db import get_connection
from services.inventory_service import get_low_stock_count, get_total_stock


def get_dashboard_stats():
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) AS total FROM products WHERE status = 'active'")
            res = cursor.fetchone()
            total_products = int(res["total"]) if res and res.get("total") is not None else 0
    finally:
        conn.close()

    total_stock = int(get_total_stock() or 0)
    low_stock = int(get_low_stock_count() or 0)

    return {
        "total_products": total_products,
        "total_stock": total_stock,
        "low_stock_count": low_stock,
    }


def get_transactions(txn_type=None, date_from=None, date_to=None, page=1, per_page=50):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            # Combine purchases (IN), orders (OUT), and standalone transactions without duplicates
            union_query = """
                SELECT pu.id, pu.product_id, 'IN' AS type, pu.quantity, pu.purchase_date AS transaction_date
                FROM purchases pu
                UNION ALL
                SELECT o.id, o.product_id, 'OUT' AS type, o.quantity, o.order_date AS transaction_date
                FROM orders o
                UNION ALL
                SELECT t.id, t.product_id, t.type, t.quantity, t.transaction_date
                FROM transactions t
                WHERE t.reference_id IS NULL
            """

            conditions = []
            params = []

            if txn_type:
                conditions.append("combined.type = %s")
                params.append(txn_type)
            if date_from:
                conditions.append("DATE(combined.transaction_date) >= %s")
                params.append(date_from)
            if date_to:
                conditions.append("DATE(combined.transaction_date) <= %s")
                params.append(date_to)

            where = f"WHERE {' AND '.join(conditions)}" if conditions else ""
            offset = (page - 1) * per_page

            cursor.execute(
                f"""SELECT COUNT(*) AS total FROM ({union_query}) AS combined {where}""",
                params,
            )
            res = cursor.fetchone()
            total = int(res["total"]) if res and res.get("total") is not None else 0

            cursor.execute(
                f"""SELECT combined.*,
                           COALESCE(p.name, 'Product Item') AS product_name,
                           COALESCE(p.sku, 'N/A') AS sku
                    FROM ({union_query}) AS combined
                    LEFT JOIN products p ON combined.product_id = p.id
                    {where}
                    ORDER BY combined.transaction_date DESC
                    LIMIT %s OFFSET %s""",
                params + [per_page, offset],
            )
            transactions = cursor.fetchall()
            for t in transactions:
                if t.get("transaction_date") and hasattr(t["transaction_date"], "isoformat"):
                    t["transaction_date"] = t["transaction_date"].isoformat()
                elif t.get("transaction_date"):
                    t["transaction_date"] = str(t["transaction_date"])
                if t.get("quantity") is not None:
                    t["quantity"] = int(t["quantity"])

            return transactions, total, None
    finally:
        conn.close()

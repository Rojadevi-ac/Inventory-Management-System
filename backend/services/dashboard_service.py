from config.db import get_connection
from services.inventory_service import get_low_stock_count, get_total_stock
from services.product_service import get_products


def get_dashboard_stats():
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) AS total FROM products")
            total_products = cursor.fetchone()["total"]
    finally:
        conn.close()

    return {
        "total_products": total_products,
        "total_stock": get_total_stock(),
        "low_stock_count": get_low_stock_count(),
    }


def get_transactions(txn_type=None, date_from=None, date_to=None, page=1, per_page=10):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            conditions = []
            params = []

            if txn_type:
                conditions.append("t.type = %s")
                params.append(txn_type)
            if date_from:
                conditions.append("DATE(t.transaction_date) >= %s")
                params.append(date_from)
            if date_to:
                conditions.append("DATE(t.transaction_date) <= %s")
                params.append(date_to)

            where = f"WHERE {' AND '.join(conditions)}" if conditions else ""
            offset = (page - 1) * per_page

            cursor.execute(f"SELECT COUNT(*) AS total FROM transactions t {where}", params)
            total = cursor.fetchone()["total"]

            cursor.execute(
                f"""SELECT t.*, p.name AS product_name, p.sku
                    FROM transactions t
                    JOIN products p ON t.product_id = p.id
                    {where}
                    ORDER BY t.transaction_date DESC
                    LIMIT %s OFFSET %s""",
                params + [per_page, offset],
            )
            transactions = cursor.fetchall()
            return transactions, total, None
    finally:
        conn.close()

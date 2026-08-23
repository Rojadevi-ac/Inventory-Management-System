from config.db import get_connection


def get_categories(search=None, status=None, page=1, per_page=10):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            conditions = []
            params = []

            if search:
                conditions.append("(c.name LIKE %s OR c.description LIKE %s)")
                term = f"%{search}%"
                params.extend([term, term])
            if status:
                conditions.append("c.status = %s")
                params.append(status)

            where = f"WHERE {' AND '.join(conditions)}" if conditions else ""
            offset = (page - 1) * per_page

            cursor.execute(f"SELECT COUNT(*) AS total FROM categories c {where}", params)
            total = cursor.fetchone()["total"]

            cursor.execute(
                f"""SELECT c.*,
                           (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.status = 'active') AS product_count
                    FROM categories c
                    {where}
                    ORDER BY c.name ASC
                    LIMIT %s OFFSET %s""",
                params + [per_page, offset],
            )
            categories = cursor.fetchall()
            return categories, total, None
    finally:
        conn.close()


def get_all_active_categories():
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT id, name FROM categories WHERE status = 'active' ORDER BY name"
            )
            return cursor.fetchall()
    finally:
        conn.close()


def get_category_by_id(category_id):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM categories WHERE id = %s", (category_id,))
            return cursor.fetchone()
    finally:
        conn.close()


def create_category(name, description=None):
    if not name or not name.strip():
        return None, "Category name is required"

    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id FROM categories WHERE name = %s", (name.strip(),))
            if cursor.fetchone():
                return None, "Category with this name already exists"

            cursor.execute(
                "INSERT INTO categories (name, description) VALUES (%s, %s)",
                (name.strip(), (description or "").strip() or None),
            )
            conn.commit()
            return cursor.lastrowid, None
    except Exception as e:
        conn.rollback()
        return None, str(e)
    finally:
        conn.close()


def update_category(category_id, name=None, description=None, status=None):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM categories WHERE id = %s", (category_id,))
            cat = cursor.fetchone()
            if not cat:
                return None, "Category not found"

            new_name = (name or "").strip() or cat["name"]
            new_desc = description if description is not None else cat["description"]
            new_status = status or cat["status"]

            if new_name != cat["name"]:
                cursor.execute(
                    "SELECT id FROM categories WHERE name = %s AND id != %s",
                    (new_name, category_id),
                )
                if cursor.fetchone():
                    return None, "Another category with this name exists"

            cursor.execute(
                "UPDATE categories SET name=%s, description=%s, status=%s WHERE id=%s",
                (new_name, new_desc, new_status, category_id),
            )

            if new_name != cat["name"]:
                cursor.execute(
                    "UPDATE products SET category=%s WHERE category_id=%s",
                    (new_name, category_id),
                )

            conn.commit()
            return category_id, None
    except Exception as e:
        conn.rollback()
        return None, str(e)
    finally:
        conn.close()


def delete_category(category_id):
    return update_category(category_id, status="inactive")

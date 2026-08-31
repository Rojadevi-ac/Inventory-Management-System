"""
seed.py - Seed the IMS database with realistic sample data including professional images.
Run: python seed.py
"""

import sys, os, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import pymysql
import bcrypt
import random
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

# ---- Connection -------------------------------------------------------
conn = pymysql.connect(
    host=os.getenv("DB_HOST", "localhost"),
    user=os.getenv("DB_USER", "root"),
    password=os.getenv("DB_PASSWORD", ""),
    database=os.getenv("DB_NAME", "ims_db"),
    port=int(os.getenv("DB_PORT", 3306)),
    cursorclass=pymysql.cursors.DictCursor,
    autocommit=False,
)


def hash_pw(pw: str) -> str:
    return bcrypt.hashpw(pw.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def rand_sku(category: str, name: str, size: str) -> str:
    """Shortened human-readable SKU: CAT3-NAME4-SZ3-NNNN"""
    cat = "".join(c for c in category.upper() if c.isalnum())[:3] or "CAT"
    nm  = "".join(c for c in name.upper()     if c.isalnum())[:4] or "PRD"
    sz  = "".join(c for c in size.upper()      if c.isalnum())[:3] or "STD"
    return f"{cat}-{nm}-{sz}-{random.randint(1000, 9999)}"


try:
    with conn.cursor() as cur:

        # ---- Disable FK checks for clean re-seed --------------------------
        cur.execute("SET FOREIGN_KEY_CHECKS = 0")
        for tbl in ["transactions", "orders", "purchases", "inventory", "products", "categories", "suppliers", "users"]:
            cur.execute(f"TRUNCATE TABLE {tbl}")
        cur.execute("SET FOREIGN_KEY_CHECKS = 1")

        # ---- 1. USERS -----------------------------------------------------
        users = [
            ("Roja",   "roja@ims.com",   hash_pw("Admin@123"),  "admin",   "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"),
            ("Sunil",  "sunil@ims.com",  hash_pw("Staff@123"),  "manager", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"),
            ("Priya",  "priya@ims.com",  hash_pw("Staff@123"),  "staff",   "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"),
            ("Savitha","savitha@ims.com",hash_pw("Staff@123"),  "staff",   "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80"),
            ("Beula",  "beula@ims.com",  hash_pw("Staff@123"),  "staff",   "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80"),
            ("imsuser","imsuser@ims.com",hash_pw("qwerty123"),  "viewer",  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80"),
        ]
        cur.executemany(
            "INSERT INTO users (name, email, password, role, avatar_url) VALUES (%s, %s, %s, %s, %s)",
            users,
        )
        user_ids = list(range(1, len(users) + 1))
        print(f"[OK] {len(users)} users inserted")

        # ---- 2. SUPPLIERS --------------------------------------------------
        suppliers_raw = [
            ("FreshDairy Co.",     "Ramesh Kumar",  "+91 98765 43210", "ramesh@freshdairy.com",    "No.12 Milk Colony, Coimbatore", "2022-01-15", "https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&w=200&q=80"),
            ("GrainMart Ltd.",     "Sita Devi",     "+91 87654 32109", "sita@grainmart.com",       "45 Grain Market, Chennai",      "2021-06-01", "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=200&q=80"),
            ("QuickSupply Inc.",   "Ajay Mehta",    "+91 76543 21098", "ajay@quicksupply.in",      "78 Industrial Area, Bangalore", "2023-03-10", "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=200&q=80"),
            ("NaturalBrands",      "Deepa Menon",   "+91 65432 10987", "deepa@naturalbrands.com",  "15 Organic Lane, Kochi",        "2022-09-20", "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=200&q=80"),
            ("MegaWholesale",      "Vijay Sharma",  "+91 54321 09876", "vijay@megawholesale.com",  "Plot 88, APMC Market, Hyderabad", "2020-11-05", "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=200&q=80"),
        ]
        supplier_ids = []
        for name, contact, phone, email, address, started, logo in suppliers_raw:
            cur.execute(
                "INSERT INTO suppliers (name, contact_person, phone, email, address, started_at, logo_url) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                (name, contact, phone, email, address, started, logo),
            )
            supplier_ids.append(cur.lastrowid)
        print(f"[OK] {len(suppliers_raw)} suppliers inserted")

        # ---- 3. CATEGORIES -------------------------------------------------
        categories_raw = [
            ("Dairy",       "Milk, yogurt, cheese and butter products"),
            ("Grains",      "Rice, wheat, flour and cereals"),
            ("Condiments",  "Sauces, spices and dressings"),
            ("Oils",        "Edible cooking and frying oils"),
            ("Beverages",   "Juices, water, tea and coffee"),
            ("Cleaning",    "Detergents, soaps and disinfectants"),
            ("Personal",    "Hygiene, skincare and haircare"),
        ]
        category_id_map = {}
        for cat_name, cat_desc in categories_raw:
            cur.execute(
                "INSERT INTO categories (name, description, status) VALUES (%s, %s, 'active')",
                (cat_name, cat_desc),
            )
            category_id_map[cat_name] = cur.lastrowid
        print(f"[OK] {len(categories_raw)} categories inserted")

        # ---- 4. PRODUCTS --------------------------------------------------
        products_raw = [
            # (name, category, size, price, barcode, image_url)
            ("Full Cream Milk",   "Dairy",      "1L",    85.00,  "8901234567890", "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80"),
            ("Toned Milk",        "Dairy",      "500ml", 42.00,  "8901234567891", "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80"),
            ("Greek Yogurt",      "Dairy",      "400g",  110.00, "8901234567892", "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80"),
            ("Paneer",            "Dairy",      "200g",  95.00,  None,            "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=400&q=80"),
            ("Butter",            "Dairy",      "100g",  58.00,  "8901234567894", "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=400&q=80"),
            ("Basmati Rice",      "Grains",     "5kg",   420.00, "8905432109876", "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80"),
            ("Brown Rice",        "Grains",     "2kg",   195.00, None,            "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=400&q=80"),
            ("Wheat Flour",       "Grains",     "10kg",  380.00, "8905432109877", "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80"),
            ("Oats",              "Grains",     "1kg",   150.00, "8905432109878", "https://images.unsplash.com/photo-1517093709142-99079a40552b?auto=format&fit=crop&w=400&q=80"),
            ("Semolina",          "Grains",     "500g",  45.00,  None,            "https://images.unsplash.com/photo-1627485937980-221c88ac04f9?auto=format&fit=crop&w=400&q=80"),
            ("Tomato Ketchup",    "Condiments", "500g",  135.00, "8904321098765", "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=400&q=80"),
            ("Mustard Oil",       "Oils",       "1L",    175.00, "8904321098766", "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80"),
            ("Sunflower Oil",     "Oils",       "2L",    290.00, "8904321098767", "https://images.unsplash.com/photo-1589217157232-464b505b197f?auto=format&fit=crop&w=400&q=80"),
            ("Olive Oil",         "Oils",       "500ml", 395.00, None,            "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80"),
            ("Groundnut Oil",     "Oils",       "1L",    165.00, "8904321098769", "https://images.unsplash.com/photo-1589217157232-464b505b197f?auto=format&fit=crop&w=400&q=80"),
            ("Mineral Water",     "Beverages",  "1L",    20.00,  "8903210987654", "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=400&q=80"),
            ("Orange Juice",      "Beverages",  "1L",    120.00, "8903210987655", "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=400&q=80"),
            ("Green Tea",         "Beverages",  "100g",  180.00, None,            "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=80"),
            ("Instant Coffee",    "Beverages",  "200g",  260.00, "8903210987657", "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80"),
            ("Mango Juice",       "Beverages",  "200ml", 30.00,  "8903210987658", "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=400&q=80"),
            ("Detergent Powder",  "Cleaning",   "1kg",   155.00, "8902109876543", "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=400&q=80"),
            ("Dish Wash Bar",     "Cleaning",   "200g",  22.00,  "8902109876544", "https://images.unsplash.com/photo-1603555501671-8f96b3fce8e4?auto=format&fit=crop&w=400&q=80"),
            ("Floor Cleaner",     "Cleaning",   "500ml", 95.00,  None,            "https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?auto=format&fit=crop&w=400&q=80"),
            ("Toilet Cleaner",    "Cleaning",   "500ml", 85.00,  "8902109876546", "https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=400&q=80"),
            ("Hand Wash",         "Personal",   "250ml", 75.00,  "8901098765432", "https://images.unsplash.com/photo-1608248597359-00918073809d?auto=format&fit=crop&w=400&q=80"),
            ("Shampoo",           "Personal",   "200ml", 180.00, None,            "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=400&q=80"),
            ("Soap Bar",          "Personal",   "100g",  35.00,  "8901098765434", "https://images.unsplash.com/photo-1607006314644-8e14674db8a3?auto=format&fit=crop&w=400&q=80"),
            ("Toothpaste",        "Personal",   "150g",  85.00,  "8901098765435", "https://images.unsplash.com/photo-1559591937-e1032b4b4550?auto=format&fit=crop&w=400&q=80"),
            ("Body Lotion",       "Personal",   "300ml", 210.00, None,            "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80"),
            ("Face Wash",         "Personal",   "100ml", 145.00, "8901098765437", "https://images.unsplash.com/photo-1556228722-d0b5d03632ab?auto=format&fit=crop&w=400&q=80"),
        ]

        skus_used = set()
        product_ids = []
        for name, cat, size, price, barcode, image_url in products_raw:
            for _ in range(20):
                sku = rand_sku(cat, name, size)
                if sku not in skus_used:
                    skus_used.add(sku)
                    break
            cat_id = category_id_map.get(cat)
            cur.execute(
                "INSERT INTO products (name, category, category_id, size, price, sku, barcode, image_url, status) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'active')",
                (name, cat, cat_id, size, price, sku, barcode, image_url),
            )
            product_ids.append(cur.lastrowid)
        print(f"[OK] {len(products_raw)} products inserted")

        # ---- 5. INVENTORY -------------------------------------------------
        inventory_data = [
            (0,  120, 20), (1,   80, 25), (2,   18, 15), (3,    5, 10),
            (4,   35, 20), (5,   60, 15), (6,   40, 10), (7,   25, 20),
            (8,   12, 15), (9,   55, 10), (10,  30, 20), (11,  45, 15),
            (12,  20, 20), (13,   8, 10), (14,  50, 15), (15, 200, 30),
            (16,  15, 20), (17,  40, 10), (18,  22, 15), (19,  90, 25),
            (20,  10, 15), (21,  75, 20), (22,   6, 10), (23,  30, 15),
            (24,  45, 20), (25,  18, 15), (26,  85, 25), (27,  60, 20),
            (28,  14, 15), (29,  28, 15),
        ]
        for p_idx, qty, reorder in inventory_data:
            if p_idx < len(product_ids):
                pid = product_ids[p_idx]
                cur.execute(
                    "INSERT INTO inventory (product_id, quantity, reorder_level) VALUES (%s, %s, %s)",
                    (pid, qty, reorder),
                )
        print(f"[OK] Inventory initialised for {len(inventory_data)} products")

        # ---- 6. PURCHASES & ORDERS (Transactions) -------------------------
        now = datetime.now()

        purchases_seed = [
            (0, 100, 0, now - timedelta(days=28)),
            (1,  60, 0, now - timedelta(days=25)),
            (4,  40, 0, now - timedelta(days=22)),
            (5,  80, 1, now - timedelta(days=20)),
            (7,  35, 1, now - timedelta(days=18)),
            (10, 50, 2, now - timedelta(days=15)),
            (15, 250, 3, now - timedelta(days=12)),
            (16, 30, 3, now - timedelta(days=10)),
            (20, 20, 4, now - timedelta(days=7)),
            (24, 60, 4, now - timedelta(days=4)),
            (26, 100, 4, now - timedelta(days=2)),
            (2,  30, 0, now - timedelta(days=1)),
        ]
        for p_idx, qty, s_idx, pdate in purchases_seed:
            if p_idx < len(product_ids) and s_idx < len(supplier_ids):
                pid = product_ids[p_idx]
                sid = supplier_ids[s_idx]
                cur.execute(
                    "INSERT INTO purchases (product_id, quantity, supplier_id, purchase_date, created_by) VALUES (%s, %s, %s, %s, %s)",
                    (pid, qty, sid, pdate, 1),
                )
                pur_id = cur.lastrowid
                cur.execute(
                    "INSERT INTO transactions (product_id, type, quantity, transaction_date, reference_id) VALUES (%s, 'IN', %s, %s, %s)",
                    (pid, qty, pdate, pur_id),
                )
        print(f"[OK] {len(purchases_seed)} purchases and IN transactions created")

        orders_seed = [
            (0, 20, now - timedelta(days=24)),
            (1, 10, now - timedelta(days=21)),
            (5, 20, now - timedelta(days=17)),
            (7, 10, now - timedelta(days=14)),
            (10, 20, now - timedelta(days=11)),
            (15, 50, now - timedelta(days=8)),
            (16, 15, now - timedelta(days=6)),
            (20, 10, now - timedelta(days=3)),
            (24, 15, now - timedelta(days=2)),
            (26, 15, now - timedelta(hours=18)),
            (2,  12, now - timedelta(hours=6)),
        ]
        for p_idx, qty, odate in orders_seed:
            if p_idx < len(product_ids):
                pid = product_ids[p_idx]
                cur.execute(
                    "INSERT INTO orders (product_id, quantity, order_date, created_by) VALUES (%s, %s, %s, %s)",
                    (pid, qty, odate, 2),
                )
                ord_id = cur.lastrowid
                cur.execute(
                    "INSERT INTO transactions (product_id, type, quantity, transaction_date, reference_id) VALUES (%s, 'OUT', %s, %s, %s)",
                    (pid, qty, odate, ord_id),
                )
        print(f"[OK] {len(orders_seed)} orders and OUT transactions created")

        conn.commit()
        print("\nDatabase seeded successfully!")

except Exception as e:
    conn.rollback()
    print(f"[ERROR] Database seeding failed: {e}", file=sys.stderr)
    sys.exit(1)
finally:
    conn.close()

"""
Populate professional product images, supplier logos, and staff avatars.
Run: python populate_product_images.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config.db import get_connection

# Professional high-res product photos from Unsplash
PRODUCT_IMAGES = {
    "Full Cream Milk":   "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80",
    "Toned Milk":        "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80",
    "Greek Yogurt":      "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80",
    "Paneer":            "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=400&q=80",
    "Butter":            "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=400&q=80",
    "Basmati Rice":      "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80",
    "Brown Rice":        "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=400&q=80",
    "Wheat Flour":       "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80",
    "Oats":              "https://images.unsplash.com/photo-1517093709142-99079a40552b?auto=format&fit=crop&w=400&q=80",
    "Semolina":          "https://images.unsplash.com/photo-1627485937980-221c88ac04f9?auto=format&fit=crop&w=400&q=80",
    "Tomato Ketchup":    "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=400&q=80",
    "Mustard Oil":       "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80",
    "Sunflower Oil":     "https://images.unsplash.com/photo-1589217157232-464b505b197f?auto=format&fit=crop&w=400&q=80",
    "Olive Oil":         "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80",
    "Groundnut Oil":     "https://images.unsplash.com/photo-1589217157232-464b505b197f?auto=format&fit=crop&w=400&q=80",
    "Mineral Water":     "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=400&q=80",
    "Orange Juice":      "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=400&q=80",
    "Green Tea":         "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=80",
    "Instant Coffee":    "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80",
    "Mango Juice":       "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=400&q=80",
    "Detergent Powder":  "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=400&q=80",
    "Dish Wash Bar":     "https://images.unsplash.com/photo-1603555501671-8f96b3fce8e4?auto=format&fit=crop&w=400&q=80",
    "Floor Cleaner":     "https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?auto=format&fit=crop&w=400&q=80",
    "Toilet Cleaner":    "https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=400&q=80",
    "Hand Wash":         "https://images.unsplash.com/photo-1608248597359-00918073809d?auto=format&fit=crop&w=400&q=80",
    "Shampoo":           "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=400&q=80",
    "Soap Bar":          "https://images.unsplash.com/photo-1607006314644-8e14674db8a3?auto=format&fit=crop&w=400&q=80",
    "Toothpaste":        "https://images.unsplash.com/photo-1559591937-e1032b4b4550?auto=format&fit=crop&w=400&q=80",
    "Body Lotion":       "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80",
    "Face Wash":         "https://images.unsplash.com/photo-1556228722-d0b5d03632ab?auto=format&fit=crop&w=400&q=80",
}

# Professional supplier logos
SUPPLIER_LOGOS = {
    "FreshDairy Co.":   "https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&w=200&q=80",
    "GrainMart Ltd.":   "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=200&q=80",
    "QuickSupply Inc.": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=200&q=80",
    "NaturalBrands":    "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=200&q=80",
    "MegaWholesale":    "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=200&q=80",
}

# Professional staff avatars
USER_AVATARS = {
    "roja@ims.com":    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    "sunil@ims.com":   "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    "priya@ims.com":   "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    "savitha@ims.com": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
    "beula@ims.com":   "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
}


def populate():
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            # 1. Update Products
            p_updated = 0
            for name, url in PRODUCT_IMAGES.items():
                cur.execute("UPDATE products SET image_url=%s WHERE name=%s", (url, name))
                p_updated += cur.rowcount
            print(f"[OK] Updated images for {p_updated} products")

            # 2. Update Suppliers
            s_updated = 0
            for name, url in SUPPLIER_LOGOS.items():
                cur.execute("UPDATE suppliers SET logo_url=%s WHERE name=%s", (url, name))
                s_updated += cur.rowcount
            print(f"[OK] Updated logos for {s_updated} suppliers")

            # 3. Update Users
            u_updated = 0
            for email, url in USER_AVATARS.items():
                cur.execute("UPDATE users SET avatar_url=%s WHERE email=%s", (url, email))
                u_updated += cur.rowcount
            print(f"[OK] Updated avatars for {u_updated} staff members")

            conn.commit()
    finally:
        conn.close()


if __name__ == "__main__":
    populate()

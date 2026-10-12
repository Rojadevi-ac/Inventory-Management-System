-- =======================================================
-- SEED DATA FOR IMS (Categories, Suppliers, Products, Inventory, Transactions)
-- =======================================================
USE ims_db;

-- 1. Insert Categories
INSERT INTO categories (id, name, description, status) VALUES
(1, 'Dairy', 'Milk, yogurt, cheese and butter products', 'active'),
(2, 'Grains', 'Rice, wheat, flour and cereals', 'active'),
(3, 'Condiments', 'Sauces, spices and dressings', 'active'),
(4, 'Oils', 'Edible cooking and frying oils', 'active'),
(5, 'Beverages', 'Juices, water, tea and coffee', 'active'),
(6, 'Cleaning', 'Detergents, soaps and disinfectants', 'active'),
(7, 'Personal', 'Hygiene, skincare and haircare', 'active')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Insert Suppliers
INSERT INTO suppliers (id, name, contact_person, phone, email, address, started_at, logo_url) VALUES
(1, 'FreshDairy Co.', 'Ramesh Kumar', '+91 98765 43210', 'ramesh@freshdairy.com', 'No.12 Milk Colony, Coimbatore', '2022-01-15', 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&w=200&q=80'),
(2, 'GrainMart Ltd.', 'Sita Devi', '+91 87654 32109', 'sita@grainmart.com', '45 Grain Market, Chennai', '2021-06-01', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=200&q=80'),
(3, 'QuickSupply Inc.', 'Ajay Mehta', '+91 76543 21098', 'ajay@quicksupply.in', '78 Industrial Area, Bangalore', '2023-03-10', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=200&q=80'),
(4, 'NaturalBrands', 'Deepa Menon', '+91 65432 10987', 'deepa@naturalbrands.com', '15 Organic Lane, Kochi', '2022-09-20', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=200&q=80'),
(5, 'MegaWholesale', 'Vijay Sharma', '+91 54321 09876', 'vijay@megawholesale.com', 'Plot 88, APMC Market, Hyderabad', '2020-11-05', 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=200&q=80')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 3. Insert Products
INSERT INTO products (id, name, category, category_id, size, price, sku, barcode, image_url, status) VALUES
(1, 'Full Cream Milk', 'Dairy', 1, '1L', 85.00, 'DAI-FULL-1L-1001', '8901234567890', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80', 'active'),
(2, 'Toned Milk', 'Dairy', 1, '500ml', 42.00, 'DAI-TONE-500-1002', '8901234567891', 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80', 'active'),
(3, 'Greek Yogurt', 'Dairy', 1, '400g', 110.00, 'DAI-GREE-400-1003', '8901234567892', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80', 'active'),
(4, 'Paneer', 'Dairy', 1, '200g', 95.00, 'DAI-PANE-200-1004', NULL, 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=400&q=80', 'active'),
(5, 'Butter', 'Dairy', 1, '100g', 58.00, 'DAI-BUTT-100-1005', '8901234567894', 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=400&q=80', 'active'),
(6, 'Basmati Rice', 'Grains', 2, '5kg', 420.00, 'GRA-BASM-5KG-1006', '8905432109876', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80', 'active'),
(7, 'Brown Rice', 'Grains', 2, '2kg', 195.00, 'GRA-BROW-2KG-1007', NULL, 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=400&q=80', 'active'),
(8, 'Wheat Flour', 'Grains', 2, '10kg', 380.00, 'GRA-WHEA-10K-1008', '8905432109877', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80', 'active'),
(9, 'Oats', 'Grains', 2, '1kg', 150.00, 'GRA-OATS-1KG-1009', '8905432109878', 'https://images.unsplash.com/photo-1517093709142-99079a40552b?auto=format&fit=crop&w=400&q=80', 'active'),
(10, 'Semolina', 'Grains', 2, '500g', 45.00, 'GRA-SEMO-500-1010', NULL, 'https://images.unsplash.com/photo-1627485937980-221c88ac04f9?auto=format&fit=crop&w=400&q=80', 'active'),
(11, 'Tomato Ketchup', 'Condiments', 3, '500g', 135.00, 'CON-TOMA-500-1011', '8904321098765', 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=400&q=80', 'active'),
(12, 'Mustard Oil', 'Oils', 4, '1L', 175.00, 'OIL-MUST-1L-1012', '8904321098766', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80', 'active'),
(13, 'Sunflower Oil', 'Oils', 4, '2L', 290.00, 'OIL-SUNF-2L-1013', '8904321098767', 'https://images.unsplash.com/photo-1589217157232-464b505b197f?auto=format&fit=crop&w=400&q=80', 'active'),
(14, 'Olive Oil', 'Oils', 4, '500ml', 395.00, 'OIL-OLIV-500-1014', NULL, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80', 'active'),
(15, 'Groundnut Oil', 'Oils', 4, '1L', 165.00, 'OIL-GROU-1L-1015', '8904321098769', 'https://images.unsplash.com/photo-1589217157232-464b505b197f?auto=format&fit=crop&w=400&q=80', 'active'),
(16, 'Mineral Water', 'Beverages', 5, '1L', 20.00, 'BEV-MINE-1L-1016', '8903210987654', 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=400&q=80', 'active'),
(17, 'Orange Juice', 'Beverages', 5, '1L', 120.00, 'BEV-ORAN-1L-1017', '8903210987655', 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=400&q=80', 'active'),
(18, 'Green Tea', 'Beverages', 5, '100g', 180.00, 'BEV-GREE-100-1018', NULL, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=80', 'active'),
(19, 'Instant Coffee', 'Beverages', 5, '200g', 260.00, 'BEV-INST-200-1019', '8903210987657', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80', 'active'),
(20, 'Mango Juice', 'Beverages', 5, '200ml', 30.00, 'BEV-MANG-200-1020', '8903210987658', 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=400&q=80', 'active'),
(21, 'Detergent Powder', 'Cleaning', 6, '1kg', 155.00, 'CLE-DETE-1KG-1021', '8902109876543', 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=400&q=80', 'active'),
(22, 'Dish Wash Bar', 'Cleaning', 6, '200g', 22.00, 'CLE-DISH-200-1022', '8902109876544', 'https://images.unsplash.com/photo-1603555501671-8f96b3fce8e4?auto=format&fit=crop&w=400&q=80', 'active'),
(23, 'Floor Cleaner', 'Cleaning', 6, '500ml', 95.00, 'CLE-FLOO-500-1023', NULL, 'https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?auto=format&fit=crop&w=400&q=80', 'active'),
(24, 'Toilet Cleaner', 'Cleaning', 6, '500ml', 85.00, 'CLE-TOIL-500-1024', '8902109876546', 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=400&q=80', 'active'),
(25, 'Hand Wash', 'Personal', 7, '250ml', 75.00, 'PER-HAND-250-1025', '8901098765432', 'https://images.unsplash.com/photo-1608248597359-00918073809d?auto=format&fit=crop&w=400&q=80', 'active'),
(26, 'Shampoo', 'Personal', 7, '200ml', 180.00, 'PER-SHAM-200-1026', NULL, 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=400&q=80', 'active'),
(27, 'Soap Bar', 'Personal', 7, '100g', 35.00, 'PER-SOAP-100-1027', '8901098765434', 'https://images.unsplash.com/photo-1607006314644-8e14674db8a3?auto=format&fit=crop&w=400&q=80', 'active'),
(28, 'Toothpaste', 'Personal', 7, '150g', 85.00, 'PER-TOOT-150-1028', '8901098765435', 'https://images.unsplash.com/photo-1559591937-e1032b4b4550?auto=format&fit=crop&w=400&q=80', 'active'),
(29, 'Body Lotion', 'Personal', 7, '300ml', 210.00, 'PER-BODY-300-1029', NULL, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80', 'active'),
(30, 'Face Wash', 'Personal', 7, '100ml', 145.00, 'PER-FACE-100-1030', '8901098765437', 'https://images.unsplash.com/photo-1556228722-d0b5d03632ab?auto=format&fit=crop&w=400&q=80', 'active')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 4. Insert Inventory
INSERT INTO inventory (product_id, quantity, reorder_level) VALUES
(1, 120, 20), (2, 80, 25), (3, 18, 15), (4, 5, 10), (5, 35, 20),
(6, 60, 15), (7, 40, 10), (8, 25, 20), (9, 12, 15), (10, 55, 10),
(11, 30, 20), (12, 45, 15), (13, 20, 20), (14, 8, 10), (15, 50, 15),
(16, 200, 30), (17, 15, 20), (18, 40, 10), (19, 22, 15), (20, 90, 25),
(21, 10, 15), (22, 75, 20), (23, 6, 10), (24, 30, 15), (25, 45, 20),
(26, 18, 15), (27, 85, 25), (28, 60, 20), (29, 14, 15), (30, 28, 15)
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);

-- 5. Insert Sample Purchases & Transactions
INSERT INTO purchases (id, product_id, quantity, supplier_id, created_by) VALUES
(1, 1, 100, 1, 1),
(2, 2, 60, 1, 1),
(3, 5, 40, 1, 1),
(4, 6, 80, 2, 1),
(5, 8, 35, 2, 1)
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);

INSERT INTO transactions (product_id, type, quantity, reference_id) VALUES
(1, 'IN', 100, 1),
(2, 'IN', 60, 2),
(5, 'IN', 40, 3),
(6, 'IN', 80, 4),
(8, 'IN', 35, 5)
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);

-- 6. Insert Sample Orders & Transactions
INSERT INTO orders (id, product_id, quantity, created_by) VALUES
(1, 1, 20, 1),
(2, 2, 10, 1),
(3, 6, 20, 1)
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);

INSERT INTO transactions (product_id, type, quantity, reference_id) VALUES
(1, 'OUT', 20, 1),
(2, 'OUT', 10, 2),
(6, 'OUT', 20, 3)
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity);

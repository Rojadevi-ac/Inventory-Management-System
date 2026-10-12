-- =======================================================
-- TiDB-Optimized Full Database Import for IMS
-- =======================================================
CREATE DATABASE IF NOT EXISTS ims_db;
USE ims_db;

SET FOREIGN_KEY_CHECKS = 0;
SET UNIQUE_CHECKS = 0;

-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Dairy','Milk, yogurt, cheese and butter products','active','2026-08-19 08:41:44','2026-08-19 08:41:44'),(2,'Grains','Rice, wheat, flour and cereals','active','2026-08-19 08:41:44','2026-08-19 08:41:44'),(3,'Condiments','Sauces, spices and dressings','active','2026-08-19 08:41:44','2026-08-19 08:41:44'),(4,'Oils','Edible cooking and frying oils','active','2026-08-19 08:41:44','2026-08-19 08:41:44'),(5,'Beverages','Juices, water, tea and coffee','active','2026-08-19 08:41:44','2026-08-19 08:41:44'),(6,'Cleaning','Detergents, soaps and disinfectants','active','2026-08-19 08:41:44','2026-08-19 08:41:44'),(7,'Personal','Hygiene, skincare and haircare','active','2026-08-19 08:41:44','2026-08-19 08:41:44');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;

--

-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'staff',
  `avatar_url` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Roja','roja@ims.com','$2b$12$.Tn7Skk.6Zd5mA3dPvN//eqGSRbDnfzK0hkey14qmZaFxsSfOw7HW','admin','https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80','2026-08-19 08:41:44'),(2,'Sunil','sunil@ims.com','$2b$12$q0RtJVnrYG6GYLEXBaYR..aVLTfnhGGBKplmXwUxuuhueCIpWIBhe','manager','https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80','2026-08-19 08:41:44'),(3,'Priya','priya@ims.com','$2b$12$JADVN5GTFNdP9wiXQX83bO7Lr7eYJTRkRnTAtNM4MOjwQ1Xa83phC','staff','https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80','2026-08-19 08:41:44'),(4,'Savitha','savitha@ims.com','$2b$12$aT/rZdgZG0tEOPcTMbR82u5lEur7lvY9UYTqCdl3GKOq11hO8NxWu','staff','https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80','2026-08-19 08:41:44'),(5,'Beula','beula@ims.com','$2b$12$Mgpuz2MCySgXYUtsbPP68.iIVoSUaJrNx44bolMexxfL2/mb.nJ36','staff','https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80','2026-08-19 08:41:44'),(6,'imsuser','imsuser@ims.com','$2b$10$Gm9duaWU9d30wtJ3qK20WebKrI84uygisE82.vEsIbjLpn72jO..m','viewer','https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80','2026-08-31 11:05:08');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;

--
-- Dumping routines for database 'ims_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-12 20:27:57

-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suppliers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `contact_person` varchar(100) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `logo_url` text,
  `address` text,
  `started_at` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_suppliers_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers`
--

/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
INSERT INTO `suppliers` VALUES (1,'FreshDairy Co.','Ramesh Kumar','+91 98765 43210','ramesh@freshdairy.com','https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?auto=format&fit=crop&w=200&q=80','No.12 Milk Colony, Coimbatore','2022-01-15','2026-08-19 08:41:44'),(2,'GrainMart Ltd.','Sita Devi','+91 87654 32109','sita@grainmart.com','https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=200&q=80','45 Grain Market, Chennai','2021-06-01','2026-08-19 08:41:44'),(3,'QuickSupply Inc.','Ajay Mehta','+91 76543 21098','ajay@quicksupply.in','https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=200&q=80','78 Industrial Area, Bangalore','2023-03-10','2026-08-19 08:41:44'),(4,'NaturalBrands','Deepa Menon','+91 65432 10987','deepa@naturalbrands.com','https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=200&q=80','15 Organic Lane, Kochi','2022-09-20','2026-08-19 08:41:44'),(5,'MegaWholesale','Vijay Sharma','+91 54321 09876','vijay@megawholesale.com','https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=200&q=80','Plot 88, APMC Market, Hyderabad','2020-11-05','2026-08-19 08:41:44');
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;

--

-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `category` varchar(100) NOT NULL,
  `size` varchar(50) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `sku` varchar(100) NOT NULL,
  `barcode` varchar(100) DEFAULT NULL,
  `image_url` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `category_id` int DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku` (`sku`),
  KEY `idx_products_sku` (`sku`),
  KEY `idx_products_name` (`name`),
  KEY `idx_products_status` (`status`),
  KEY `idx_products_category` (`category_id`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Full Cream Milk','Dairy','1L',85.00,'DAI-FULL-1L-8124','8901234567890','https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80','2026-08-19 08:41:44',1,'inactive'),(2,'Toned Milk','Dairy','500ml',42.00,'DAI-TONE-500-9426','8901234567891','https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=400&q=80','2026-08-19 08:41:44',1,'active'),(3,'Greek Yogurt','Dairy','400g',110.00,'DAI-GREE-400-7743','8901234567892','https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80','2026-08-19 08:41:44',1,'active'),(4,'Paneer','Dairy','200g',95.00,'DAI-PANE-200-9851',NULL,'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=400&q=80','2026-08-19 08:41:44',1,'active'),(5,'Butter','Dairy','100g',58.00,'DAI-BUTT-100-7930','8901234567894','https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=400&q=80','2026-08-19 08:41:44',1,'active'),(6,'Basmati Rice','Grains','5kg',420.00,'GRA-BASM-5KG-8696','8905432109876','https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80','2026-08-19 08:41:44',2,'active'),(7,'Brown Rice','Grains','2kg',195.00,'GRA-BROW-2KG-8554',NULL,'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=400&q=80','2026-08-19 08:41:44',2,'active'),(8,'Wheat Flour','Grains','10kg',380.00,'GRA-WHEA-10K-3349','8905432109877','https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80','2026-08-19 08:41:44',2,'active'),(9,'Oats','Grains','1kg',150.00,'GRA-OATS-1KG-9652','8905432109878','https://images.unsplash.com/photo-1517093709142-99079a40552b?auto=format&fit=crop&w=400&q=80','2026-08-19 08:41:44',2,'active'),(10,'Semolina','Grains','500g',45.00,'GRA-SEMO-500-1957',NULL,'https://images.unsplash.com/photo-1627485937980-221c88ac04f9?auto=format&fit=crop&w=400&q=80','2026-08-19 08:41:44',2,'active'),(11,'Tomato Ketchup','Condiments','500g',135.00,'CON-TOMA-500-5722','8904321098765','https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=400&q=80','2026-08-19 08:41:44',3,'active'),(12,'Mustard Oil','Oils','1L',175.00,'OIL-MUST-1L-7256','8904321098766','https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80','2026-08-19 08:41:44',4,'active'),(13,'Sunflower Oil','Oils','2L',290.00,'OIL-SUNF-2L-3469','8904321098767','https://images.unsplash.com/photo-1589217157232-464b505b197f?auto=format&fit=crop&w=400&q=80','2026-08-19 08:41:44',4,'active'),(14,'Olive Oil','Oils','500ml',395.00,'OIL-OLIV-500-7710',NULL,'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80','2026-08-19 08:41:44',4,'active'),(15,'Groundnut Oil','Oils','1L',165.00,'OIL-GROU-1L-2390','8904321098769','https://images.unsplash.com/photo-1589217157232-464b505b197f?auto=format&fit=crop&w=400&q=80','2026-08-19 08:41:44',4,'active'),(16,'Mineral Water','Beverages','1L',20.00,'BEV-MINE-1L-2472','8903210987654','https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=400&q=80','2026-08-19 08:41:44',5,'active'),(17,'Orange Juice','Beverages','1L',120.00,'BEV-ORAN-1L-3289','8903210987655','https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=400&q=80','2026-08-19 08:41:44',5,'active'),(18,'Green Tea','Beverages','100g',180.00,'BEV-GREE-100-8366',NULL,'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=80','2026-08-19 08:41:44',5,'active'),(19,'Instant Coffee','Beverages','200g',260.00,'BEV-INST-200-9788','8903210987657','https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80','2026-08-19 08:41:44',5,'active'),(20,'Mango Juice','Beverages','200ml',30.00,'BEV-MANG-200-8902','8903210987658','https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=400&q=80','2026-08-19 08:41:44',5,'active'),(21,'Detergent Powder','Cleaning','1kg',155.00,'CLE-DETE-1KG-1077','8902109876543','https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=400&q=80','2026-08-19 08:41:44',6,'active'),(22,'Dish Wash Bar','Cleaning','200g',22.00,'CLE-DISH-200-9217','8902109876544','https://images.unsplash.com/photo-1603555501671-8f96b3fce8e4?auto=format&fit=crop&w=400&q=80','2026-08-19 08:41:44',6,'active'),(23,'Floor Cleaner','Cleaning','500ml',95.00,'CLE-FLOO-500-5206',NULL,'https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?auto=format&fit=crop&w=400&q=80','2026-08-19 08:41:44',6,'active'),(24,'Toilet Cleaner','Cleaning','500ml',85.00,'CLE-TOIL-500-5312','8902109876546','https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=400&q=80','2026-08-19 08:41:44',6,'active'),(25,'Hand Wash','Personal','250ml',75.00,'PER-HAND-250-2610','8901098765432','https://images.unsplash.com/photo-1608248597359-00918073809d?auto=format&fit=crop&w=400&q=80','2026-08-19 08:41:44',7,'active'),(26,'Shampoo','Personal','200ml',180.00,'PER-SHAM-200-2346',NULL,'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=400&q=80','2026-08-19 08:41:44',7,'active'),(27,'Soap Bar','Personal','100g',35.00,'PER-SOAP-100-9222','8901098765434','https://images.unsplash.com/photo-1607006314644-8e14674db8a3?auto=format&fit=crop&w=400&q=80','2026-08-19 08:41:44',7,'active'),(28,'Toothpaste','Personal','150g',85.00,'PER-TOOT-150-8077','8901098765435','https://images.unsplash.com/photo-1559591937-e1032b4b4550?auto=format&fit=crop&w=400&q=80','2026-08-19 08:41:44',7,'active'),(29,'Body Lotion','Personal','300ml',210.00,'PER-BODY-300-2441',NULL,'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80','2026-08-19 08:41:44',7,'active'),(30,'Face Wash','Personal','100ml',145.00,'PER-FACE-100-1426','8901098765437','https://images.unsplash.com/photo-1556228722-d0b5d03632ab?auto=format&fit=crop&w=400&q=80','2026-08-19 08:41:44',7,'active'),(31,'Mysore sandalwood','Personal','250g',60.00,'PER-MYSO-250-6717',NULL,NULL,'2026-08-19 09:15:46',7,'active'),(32,'Kitkat','Condiments','250g',150.00,'CON-KITK-250-5088',NULL,NULL,'2026-08-26 11:14:20',3,'active');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;

--

-- Table structure for table `inventory`
--

DROP TABLE IF EXISTS `inventory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '0',
  `reorder_level` int NOT NULL DEFAULT '10',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `product_id` (`product_id`),
  KEY `idx_inventory_product` (`product_id`),
  KEY `idx_inventory_qty` (`quantity`,`reorder_level`),
  CONSTRAINT `inventory_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory`
--

/*!40000 ALTER TABLE `inventory` DISABLE KEYS */;
INSERT INTO `inventory` VALUES (1,1,120,20,'2026-08-19 08:41:44'),(2,2,80,25,'2026-08-19 08:41:44'),(3,3,118,15,'2026-08-26 11:35:30'),(4,4,53,10,'2026-08-26 11:41:09'),(5,5,35,20,'2026-08-19 08:41:44'),(6,6,80,15,'2026-08-26 10:00:27'),(7,7,40,10,'2026-08-19 08:41:44'),(8,8,25,20,'2026-08-19 08:41:44'),(9,9,112,15,'2026-08-26 11:51:09'),(10,10,55,10,'2026-08-19 08:41:44'),(11,11,80,20,'2026-08-26 11:20:57'),(12,12,65,15,'2026-08-26 12:47:56'),(13,13,18,20,'2026-08-26 11:12:21'),(14,14,8,10,'2026-08-19 08:41:44'),(15,15,50,15,'2026-08-19 08:41:44'),(16,16,180,30,'2026-08-31 11:02:43'),(17,17,15,20,'2026-08-19 08:41:44'),(18,18,40,10,'2026-08-19 08:41:44'),(19,19,22,15,'2026-08-19 08:41:44'),(20,20,90,25,'2026-08-19 08:41:44'),(21,21,35,15,'2026-08-19 08:41:44'),(22,22,70,20,'2026-08-19 08:41:44'),(23,23,6,10,'2026-08-19 08:41:44'),(24,24,17,15,'2026-08-26 11:24:49'),(25,25,18,20,'2026-08-19 08:41:44'),(26,26,30,15,'2026-08-19 08:41:44'),(27,27,75,25,'2026-08-26 11:44:53'),(28,28,82,20,'2026-08-26 11:18:42'),(29,29,12,10,'2026-08-26 09:42:29'),(30,30,9,20,'2026-08-19 08:41:44'),(31,31,84,10,'2026-08-26 11:48:48'),(32,32,60,10,'2026-08-26 12:23:54');
/*!40000 ALTER TABLE `inventory` ENABLE KEYS */;

--

-- Table structure for table `purchases`
--

DROP TABLE IF EXISTS `purchases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchases` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL,
  `supplier` varchar(150) DEFAULT NULL,
  `purchase_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `supplier_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `idx_purchases_supplier` (`supplier_id`),
  KEY `idx_purchases_product` (`product_id`),
  CONSTRAINT `fk_purchases_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `purchases_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `purchases_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchases`
--

/*!40000 ALTER TABLE `purchases` DISABLE KEYS */;
INSERT INTO `purchases` VALUES (1,1,100,NULL,'2026-07-22 06:41:44',3,1),(2,2,80,NULL,'2026-07-24 05:41:44',3,1),(3,6,60,NULL,'2026-07-25 00:41:44',3,2),(4,8,50,NULL,'2026-07-26 01:41:44',5,2),(5,16,150,NULL,'2026-07-27 02:41:44',4,3),(6,21,40,NULL,'2026-07-28 04:41:44',3,3),(7,11,30,NULL,'2026-07-29 08:41:44',1,4),(8,12,45,NULL,'2026-07-30 03:41:44',4,4),(9,26,30,NULL,'2026-07-31 03:41:44',3,5),(10,27,100,NULL,'2026-08-01 02:41:44',1,5),(11,4,20,NULL,'2026-08-02 05:41:44',2,1),(12,9,30,NULL,'2026-08-03 03:41:44',5,2),(13,14,20,NULL,'2026-08-04 08:41:44',1,4),(14,17,40,NULL,'2026-08-05 06:41:44',2,3),(15,23,20,NULL,'2026-08-06 00:41:44',2,3),(16,5,35,NULL,'2026-08-07 04:41:44',2,1),(17,10,55,NULL,'2026-08-08 04:41:44',5,2),(18,7,40,NULL,'2026-08-09 00:41:44',4,2),(19,18,40,NULL,'2026-08-10 05:41:44',4,5),(20,28,42,NULL,'2026-08-11 00:41:44',5,5),(21,13,20,NULL,'2026-08-12 08:41:44',3,4),(22,20,90,NULL,'2026-08-13 08:41:44',4,3),(23,22,70,NULL,'2026-08-14 08:41:44',2,3),(24,24,25,NULL,'2026-08-15 04:41:44',5,3),(25,25,30,NULL,'2026-08-16 04:41:44',1,5),(26,29,25,NULL,'2026-08-17 08:41:44',2,5),(27,30,20,NULL,'2026-08-18 07:41:44',4,5),(28,3,30,NULL,'2026-08-18 05:41:44',4,1),(29,31,80,NULL,'2026-08-19 09:18:40',1,4),(30,6,20,NULL,'2026-08-26 10:00:27',1,5),(31,28,40,NULL,'2026-08-26 11:18:42',1,3),(32,11,50,NULL,'2026-08-26 11:20:57',1,5),(33,3,100,NULL,'2026-08-26 11:35:30',1,1),(34,4,48,NULL,'2026-08-26 11:41:09',1,1),(35,31,4,NULL,'2026-08-26 11:48:48',1,4),(36,9,100,NULL,'2026-08-26 11:51:09',1,2),(37,32,60,NULL,'2026-08-26 12:23:54',1,3),(38,12,30,NULL,'2026-08-26 12:47:56',1,3);
/*!40000 ALTER TABLE `purchases` ENABLE KEYS */;

--

-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL,
  `order_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `idx_orders_product` (`product_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,1,15,'2026-07-23 01:41:44',1),(2,2,10,'2026-07-25 01:41:44',5),(3,6,12,'2026-07-26 01:41:44',3),(4,8,8,'2026-07-27 07:41:44',1),(5,16,50,'2026-07-28 06:41:44',3),(6,21,10,'2026-07-29 04:41:44',2),(7,11,5,'2026-07-30 07:41:44',5),(8,12,8,'2026-07-31 08:41:44',4),(9,26,5,'2026-08-01 00:41:44',4),(10,27,20,'2026-08-02 06:41:44',2),(11,5,5,'2026-08-03 04:41:44',5),(12,9,6,'2026-08-04 03:41:44',4),(13,17,5,'2026-08-05 02:41:44',2),(14,23,3,'2026-08-06 08:41:44',2),(15,10,10,'2026-08-07 00:41:44',2),(16,7,8,'2026-08-08 00:41:44',2),(17,18,8,'2026-08-09 03:41:44',3),(18,28,10,'2026-08-10 08:41:44',4),(19,13,8,'2026-08-11 05:41:44',3),(20,20,20,'2026-08-12 08:41:44',1),(21,22,10,'2026-08-13 04:41:44',5),(22,24,5,'2026-08-14 05:41:44',4),(23,30,3,'2026-08-15 04:41:44',1),(24,29,3,'2026-08-16 07:41:44',3),(25,25,4,'2026-08-17 05:41:44',1),(26,3,5,'2026-08-18 00:41:44',4),(27,1,20,'2026-08-18 04:41:44',2),(28,2,15,'2026-08-19 08:41:44',4),(29,13,2,'2026-08-26 11:12:21',1),(30,12,10,'2026-08-26 11:23:03',1),(31,24,8,'2026-08-26 11:24:49',1),(32,27,25,'2026-08-26 11:44:53',1),(33,16,20,'2026-08-31 16:32:43',1);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;

--

-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `type` enum('IN','OUT') NOT NULL,
  `quantity` int NOT NULL,
  `transaction_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `reference_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  KEY `idx_transactions_date` (`transaction_date`),
  CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
INSERT INTO `transactions` VALUES (1,1,'IN',100,'2026-07-22 06:41:44',1),(2,2,'IN',80,'2026-07-24 05:41:44',2),(3,6,'IN',60,'2026-07-25 00:41:44',3),(4,8,'IN',50,'2026-07-26 01:41:44',4),(5,16,'IN',150,'2026-07-27 02:41:44',5),(6,21,'IN',40,'2026-07-28 04:41:44',6),(7,11,'IN',30,'2026-07-29 08:41:44',7),(8,12,'IN',45,'2026-07-30 03:41:44',8),(9,26,'IN',30,'2026-07-31 03:41:44',9),(10,27,'IN',100,'2026-08-01 02:41:44',10),(11,4,'IN',20,'2026-08-02 05:41:44',11),(12,9,'IN',30,'2026-08-03 03:41:44',12),(13,14,'IN',20,'2026-08-04 08:41:44',13),(14,17,'IN',40,'2026-08-05 06:41:44',14),(15,23,'IN',20,'2026-08-06 00:41:44',15),(16,5,'IN',35,'2026-08-07 04:41:44',16),(17,10,'IN',55,'2026-08-08 04:41:44',17),(18,7,'IN',40,'2026-08-09 00:41:44',18),(19,18,'IN',40,'2026-08-10 05:41:44',19),(20,28,'IN',42,'2026-08-11 00:41:44',20),(21,13,'IN',20,'2026-08-12 08:41:44',21),(22,20,'IN',90,'2026-08-13 08:41:44',22),(23,22,'IN',70,'2026-08-14 08:41:44',23),(24,24,'IN',25,'2026-08-15 04:41:44',24),(25,25,'IN',30,'2026-08-16 04:41:44',25),(26,29,'IN',25,'2026-08-17 08:41:44',26),(27,30,'IN',20,'2026-08-18 07:41:44',27),(28,3,'IN',30,'2026-08-18 05:41:44',28),(29,1,'OUT',15,'2026-07-23 01:41:44',1),(30,2,'OUT',10,'2026-07-25 01:41:44',2),(31,6,'OUT',12,'2026-07-26 01:41:44',3),(32,8,'OUT',8,'2026-07-27 07:41:44',4),(33,16,'OUT',50,'2026-07-28 06:41:44',5),(34,21,'OUT',10,'2026-07-29 04:41:44',6),(35,11,'OUT',5,'2026-07-30 07:41:44',7),(36,12,'OUT',8,'2026-07-31 08:41:44',8),(37,26,'OUT',5,'2026-08-01 00:41:44',9),(38,27,'OUT',20,'2026-08-02 06:41:44',10),(39,5,'OUT',5,'2026-08-03 04:41:44',11),(40,9,'OUT',6,'2026-08-04 03:41:44',12),(41,17,'OUT',5,'2026-08-05 02:41:44',13),(42,23,'OUT',3,'2026-08-06 08:41:44',14),(43,10,'OUT',10,'2026-08-07 00:41:44',15),(44,7,'OUT',8,'2026-08-08 00:41:44',16),(45,18,'OUT',8,'2026-08-09 03:41:44',17),(46,28,'OUT',10,'2026-08-10 08:41:44',18),(47,13,'OUT',8,'2026-08-11 05:41:44',19),(48,20,'OUT',20,'2026-08-12 08:41:44',20),(49,22,'OUT',10,'2026-08-13 04:41:44',21),(50,24,'OUT',5,'2026-08-14 05:41:44',22),(51,30,'OUT',3,'2026-08-15 04:41:44',23),(52,29,'OUT',3,'2026-08-16 07:41:44',24),(53,25,'OUT',4,'2026-08-17 05:41:44',25),(54,3,'OUT',5,'2026-08-18 00:41:44',26),(55,1,'OUT',20,'2026-08-18 04:41:44',27),(56,2,'OUT',15,'2026-08-19 08:41:44',28),(57,31,'IN',80,'2026-08-19 09:18:40',29),(58,6,'IN',20,'2026-08-26 10:00:27',30),(59,13,'OUT',2,'2026-08-26 11:12:21',29),(60,28,'IN',40,'2026-08-26 11:18:42',31),(61,11,'IN',50,'2026-08-26 11:20:57',32),(62,12,'OUT',10,'2026-08-26 11:23:03',30),(63,24,'OUT',8,'2026-08-26 11:24:49',31),(64,3,'IN',100,'2026-08-26 11:35:30',33),(65,4,'IN',48,'2026-08-26 11:41:09',34),(66,27,'OUT',25,'2026-08-26 11:44:53',32),(67,31,'IN',4,'2026-08-26 11:48:48',35),(68,9,'IN',100,'2026-08-26 11:51:09',36),(69,32,'IN',60,'2026-08-26 12:23:54',37),(70,12,'IN',30,'2026-08-26 12:47:56',38),(71,16,'OUT',20,'2026-08-31 16:32:44',33);
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;

--

-- Table structure for table `supplier_issues`
--

DROP TABLE IF EXISTS `supplier_issues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supplier_issues` (
  `id` int NOT NULL AUTO_INCREMENT,
  `issue_number` varchar(50) NOT NULL,
  `supplier_id` int NOT NULL,
  `purchase_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL,
  `issue_type` varchar(50) NOT NULL,
  `reason` varchar(100) NOT NULL,
  `status` enum('Reported','Under Review','Approved','Return Requested','Returned','Replacement Requested','Replacement Received','Resolved','Rejected') NOT NULL DEFAULT 'Reported',
  `resolution` varchar(50) DEFAULT NULL,
  `notes` text,
  `deduct_inventory` tinyint(1) DEFAULT '1',
  `inventory_deducted` tinyint(1) DEFAULT '0',
  `issue_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `resolved_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `issue_number` (`issue_number`),
  KEY `created_by` (`created_by`),
  KEY `resolved_by` (`resolved_by`),
  KEY `idx_issue_supplier` (`supplier_id`),
  KEY `idx_issue_purchase` (`purchase_id`),
  KEY `idx_issue_product` (`product_id`),
  KEY `idx_issue_status` (`status`),
  KEY `idx_issue_type` (`issue_type`),
  KEY `idx_issue_number` (`issue_number`),
  KEY `idx_issue_date` (`issue_date`),
  KEY `idx_issues_supplier` (`supplier_id`),
  KEY `idx_issues_purchase` (`purchase_id`),
  CONSTRAINT `supplier_issues_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `supplier_issues_ibfk_2` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`) ON DELETE CASCADE,
  CONSTRAINT `supplier_issues_ibfk_3` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `supplier_issues_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `supplier_issues_ibfk_5` FOREIGN KEY (`resolved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supplier_issues`
--

/*!40000 ALTER TABLE `supplier_issues` DISABLE KEYS */;
INSERT INTO `supplier_issues` VALUES (1,'ISS-2026-0001',1,1,1,5,'Damaged','Leakage','Under Review',NULL,'5 packets were found leaking upon supplier delivery',1,0,'2026-08-19 13:37:49',1,NULL,'2026-08-19 13:37:49','2026-08-19 13:37:49'),(2,'ISS-2026-0002',1,2,2,3,'Defective','Packaging Damage','Approved','Replacement','Packaging was torn during handling by supplier transit',1,0,'2026-08-19 13:37:49',1,NULL,'2026-08-19 13:37:49','2026-08-19 13:37:49'),(3,'ISS-2026-0003',2,3,6,2,'Wrong Product','Incorrect Variant','Resolved','Return to Supplier','Received different variant than invoiced purchase order',1,0,'2026-08-19 13:37:49',1,NULL,'2026-08-19 13:37:49','2026-08-19 13:37:49');
/*!40000 ALTER TABLE `supplier_issues` ENABLE KEYS */;

--

-- Table structure for table `product_logs`
--

DROP TABLE IF EXISTS `product_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `action_type` enum('PURCHASE','ORDER','CREATE','UPDATE','ARCHIVE','RESTORE','REORDER_UPDATE') NOT NULL,
  `quantity` int DEFAULT NULL,
  `previous_stock` int DEFAULT NULL,
  `new_stock` int DEFAULT NULL,
  `details` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_product_logs_prod` (`product_id`),
  KEY `idx_product_logs_user` (`user_id`),
  KEY `idx_product_logs_action` (`action_type`),
  KEY `idx_product_logs_date` (`created_at`),
  CONSTRAINT `product_logs_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  CONSTRAINT `product_logs_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=75 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_logs`
--

/*!40000 ALTER TABLE `product_logs` DISABLE KEYS */;
INSERT INTO `product_logs` VALUES (1,1,3,'PURCHASE',100,NULL,NULL,'Purchased 100 units from FreshDairy Co.','2026-07-22 06:41:44'),(2,2,3,'PURCHASE',80,NULL,NULL,'Purchased 80 units from FreshDairy Co.','2026-07-24 05:41:44'),(3,6,3,'PURCHASE',60,NULL,NULL,'Purchased 60 units from GrainMart Ltd.','2026-07-25 00:41:44'),(4,8,5,'PURCHASE',50,NULL,NULL,'Purchased 50 units from GrainMart Ltd.','2026-07-26 01:41:44'),(5,16,4,'PURCHASE',150,NULL,NULL,'Purchased 150 units from QuickSupply Inc.','2026-07-27 02:41:44'),(6,21,3,'PURCHASE',40,NULL,NULL,'Purchased 40 units from QuickSupply Inc.','2026-07-28 04:41:44'),(7,11,1,'PURCHASE',30,NULL,NULL,'Purchased 30 units from NaturalBrands','2026-07-29 08:41:44'),(8,12,4,'PURCHASE',45,NULL,NULL,'Purchased 45 units from NaturalBrands','2026-07-30 03:41:44'),(9,26,3,'PURCHASE',30,NULL,NULL,'Purchased 30 units from MegaWholesale','2026-07-31 03:41:44'),(10,27,1,'PURCHASE',100,NULL,NULL,'Purchased 100 units from MegaWholesale','2026-08-01 02:41:44'),(11,4,2,'PURCHASE',20,NULL,NULL,'Purchased 20 units from FreshDairy Co.','2026-08-02 05:41:44'),(12,9,5,'PURCHASE',30,NULL,NULL,'Purchased 30 units from GrainMart Ltd.','2026-08-03 03:41:44'),(13,14,1,'PURCHASE',20,NULL,NULL,'Purchased 20 units from NaturalBrands','2026-08-04 08:41:44'),(14,17,2,'PURCHASE',40,NULL,NULL,'Purchased 40 units from QuickSupply Inc.','2026-08-05 06:41:44'),(15,23,2,'PURCHASE',20,NULL,NULL,'Purchased 20 units from QuickSupply Inc.','2026-08-06 00:41:44'),(16,5,2,'PURCHASE',35,NULL,NULL,'Purchased 35 units from FreshDairy Co.','2026-08-07 04:41:44'),(17,10,5,'PURCHASE',55,NULL,NULL,'Purchased 55 units from GrainMart Ltd.','2026-08-08 04:41:44'),(18,7,4,'PURCHASE',40,NULL,NULL,'Purchased 40 units from GrainMart Ltd.','2026-08-09 00:41:44'),(19,18,4,'PURCHASE',40,NULL,NULL,'Purchased 40 units from MegaWholesale','2026-08-10 05:41:44'),(20,28,5,'PURCHASE',42,NULL,NULL,'Purchased 42 units from MegaWholesale','2026-08-11 00:41:44'),(21,13,3,'PURCHASE',20,NULL,NULL,'Purchased 20 units from NaturalBrands','2026-08-12 08:41:44'),(22,20,4,'PURCHASE',90,NULL,NULL,'Purchased 90 units from QuickSupply Inc.','2026-08-13 08:41:44'),(23,22,2,'PURCHASE',70,NULL,NULL,'Purchased 70 units from QuickSupply Inc.','2026-08-14 08:41:44'),(24,24,5,'PURCHASE',25,NULL,NULL,'Purchased 25 units from QuickSupply Inc.','2026-08-15 04:41:44'),(25,25,1,'PURCHASE',30,NULL,NULL,'Purchased 30 units from MegaWholesale','2026-08-16 04:41:44'),(26,29,2,'PURCHASE',25,NULL,NULL,'Purchased 25 units from MegaWholesale','2026-08-17 08:41:44'),(27,30,4,'PURCHASE',20,NULL,NULL,'Purchased 20 units from MegaWholesale','2026-08-18 07:41:44'),(28,3,4,'PURCHASE',30,NULL,NULL,'Purchased 30 units from FreshDairy Co.','2026-08-18 05:41:44'),(29,31,1,'PURCHASE',80,NULL,NULL,'Purchased 80 units from NaturalBrands','2026-08-19 09:18:40'),(32,1,1,'ORDER',15,NULL,NULL,'Placed order for 15 units','2026-07-23 01:41:44'),(33,2,5,'ORDER',10,NULL,NULL,'Placed order for 10 units','2026-07-25 01:41:44'),(34,6,3,'ORDER',12,NULL,NULL,'Placed order for 12 units','2026-07-26 01:41:44'),(35,8,1,'ORDER',8,NULL,NULL,'Placed order for 8 units','2026-07-27 07:41:44'),(36,16,3,'ORDER',50,NULL,NULL,'Placed order for 50 units','2026-07-28 06:41:44'),(37,21,2,'ORDER',10,NULL,NULL,'Placed order for 10 units','2026-07-29 04:41:44'),(38,11,5,'ORDER',5,NULL,NULL,'Placed order for 5 units','2026-07-30 07:41:44'),(39,12,4,'ORDER',8,NULL,NULL,'Placed order for 8 units','2026-07-31 08:41:44'),(40,26,4,'ORDER',5,NULL,NULL,'Placed order for 5 units','2026-08-01 00:41:44'),(41,27,2,'ORDER',20,NULL,NULL,'Placed order for 20 units','2026-08-02 06:41:44'),(42,5,5,'ORDER',5,NULL,NULL,'Placed order for 5 units','2026-08-03 04:41:44'),(43,9,4,'ORDER',6,NULL,NULL,'Placed order for 6 units','2026-08-04 03:41:44'),(44,17,2,'ORDER',5,NULL,NULL,'Placed order for 5 units','2026-08-05 02:41:44'),(45,23,2,'ORDER',3,NULL,NULL,'Placed order for 3 units','2026-08-06 08:41:44'),(46,10,2,'ORDER',10,NULL,NULL,'Placed order for 10 units','2026-08-07 00:41:44'),(47,7,2,'ORDER',8,NULL,NULL,'Placed order for 8 units','2026-08-08 00:41:44'),(48,18,3,'ORDER',8,NULL,NULL,'Placed order for 8 units','2026-08-09 03:41:44'),(49,28,4,'ORDER',10,NULL,NULL,'Placed order for 10 units','2026-08-10 08:41:44'),(50,13,3,'ORDER',8,NULL,NULL,'Placed order for 8 units','2026-08-11 05:41:44'),(51,20,1,'ORDER',20,NULL,NULL,'Placed order for 20 units','2026-08-12 08:41:44'),(52,22,5,'ORDER',10,NULL,NULL,'Placed order for 10 units','2026-08-13 04:41:44'),(53,24,4,'ORDER',5,NULL,NULL,'Placed order for 5 units','2026-08-14 05:41:44'),(54,30,1,'ORDER',3,NULL,NULL,'Placed order for 3 units','2026-08-15 04:41:44'),(55,29,3,'ORDER',3,NULL,NULL,'Placed order for 3 units','2026-08-16 07:41:44'),(56,25,1,'ORDER',4,NULL,NULL,'Placed order for 4 units','2026-08-17 05:41:44'),(57,3,4,'ORDER',5,NULL,NULL,'Placed order for 5 units','2026-08-18 00:41:44'),(58,1,2,'ORDER',20,NULL,NULL,'Placed order for 20 units','2026-08-18 04:41:44'),(59,2,4,'ORDER',15,NULL,NULL,'Placed order for 15 units','2026-08-19 08:41:44'),(60,6,1,'PURCHASE',20,60,80,'Stock IN (Purchase): +20 units from MegaWholesale (Invoice PUR-0030)','2026-08-26 10:00:27'),(61,13,1,'ORDER',2,20,18,'Stock OUT (Order): -2 units (Order ORD-0029)','2026-08-26 11:12:21'),(62,32,1,'CREATE',0,0,0,'Product created: \'Kitkat\' (250g) at ₹150.00, SKU CON-KITK-250-5088','2026-08-26 11:14:20'),(63,28,1,'PURCHASE',40,42,82,'Stock IN (Purchase): +40 units from QuickSupply Inc. (Invoice PUR-0031)','2026-08-26 11:18:42'),(64,11,1,'PURCHASE',50,30,80,'Stock IN (Purchase): +50 units from MegaWholesale (Invoice PUR-0032)','2026-08-26 11:20:57'),(65,12,1,'ORDER',10,45,35,'Stock OUT (Order): -10 units (Order ORD-0030)','2026-08-26 11:23:03'),(66,24,1,'ORDER',8,25,17,'Stock OUT (Order): -8 units (Order ORD-0031)','2026-08-26 11:24:49'),(67,3,1,'PURCHASE',100,18,118,'Stock IN (Purchase): +100 units from FreshDairy Co. (Invoice PUR-0033)','2026-08-26 11:35:30'),(68,4,1,'PURCHASE',48,5,53,'Stock IN (Purchase): +48 units from FreshDairy Co. (Invoice PUR-0034)','2026-08-26 11:41:09'),(69,27,1,'ORDER',25,100,75,'Stock OUT (Order): -25 units (Order ORD-0032)','2026-08-26 11:44:53'),(70,31,1,'PURCHASE',4,80,84,'Stock IN (Purchase): +4 units from NaturalBrands (Invoice PUR-0035)','2026-08-26 11:48:48'),(71,9,1,'PURCHASE',100,12,112,'Stock IN (Purchase): +100 units from GrainMart Ltd. (Invoice PUR-0036)','2026-08-26 11:51:09'),(72,32,1,'PURCHASE',60,0,60,'Stock IN (Purchase): +60 units from QuickSupply Inc. (Invoice PUR-0037)','2026-08-26 12:23:54'),(73,12,1,'PURCHASE',30,35,65,'Stock IN (Purchase): +30 units from QuickSupply Inc. (Invoice PUR-0038)','2026-08-26 12:47:56'),(74,16,1,'ORDER',20,200,180,'Stock OUT (Order): -20 units (Order ORD-0033)','2026-08-31 16:32:44');
/*!40000 ALTER TABLE `product_logs` ENABLE KEYS */;

--

-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_settings` (
  `setting_key` varchar(50) NOT NULL,
  `setting_value` text,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_settings`
--

/*!40000 ALTER TABLE `system_settings` DISABLE KEYS */;
INSERT INTO `system_settings` VALUES ('timezone','Asia/Kolkata','2026-08-31 11:05:07');
/*!40000 ALTER TABLE `system_settings` ENABLE KEYS */;

--


SET FOREIGN_KEY_CHECKS = 1;
SET UNIQUE_CHECKS = 1;

-- Ensure read-only viewer user exists
INSERT INTO users (name, email, password, role, avatar_url)
VALUES ('imsuser', 'imsuser@ims.com', '$2b$10$uTObtnXK52.5xF0NEwDxIuBuuO6ywPyluCVOJHAmsR7IonazPdFWK', 'viewer', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80')
ON DUPLICATE KEY UPDATE name=VALUES(name);

SHOW TABLES;

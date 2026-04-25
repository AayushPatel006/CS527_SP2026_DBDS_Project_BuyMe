-- MySQL dump 10.13  Distrib 9.6.0, for macos26.3 (arm64)
--
-- Host: localhost    Database: buyme
-- ------------------------------------------------------
-- Server version	9.6.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `alerts`
--

DROP TABLE IF EXISTS `alerts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alerts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `category_id` int DEFAULT NULL,
  `keyword` varchar(255) DEFAULT NULL,
  `max_price` decimal(12,2) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_alerts_category` (`category_id`),
  KEY `idx_alerts_user` (`user_id`,`is_active`),
  CONSTRAINT `fk_alerts_category` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_alerts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alerts`
--

LOCK TABLES `alerts` WRITE;
/*!40000 ALTER TABLE `alerts` DISABLE KEYS */;
/*!40000 ALTER TABLE `alerts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auction_result`
--

DROP TABLE IF EXISTS `auction_result`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auction_result` (
  `id` int NOT NULL AUTO_INCREMENT,
  `item_id` int NOT NULL,
  `winner_id` int DEFAULT NULL,
  `final_price` decimal(12,2) NOT NULL,
  `resolved_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `item_id` (`item_id`),
  KEY `fk_result_winner` (`winner_id`),
  CONSTRAINT `fk_result_item` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_result_winner` FOREIGN KEY (`winner_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auction_result`
--

LOCK TABLES `auction_result` WRITE;
/*!40000 ALTER TABLE `auction_result` DISABLE KEYS */;
/*!40000 ALTER TABLE `auction_result` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bids`
--

DROP TABLE IF EXISTS `bids`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bids` (
  `id` int NOT NULL AUTO_INCREMENT,
  `item_id` int NOT NULL,
  `bidder_id` int NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `auto_bid_limit` decimal(12,2) DEFAULT NULL,
  `is_auto` tinyint(1) NOT NULL DEFAULT '0',
  `placed_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `removed_by` int DEFAULT NULL,
  `removed_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_bids_removedby` (`removed_by`),
  KEY `idx_bids_item` (`item_id`),
  KEY `idx_bids_bidder` (`bidder_id`),
  KEY `idx_bids_placed` (`placed_at`),
  CONSTRAINT `fk_bids_bidder` FOREIGN KEY (`bidder_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_bids_item` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_bids_removedby` FOREIGN KEY (`removed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bids`
--

LOCK TABLES `bids` WRITE;
/*!40000 ALTER TABLE `bids` DISABLE KEYS */;
INSERT INTO `bids` VALUES (1,1,3,15500.00,NULL,0,'2026-04-23 14:08:03',NULL,NULL),(2,1,5,16000.00,NULL,0,'2026-04-23 14:08:03',NULL,NULL),(3,1,3,17000.00,NULL,1,'2026-04-23 14:08:03',NULL,NULL),(4,6,7,28500.00,NULL,0,'2026-04-23 14:08:03',NULL,NULL),(5,6,8,29500.00,NULL,0,'2026-04-23 14:08:03',NULL,NULL),(6,11,3,90000.00,NULL,0,'2026-04-23 14:08:03',NULL,NULL),(7,21,3,17100.00,20000.00,0,'2026-04-23 22:01:35',NULL,NULL),(8,21,3,17300.00,NULL,0,'2026-04-24 00:02:49',NULL,NULL),(9,21,3,17500.00,20000.00,1,'2026-04-24 00:05:36',NULL,NULL),(10,31,3,18800.00,NULL,0,'2026-04-24 01:00:53',NULL,NULL),(11,31,3,19050.00,NULL,0,'2026-04-24 01:02:21',NULL,NULL),(12,21,3,17700.00,NULL,0,'2026-04-24 01:16:13',NULL,NULL),(13,34,17,2200.00,2600.00,1,'2026-04-24 02:41:28',NULL,NULL),(14,35,17,32000.00,NULL,0,'2026-04-24 02:48:16',NULL,NULL),(15,35,3,36000.00,NULL,0,'2026-04-24 02:49:03',NULL,NULL),(16,16,17,48500.00,NULL,0,'2026-04-24 21:23:00',NULL,NULL),(17,16,3,49000.00,53000.00,1,'2026-04-24 21:24:04',NULL,NULL),(18,34,17,2400.00,NULL,0,'2026-04-24 23:55:18',NULL,NULL),(19,34,17,2600.00,3000.00,1,'2026-04-24 23:56:42',NULL,NULL);
/*!40000 ALTER TABLE `bids` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `parent_id` int DEFAULT NULL,
  `level` enum('root','sub','leaf') NOT NULL DEFAULT 'root',
  PRIMARY KEY (`id`),
  KEY `idx_category_parent` (`parent_id`),
  CONSTRAINT `fk_category_parent` FOREIGN KEY (`parent_id`) REFERENCES `category` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES (1,'Vehicles',NULL,'root'),(2,'Cars',1,'sub'),(3,'Trucks',1,'sub'),(4,'Motorcycles',1,'sub'),(5,'Sedans',2,'leaf'),(6,'SUVs',2,'leaf'),(7,'Sports Cars',2,'leaf'),(8,'Pickup Trucks',3,'leaf'),(9,'Cruisers',4,'leaf'),(10,'Sport Bikes',4,'leaf');
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category_fields`
--

DROP TABLE IF EXISTS `category_fields`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category_fields` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `field_name` varchar(100) NOT NULL,
  `field_type` enum('text','number','boolean','date') NOT NULL DEFAULT 'text',
  `is_required` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `fk_catfields_category` (`category_id`),
  CONSTRAINT `fk_catfields_category` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category_fields`
--

LOCK TABLES `category_fields` WRITE;
/*!40000 ALTER TABLE `category_fields` DISABLE KEYS */;
INSERT INTO `category_fields` VALUES (1,1,'Year','number',1),(2,1,'Make','text',1),(3,1,'Model','text',1),(4,1,'Mileage','number',1),(5,1,'Color','text',0),(6,2,'Transmission','text',1),(7,2,'Fuel Type','text',1),(8,4,'Engine Size (cc)','number',1);
/*!40000 ALTER TABLE `category_fields` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `item_field_values`
--

DROP TABLE IF EXISTS `item_field_values`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `item_field_values` (
  `id` int NOT NULL AUTO_INCREMENT,
  `item_id` int NOT NULL,
  `category_field_id` int NOT NULL,
  `value` varchar(500) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_item_field` (`item_id`,`category_field_id`),
  KEY `fk_ifv_field` (`category_field_id`),
  CONSTRAINT `fk_ifv_field` FOREIGN KEY (`category_field_id`) REFERENCES `category_fields` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ifv_item` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item_field_values`
--

LOCK TABLES `item_field_values` WRITE;
/*!40000 ALTER TABLE `item_field_values` DISABLE KEYS */;
INSERT INTO `item_field_values` VALUES (1,31,1,'2002'),(2,31,2,'Toyota'),(3,31,3,'RAV4 XLE AWD'),(4,31,4,'100000'),(5,31,5,'Silver'),(6,31,6,'Automatic'),(7,31,7,'Gasoline'),(8,34,1,'2002'),(9,34,2,'Toyota'),(10,34,3,'4Runner'),(11,34,4,'120000'),(12,34,5,'Brown'),(13,34,6,'Automatic'),(14,34,7,'Gasoline'),(15,35,1,'2001'),(16,35,2,'Toyota'),(17,35,3,'Camry'),(18,35,4,'200000'),(19,35,5,'Beige'),(20,35,6,'Automatic'),(21,35,7,'Gasoline');
/*!40000 ALTER TABLE `item_field_values` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `items`
--

DROP TABLE IF EXISTS `items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `seller_id` int NOT NULL,
  `category_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `image_url` varchar(1024) DEFAULT NULL,
  `description` text,
  `starting_price` decimal(12,2) NOT NULL,
  `reserve_price` decimal(12,2) DEFAULT NULL,
  `bid_increment` decimal(12,2) NOT NULL DEFAULT '1.00',
  `closes_at` datetime NOT NULL,
  `status` enum('active','closed','cancelled') NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_items_status_closes` (`status`,`closes_at`),
  KEY `idx_items_seller` (`seller_id`),
  KEY `idx_items_category` (`category_id`),
  CONSTRAINT `fk_items_category` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_items_seller` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `items`
--

LOCK TABLES `items` WRITE;
/*!40000 ALTER TABLE `items` DISABLE KEYS */;
INSERT INTO `items` VALUES (1,2,5,'2020 Honda Civic','https://hips.hearstapps.com/hmg-prod/images/2020-honda-civic-mmp-2-1570632333.jpg?crop=1xw:0.8438343834383438xh;center,top&resize=1200:*','Reliable sedan',15000.00,17000.00,100.00,'2026-04-28 14:08:03','active','2026-04-23 14:08:03'),(2,6,5,'2019 Toyota Corolla','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjx_04uj4q5xJZLnPt_vsF23OyeFVzuGOSkN3yzVGbwLaXUJVtWQOuPnU1ouG1-yIgdDriQF1VB2vWdevioi4omD04pmLenf7M6U8KMlLez7S9QOubRQ&s=10&ec=121643244','Fuel efficient',14000.00,16000.00,100.00,'2026-04-29 14:08:03','active','2026-04-23 14:08:03'),(3,9,5,'2021 Hyundai Elantra','https://carfax-img.vast.com/carfax/v2/-8503341033304776725/1/344x258','Modern sedan',16000.00,18000.00,100.00,'2026-04-27 14:08:03','active','2026-04-23 14:08:03'),(4,2,5,'2018 Nissan Altima','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSys9x3xr3TAMOmGz5CFfvBJfEEVUR0KIsoSVfS3lKjMM-XLUGB5s91DOtRA5ZYgeKbzXNalXeDT0bvCMO4KB3HcphD0BV-pS2EwOP9CnFRQcSscmhM&s=10&ec=121643244','Comfortable ride',13000.00,15000.00,100.00,'2026-04-30 14:08:03','active','2026-04-23 14:08:03'),(5,6,5,'2022 Kia Forte','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7X_x6CnZ_a5qFS_NR9NItRWKeNjthHDRFtg&s','Like new',17000.00,19000.00,100.00,'2026-04-26 14:08:03','active','2026-04-23 14:08:03'),(6,2,6,'2021 Toyota RAV4','https://images.cars.com/cldstatic/wp-content/uploads/toyota-rav4-prime-2021-01-angle--exterior--front--grey.jpg','Hybrid SUV',28000.00,30000.00,200.00,'2026-04-28 14:08:03','active','2026-04-23 14:08:03'),(7,9,6,'2020 Honda CR-V','https://di-uploads-pod20.dealerinspire.com/bismarckmotorcompany/uploads/2019/11/IMG_2869.jpg','Spacious SUV',26000.00,28000.00,200.00,'2026-04-29 14:08:03','active','2026-04-23 14:08:03'),(8,6,6,'2019 Ford Escape','https://www.iihs.org/cdn-cgi/image/width=636/api/ratings/model-year-images/2764/','Compact SUV',22000.00,24000.00,200.00,'2026-04-27 14:08:03','active','2026-04-23 14:08:03'),(9,2,6,'2022 Tesla Model Y','https://www.iihs.org/cdn-cgi/image/width=636/api/ratings/model-year-images/3302/','Electric SUV',45000.00,48000.00,500.00,'2026-04-30 14:08:03','active','2026-04-23 14:08:03'),(10,9,6,'2021 BMW X5','https://npr.brightspotcdn.com/c1/77/b3d17c1546b4a79654a9d6332b5f/bmw1.jpg','Luxury SUV',50000.00,55000.00,500.00,'2026-04-26 14:08:03','active','2026-04-23 14:08:03'),(11,2,7,'2022 Porsche 911','https://hips.hearstapps.com/hmg-prod/images/2022-porche-911-gts-47-1632250920.jpg?crop=0.843xw:0.712xh;0.159xw,0.185xh&resize=2048:*','Sports car',85000.00,95000.00,500.00,'2026-04-26 14:08:03','active','2026-04-23 14:08:03'),(12,6,7,'2021 Corvette C8','https://www.corvsport.com/wp-content/uploads/2021/09/2021-chevrolet-corvette-c8-3.jpg','American muscle',70000.00,75000.00,500.00,'2026-04-28 14:08:03','active','2026-04-23 14:08:03'),(13,9,7,'2020 Audi R8','https://www.cnet.com/a/img/resize/dc0eba421ebed7f4525e8a4167d41269470ac729/hub/2020/09/03/720fe8d8-f827-462c-be9d-d52df3e8b7f8/ogi1-2020-audi-r8-spyder-001.jpg?auto=webp&fit=crop&height=675&width=1200','Luxury performance',120000.00,130000.00,1000.00,'2026-04-29 14:08:03','active','2026-04-23 14:08:03'),(14,2,7,'2019 Nissan GT-R','https://hips.hearstapps.com/hmg-prod/images/2018-nissan-gt-r-track-103-1558454485.jpg','Supercar',90000.00,100000.00,500.00,'2026-04-27 14:08:03','active','2026-04-23 14:08:03'),(15,6,7,'2022 BMW M4','https://www.actonautoboutique.com/imagetag/2295/main/l/Used-2022-BMW-M4-Competition-xDrive-1691623151.jpg','Sport coupe',65000.00,70000.00,500.00,'2026-04-30 14:08:03','active','2026-04-23 14:08:03'),(16,2,8,'2023 Ford F-150','https://pictures.dealer.com/f/franklinsspringcreekfordfd/1176/1fafaed213a6ce9c7da49519559c58b9x.jpg','Pickup truck',48000.00,52000.00,500.00,'2026-04-25 14:08:03','active','2026-04-23 14:08:03'),(17,6,8,'2022 RAM 1500','https://carfax-img.vast.com/carfax/v2/-5935703382347073251/1/344x258','Powerful truck',46000.00,50000.00,500.00,'2026-04-28 14:08:03','active','2026-04-23 14:08:03'),(18,9,8,'2021 Chevy Silverado','https://www.kbb.com/wp-content/uploads/2021/09/2021-chevrolet-silverado-high-country-front-3qtr.jpg','Durable truck',44000.00,48000.00,500.00,'2026-04-29 14:08:03','active','2026-04-23 14:08:03'),(19,2,8,'2020 Toyota Tacoma','https://di-uploads-pod20.dealerinspire.com/rickhendricktoyotaofsandysprings/uploads/2020/04/mlp-img-ext-2020-tacoma.jpg','Reliable truck',38000.00,42000.00,300.00,'2026-04-27 14:08:03','active','2026-04-23 14:08:03'),(20,6,8,'2019 Ford Ranger','https://www.cnet.com/a/img/resize/9e09151972c0f220922cbd7215fb968734ab0d2c/hub/2019/01/29/7da558f0-e138-4d5b-add0-06880ea3fbdc/2019-ford-ranger-34.jpg?auto=webp&fit=crop&height=675&precrop=3000,1795,x0,y205&width=1200','Mid-size truck',35000.00,38000.00,300.00,'2026-04-30 14:08:03','active','2026-04-23 14:08:03'),(21,2,9,'2019 Harley Road King','https://cdpcdn.dx1app.com/products-private/prod/7cd7a7c2-a9b5-467a-86a3-758035617a0a/d52f1093-7766-4451-ad5d-adf80161a553/00000000-0000-0000-0000-000000000000/7995bcbc-b6fc-4dfd-85a3-a944003be0e9/994498b5-c0cc-4743-9a67-b41f0159e291/6000000001_480px.jpg','Cruiser bike',15000.00,17000.00,200.00,'2026-04-25 14:08:03','active','2026-04-23 14:08:03'),(22,6,9,'2020 Indian Chief','https://m.cdn.autotraderspecialty.com/2022-Indian-Chief-motorcycle--Motorcycle-201918368-a8a0dc57aa9885a60e1a34a9cc080509.jpg?w=338','Classic cruiser',16000.00,18000.00,200.00,'2026-04-28 14:08:03','active','2026-04-23 14:08:03'),(23,9,9,'2021 Yamaha V-Star','https://storage.googleapis.com/mhimg/p/4137/12784137/db07_s.jpg','Smooth ride',9000.00,11000.00,100.00,'2026-04-29 14:08:03','active','2026-04-23 14:08:03'),(24,2,9,'2018 Suzuki Boulevard','https://cdpcdn.dx1app.com/products-private/prod/01268297-d516-4f7d-aa33-673e878f16ab/5d284675-0de2-4dab-8d85-e9ef35b25c0f/00000000-0000-0000-0000-000000000000/12972964-8ba9-4afa-a6d7-a820012108ba/b0127a34-8db0-4212-ab2c-b00600fc5a20/6000000033.jpg','Affordable cruiser',8000.00,10000.00,100.00,'2026-04-27 14:08:03','active','2026-04-23 14:08:03'),(25,6,9,'2022 Honda Rebel','https://cdpcdn.dx1app.com/products-private/prod/7cdc78f0-e39e-4874-8703-972323177f8a/88aa7185-b350-4e51-acb6-833d180dbcfe/00000000-0000-0000-0000-000000000000/81ea94dd-0030-46f5-92cf-ade30044b269/823fea8e-54c1-484a-8617-b41b00fff2b8/6000000001_480px.jpg','Modern cruiser',9500.00,11500.00,100.00,'2026-04-30 14:08:03','active','2026-04-23 14:08:03'),(26,2,10,'2021 Kawasaki Ninja','https://cdn05.carsforsale.com/00ed06dd80bfd91b7a12082bb0b840099c/480x360/2021-kawasaki-ninja-zx-6r.jpg','Sport bike',8500.00,9500.00,100.00,'2026-04-27 14:08:03','active','2026-04-23 14:08:03'),(27,6,10,'2020 Yamaha R6','https://cdn.carbase.com/dealer/motorado/5771294_182652889_640.jpg','Track bike',12000.00,14000.00,200.00,'2026-04-28 14:08:03','active','2026-04-23 14:08:03'),(28,9,10,'2022 Ducati Panigale','https://www.sanfranciscosportscars.com/imagetag/1419/2/l/Used-2022-Ducati-V2-PANIGALE-BAYLISS-1675446268.jpg','Superbike',20000.00,23000.00,500.00,'2026-04-29 14:08:03','active','2026-04-23 14:08:03'),(29,2,10,'2019 Suzuki GSX-R','https://cdn.carbase.com/dealer/motorado/6265401_195352416_640.jpg','Performance bike',11000.00,13000.00,200.00,'2026-04-26 14:08:03','active','2026-04-23 14:08:03'),(30,6,10,'2021 BMW S1000RR','https://cdn.bigboytoyz.com/new-version/products/product/s1000rr-bmw-01.jpg','High-end bike',22000.00,25000.00,500.00,'2026-04-30 14:08:03','active','2026-04-23 14:08:03'),(31,2,6,'2002 Toyota RAV4 XLE AWD','https://www.edmunds.com/assets/m/for-sale/dd-jtehh20v910045292/img-1-600x400.jpg','Description:\nWell-maintained 2002 Toyota RAV4 XLE AWD in excellent condition. Single owner, no accidents, clean title. Regularly serviced with full maintenance records available. Features include backup camera, blind spot monitoring, Apple CarPlay/Android Auto, power liftgate, and keyless entry. Great fuel efficiency and perfect for daily commuting or road trips.',18500.00,21000.00,250.00,'2026-05-15 21:00:00','active','2026-04-24 00:59:39'),(34,16,6,'2002 toyota','https://carfax-img.vast.com/carfax/v2/-1350475711912069481/1/344x258','Old school',2000.00,2800.00,200.00,'2026-04-25 04:39:00','active','2026-04-24 02:39:48'),(35,16,5,'2001 Toyota camry','https://carfax-img.vast.com/carfax/v2/1213537164098533639/1/344x258','Best Old Car',30000.00,32000.00,300.00,'2026-04-24 02:53:00','active','2026-04-24 02:47:36');
/*!40000 ALTER TABLE `items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `item_id` int DEFAULT NULL,
  `type` enum('outbid','auto_limit_exceeded','auction_won','auction_closed','alert_match','question_answered') NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_notif_item` (`item_id`),
  KEY `idx_notifications_user` (`user_id`,`is_read`),
  CONSTRAINT `fk_notif_item` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,3,1,'outbid','You have been outbid on Honda Civic',0,'2026-04-23 14:08:03'),(2,5,1,'auto_limit_exceeded','Your auto bid limit exceeded',0,'2026-04-23 14:08:03'),(3,3,21,'auction_won','You won the Harley Road King',0,'2026-04-23 14:08:03'),(4,17,34,'question_answered','Your question has been answered by a representative.',0,'2026-04-24 03:16:42'),(6,17,34,'question_answered','Rep answered your question: Yes, full maintenance history is available.',1,'2026-04-24 03:23:35'),(7,17,34,'question_answered','Rep answered your question: sample answer 123',0,'2026-04-24 03:27:14'),(8,17,34,'question_answered','Rep answered your question on 2002 toyota: answer with product context',0,'2026-04-24 03:29:52'),(9,3,34,'question_answered','Rep answered your question: The condition for the car\'s interior is excellent, I am sure you will like it!',0,'2026-04-24 03:35:13'),(10,3,16,'question_answered','Rep answered your question on 2023 Ford F-150: The record for the car is great!!',0,'2026-04-24 21:25:33'),(11,17,34,'question_answered','Rep answered your question on 2002 toyota: It is 2000 lm bright.',0,'2026-04-24 23:58:21');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `questions`
--

DROP TABLE IF EXISTS `questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `item_id` int DEFAULT NULL,
  `rep_id` int DEFAULT NULL,
  `question_text` text NOT NULL,
  `answer_text` text,
  `asked_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `answered_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_questions_user` (`user_id`),
  KEY `fk_questions_item` (`item_id`),
  KEY `fk_questions_rep` (`rep_id`),
  CONSTRAINT `fk_questions_item` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_questions_rep` FOREIGN KEY (`rep_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_questions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questions`
--

LOCK TABLES `questions` WRITE;
/*!40000 ALTER TABLE `questions` DISABLE KEYS */;
INSERT INTO `questions` VALUES (1,3,1,NULL,'Has this car been in any accidents?',NULL,'2026-04-23 14:08:03',NULL),(2,5,9,4,'Is the battery still under warranty?','Yes, full warranty available.','2026-04-23 14:08:03','2026-04-23 14:08:03'),(8,3,34,4,'how clean is the car\'s interior?','The condition for the car\'s interior is excellent, I am sure you will like it!','2026-04-24 03:34:23','2026-04-24 03:35:13'),(9,3,16,20,'How is the service record of this car?','The record for the car is great!!','2026-04-24 21:24:31','2026-04-24 21:25:33'),(10,17,34,4,'how are the headlights?','It is 2000 lm bright.','2026-04-24 23:55:54','2026-04-24 23:58:21');
/*!40000 ALTER TABLE `questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('buyer','seller','rep','admin') NOT NULL DEFAULT 'buyer',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','admin@buyme.com','pbkdf2:sha256:1000000$F7pSL14EzQbBtlGR$3e78b175468e46a74882ccc75181d0310b1825639f75117ab1a35cb13978b733','admin',1,'2026-04-23 14:00:09',NULL),(2,'john_seller','john@example.com','pbkdf2:sha256:1000000$F7pSL14EzQbBtlGR$3e78b175468e46a74882ccc75181d0310b1825639f75117ab1a35cb13978b733','seller',1,'2026-04-23 14:08:03',NULL),(3,'jane_buyer','jane@example.com','pbkdf2:sha256:1000000$F7pSL14EzQbBtlGR$3e78b175468e46a74882ccc75181d0310b1825639f75117ab1a35cb13978b733','buyer',1,'2026-04-23 14:08:03',NULL),(4,'rep_mike','mike@buyme.com','pbkdf2:sha256:1000000$F7pSL14EzQbBtlGR$3e78b175468e46a74882ccc75181d0310b1825639f75117ab1a35cb13978b733','rep',1,'2026-04-23 14:08:03',NULL),(5,'alice_buyer','alice@example.com','pbkdf2:sha256:1000000$F7pSL14EzQbBtlGR$3e78b175468e46a74882ccc75181d0310b1825639f75117ab1a35cb13978b733','buyer',1,'2026-04-23 14:08:03',NULL),(6,'bob_seller','bob@example.com','pbkdf2:sha256:1000000$F7pSL14EzQbBtlGR$3e78b175468e46a74882ccc75181d0310b1825639f75117ab1a35cb13978b733','seller',1,'2026-04-23 14:08:03',NULL),(7,'charlie_buyer','charlie@example.com','pbkdf2:sha256:1000000$F7pSL14EzQbBtlGR$3e78b175468e46a74882ccc75181d0310b1825639f75117ab1a35cb13978b733','buyer',1,'2026-04-23 14:08:03',NULL),(8,'david_buyer','david@example.com','pbkdf2:sha256:1000000$F7pSL14EzQbBtlGR$3e78b175468e46a74882ccc75181d0310b1825639f75117ab1a35cb13978b733','buyer',1,'2026-04-23 14:08:03',NULL),(9,'emma_seller','emma@example.com','pbkdf2:sha256:1000000$F7pSL14EzQbBtlGR$3e78b175468e46a74882ccc75181d0310b1825639f75117ab1a35cb13978b733','seller',1,'2026-04-23 14:08:03',NULL),(10,'olivia_buyer','olivia@example.com','pbkdf2:sha256:1000000$F7pSL14EzQbBtlGR$3e78b175468e46a74882ccc75181d0310b1825639f75117ab1a35cb13978b733','buyer',1,'2026-04-23 14:08:03',NULL),(16,'demo_seller','demo.seller@gmail.com','pbkdf2:sha256:1000000$JfYPyRNhAjIxHVr0$f16440c62e99222b4b5f4ffc6267d9de8ee8f124ae0f940881ac6bc7a15acb03','seller',1,'2026-04-24 02:11:34',NULL),(17,'demo_buyer','demo.buyer@gmail.com','pbkdf2:sha256:1000000$AlcBVhWDmen4VSKH$6a6a6dbbed3b3ffda515a4459bdc20b327965d75f83f7ab185d1a7b07e61e154','buyer',1,'2026-04-24 02:14:02',NULL),(20,'demo_rep','demo.rep@gmail.com','pbkdf2:sha256:1000000$EX0jEnNCXx2PGEgL$9dc49d4119fe620035c5247bc1e0734a62eeb00c3b016a2f63a4374d8594bd64','rep',1,'2026-04-24 03:11:39',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-25  0:12:22

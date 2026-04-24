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
-- Current Database: `buyme`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `buyme` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `buyme`;

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
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bids`
--

LOCK TABLES `bids` WRITE;
/*!40000 ALTER TABLE `bids` DISABLE KEYS */;
INSERT INTO `bids` VALUES (1,1,3,15500.00,NULL,0,'2026-04-23 14:08:03',NULL,NULL),(2,1,5,16000.00,NULL,0,'2026-04-23 14:08:03',NULL,NULL),(3,1,3,17000.00,NULL,1,'2026-04-23 14:08:03',NULL,NULL),(4,6,7,28500.00,NULL,0,'2026-04-23 14:08:03',NULL,NULL),(5,6,8,29500.00,NULL,0,'2026-04-23 14:08:03',NULL,NULL),(6,11,3,90000.00,NULL,0,'2026-04-23 14:08:03',NULL,NULL),(7,21,3,17100.00,20000.00,0,'2026-04-23 22:01:35',NULL,NULL),(8,21,3,17300.00,NULL,0,'2026-04-24 00:02:49',NULL,NULL),(9,21,3,17500.00,20000.00,1,'2026-04-24 00:05:36',NULL,NULL),(10,31,3,18800.00,NULL,0,'2026-04-24 01:00:53',NULL,NULL),(11,31,3,19050.00,NULL,0,'2026-04-24 01:02:21',NULL,NULL),(12,21,3,17700.00,NULL,0,'2026-04-24 01:16:13',NULL,NULL),(13,34,17,2200.00,2600.00,1,'2026-04-24 02:41:28',NULL,NULL),(14,35,17,32000.00,NULL,0,'2026-04-24 02:48:16',NULL,NULL),(15,35,3,36000.00,NULL,0,'2026-04-24 02:49:03',NULL,NULL);
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
INSERT INTO `items` VALUES (1,2,5,'2020 Honda Civic','https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200','Reliable sedan',15000.00,17000.00,100.00,'2026-04-28 14:08:03','active','2026-04-23 14:08:03'),(2,6,5,'2019 Toyota Corolla','https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200','Fuel efficient',14000.00,16000.00,100.00,'2026-04-29 14:08:03','active','2026-04-23 14:08:03'),(3,9,5,'2021 Hyundai Elantra','https://images.unsplash.com/photo-1549924231-f129b911e442?w=1200','Modern sedan',16000.00,18000.00,100.00,'2026-04-27 14:08:03','active','2026-04-23 14:08:03'),(4,2,5,'2018 Nissan Altima','https://images.unsplash.com/photo-1542362567-b07e54358753?w=1200','Comfortable ride',13000.00,15000.00,100.00,'2026-04-30 14:08:03','active','2026-04-23 14:08:03'),(5,6,5,'2022 Kia Forte','https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=1200','Like new',17000.00,19000.00,100.00,'2026-04-26 14:08:03','active','2026-04-23 14:08:03'),(6,2,6,'2021 Toyota RAV4','https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=1200','Hybrid SUV',28000.00,30000.00,200.00,'2026-04-28 14:08:03','active','2026-04-23 14:08:03'),(7,9,6,'2020 Honda CR-V','https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=1200','Spacious SUV',26000.00,28000.00,200.00,'2026-04-29 14:08:03','active','2026-04-23 14:08:03'),(8,6,6,'2019 Ford Escape','https://images.unsplash.com/photo-1562911791-c7a97b729ec5?w=1200','Compact SUV',22000.00,24000.00,200.00,'2026-04-27 14:08:03','active','2026-04-23 14:08:03'),(9,2,6,'2022 Tesla Model Y','https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1200','Electric SUV',45000.00,48000.00,500.00,'2026-04-30 14:08:03','active','2026-04-23 14:08:03'),(10,9,6,'2021 BMW X5','https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=1200','Luxury SUV',50000.00,55000.00,500.00,'2026-04-26 14:08:03','active','2026-04-23 14:08:03'),(11,2,7,'2022 Porsche 911','https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200','Sports car',85000.00,95000.00,500.00,'2026-04-26 14:08:03','active','2026-04-23 14:08:03'),(12,6,7,'2021 Corvette C8','https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200','American muscle',70000.00,75000.00,500.00,'2026-04-28 14:08:03','active','2026-04-23 14:08:03'),(13,9,7,'2020 Audi R8','https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1200','Luxury performance',120000.00,130000.00,1000.00,'2026-04-29 14:08:03','active','2026-04-23 14:08:03'),(14,2,7,'2019 Nissan GT-R','https://images.unsplash.com/photo-1544829099-b9a0c5303bea?w=1200','Supercar',90000.00,100000.00,500.00,'2026-04-27 14:08:03','active','2026-04-23 14:08:03'),(15,6,7,'2022 BMW M4','https://images.unsplash.com/photo-1617654112368-307921291f42?w=1200','Sport coupe',65000.00,70000.00,500.00,'2026-04-30 14:08:03','active','2026-04-23 14:08:03'),(16,2,8,'2023 Ford F-150','https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1200','Pickup truck',48000.00,52000.00,500.00,'2026-04-25 14:08:03','active','2026-04-23 14:08:03'),(17,6,8,'2022 RAM 1500','https://images.unsplash.com/photo-1551830820-330a71b99659?w=1200','Powerful truck',46000.00,50000.00,500.00,'2026-04-28 14:08:03','active','2026-04-23 14:08:03'),(18,9,8,'2021 Chevy Silverado','https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1200','Durable truck',44000.00,48000.00,500.00,'2026-04-29 14:08:03','active','2026-04-23 14:08:03'),(19,2,8,'2020 Toyota Tacoma','https://images.unsplash.com/photo-1550355291-bbee04a92027?w=1200','Reliable truck',38000.00,42000.00,300.00,'2026-04-27 14:08:03','active','2026-04-23 14:08:03'),(20,6,8,'2019 Ford Ranger','https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=1200','Mid-size truck',35000.00,38000.00,300.00,'2026-04-30 14:08:03','active','2026-04-23 14:08:03'),(21,2,9,'2019 Harley Road King','https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=1200','Cruiser bike',15000.00,17000.00,200.00,'2026-04-25 14:08:03','active','2026-04-23 14:08:03'),(22,6,9,'2020 Indian Chief','https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=1200','Classic cruiser',16000.00,18000.00,200.00,'2026-04-28 14:08:03','active','2026-04-23 14:08:03'),(23,9,9,'2021 Yamaha V-Star','https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1200','Smooth ride',9000.00,11000.00,100.00,'2026-04-29 14:08:03','active','2026-04-23 14:08:03'),(24,2,9,'2018 Suzuki Boulevard','https://images.unsplash.com/photo-1517846693594-1567da72af75?w=1200','Affordable cruiser',8000.00,10000.00,100.00,'2026-04-27 14:08:03','active','2026-04-23 14:08:03'),(25,6,9,'2022 Honda Rebel','https://images.unsplash.com/photo-1520899708997-50e0c3d2d3f7?w=1200','Modern cruiser',9500.00,11500.00,100.00,'2026-04-30 14:08:03','active','2026-04-23 14:08:03'),(26,2,10,'2021 Kawasaki Ninja','https://images.unsplash.com/photo-1580310614729-ccd69652491d?w=1200','Sport bike',8500.00,9500.00,100.00,'2026-04-27 14:08:03','active','2026-04-23 14:08:03'),(27,6,10,'2020 Yamaha R6','https://images.unsplash.com/photo-1571607388263-1044f9ea01dd?w=1200','Track bike',12000.00,14000.00,200.00,'2026-04-28 14:08:03','active','2026-04-23 14:08:03'),(28,9,10,'2022 Ducati Panigale','https://images.unsplash.com/photo-1628359355624-855775b5c9c4?w=1200','Superbike',20000.00,23000.00,500.00,'2026-04-29 14:08:03','active','2026-04-23 14:08:03'),(29,2,10,'2019 Suzuki GSX-R','https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=1200','Performance bike',11000.00,13000.00,200.00,'2026-04-26 14:08:03','active','2026-04-23 14:08:03'),(30,6,10,'2021 BMW S1000RR','https://images.unsplash.com/photo-1611242320536-f12d3541249b?w=1200','High-end bike',22000.00,25000.00,500.00,'2026-04-30 14:08:03','active','2026-04-23 14:08:03'),(31,2,6,'2002 Toyota RAV4 XLE AWD','https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=1200','Description:\nWell-maintained 2002 Toyota RAV4 XLE AWD in excellent condition. Single owner, no accidents, clean title. Regularly serviced with full maintenance records available. Features include backup camera, blind spot monitoring, Apple CarPlay/Android Auto, power liftgate, and keyless entry. Great fuel efficiency and perfect for daily commuting or road trips.',18500.00,21000.00,250.00,'2026-05-15 21:00:00','active','2026-04-24 00:59:39'),(32,2,5,'API Image URL Validation Car','https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200','Validation item',1000.00,NULL,50.00,'2026-04-26 06:17:28','active','2026-04-24 02:17:27'),(33,2,5,'Homepage URL Validation Item','https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200','Validate homepage image URL from DB',1200.00,NULL,50.00,'2026-04-25 06:29:05','active','2026-04-24 02:29:05'),(34,16,6,'2002 toyota','https://file.kelleybluebookimages.com/kbb/base/house/2002/2002-Toyota-4Runner-FrontSide_TT4RNSR5024_505x375.jpg','Old school',2000.00,2800.00,200.00,'2026-04-25 04:39:00','active','2026-04-24 02:39:48'),(35,16,5,'2001 Toyota camry','https://file.kelleybluebookimages.com/kbb/base/house/2001/2001-Toyota-Camry-FrontSide_TOCAMLE015_505x375.jpg','Best Old Car',30000.00,32000.00,300.00,'2026-04-24 02:53:00','active','2026-04-24 02:47:36');
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,3,1,'outbid','You have been outbid on Honda Civic',0,'2026-04-23 14:08:03'),(2,5,1,'auto_limit_exceeded','Your auto bid limit exceeded',0,'2026-04-23 14:08:03'),(3,3,21,'auction_won','You won the Harley Road King',0,'2026-04-23 14:08:03'),(4,17,34,'question_answered','Your question has been answered by a representative.',0,'2026-04-24 03:16:42'),(6,17,34,'question_answered','Rep answered your question: Yes, full maintenance history is available.',1,'2026-04-24 03:23:35'),(7,17,34,'question_answered','Rep answered your question: sample answer 123',0,'2026-04-24 03:27:14'),(8,17,34,'question_answered','Rep answered your question on 2002 toyota: answer with product context',0,'2026-04-24 03:29:52'),(9,3,34,'question_answered','Rep answered your question: The condition for the car\'s interior is excellent, I am sure you will like it!',0,'2026-04-24 03:35:13');
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questions`
--

LOCK TABLES `questions` WRITE;
/*!40000 ALTER TABLE `questions` DISABLE KEYS */;
INSERT INTO `questions` VALUES (1,3,1,NULL,'Has this car been in any accidents?',NULL,'2026-04-23 14:08:03',NULL),(2,5,9,4,'Is the battery still under warranty?','Yes, full warranty available.','2026-04-23 14:08:03','2026-04-23 14:08:03'),(8,3,34,4,'how clean is the car\'s interior?','The condition for the car\'s interior is excellent, I am sure you will like it!','2026-04-24 03:34:23','2026-04-24 03:35:13');
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

--
-- Dumping events for database 'buyme'
--

--
-- Dumping routines for database 'buyme'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-24  3:44:08

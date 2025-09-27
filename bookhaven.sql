-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: bookhaven
-- ------------------------------------------------------
-- Server version	8.0.43

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
-- Table structure for table `cart`
--

DROP TABLE IF EXISTS `cart`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int DEFAULT '1',
  `added_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `cart_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart`
--

LOCK TABLES `cart` WRITE;
/*!40000 ALTER TABLE `cart` DISABLE KEYS */;
INSERT INTO `cart` VALUES (65,2,14,2,'2025-09-26 11:23:02'),(71,2,15,1,'2025-09-26 11:40:32');
/*!40000 ALTER TABLE `cart` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `is_active` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  CONSTRAINT `category_chk_1` CHECK ((`is_active` in (0,1)))
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES (5,'Thiếu nhi','s',1),(6,'Hài Hước','1',0),(9,'Thái Lan','1',0),(10,'xxx','1',1),(11,'ok','1',0),(12,'1','1',0),(15,'Kỹ năng sống','okok',1);
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `discounts`
--

DROP TABLE IF EXISTS `discounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `discounts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int DEFAULT NULL,
  `discount_percent` decimal(5,2) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `discounts_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `discounts`
--

LOCK TABLES `discounts` WRITE;
/*!40000 ALTER TABLE `discounts` DISABLE KEYS */;
INSERT INTO `discounts` VALUES (2,3,10.00,'2025-09-21','2025-09-30','2025-09-21 05:03:53'),(3,3,10.00,'2025-09-21','2025-09-30','2025-09-21 05:03:55');
/*!40000 ALTER TABLE `discounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orderitems`
--

DROP TABLE IF EXISTS `orderitems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orderitems` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int DEFAULT '1',
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `orderitems_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `orderitems_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=89 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orderitems`
--

LOCK TABLES `orderitems` WRITE;
/*!40000 ALTER TABLE `orderitems` DISABLE KEYS */;
INSERT INTO `orderitems` VALUES (1,8,6,3,1000000.00),(2,8,12,1,10000000.00),(3,9,6,3,1000000.00),(4,9,12,1,10000000.00),(5,10,6,3,1000000.00),(6,10,12,1,10000000.00),(7,10,11,1,1000000.00),(8,11,12,1,10000000.00),(9,11,11,1,1000000.00),(10,12,12,1,10000000.00),(11,12,11,1,1000000.00),(12,13,10,1,1000000.00),(13,13,9,1,10000000.00),(14,13,6,1,1000000.00),(15,14,12,1,10000000.00),(16,14,11,1,1000000.00),(17,15,12,1,10000000.00),(18,16,12,1,10000000.00),(19,17,12,1,10000000.00),(20,18,12,3,10000000.00),(21,19,11,3,1000000.00),(22,20,13,2,10000000.00),(23,21,13,1,10000000.00),(24,22,12,3,10000000.00),(25,22,11,1,1000000.00),(26,23,12,1,10000000.00),(27,24,12,1,10000000.00),(28,25,11,1,1000000.00),(29,26,9,1,10000000.00),(30,27,6,1,1000000.00),(31,28,11,1,1000000.00),(32,29,13,7,10000000.00),(33,30,12,2,10000000.00),(34,31,12,1,10000000.00),(35,32,13,1,10000000.00),(36,33,12,1,10000000.00),(37,34,13,1,10000000.00),(38,35,11,1,1000000.00),(39,36,13,1,10000000.00),(40,37,12,1,10000000.00),(41,38,11,1,1000000.00),(42,39,14,1,10000.00),(43,40,13,2,10000000.00),(44,41,15,4,12120000.00),(45,42,15,1,12120000.00),(46,43,15,1,12120000.00),(47,44,15,1,12120000.00),(48,45,15,1,12120000.00),(49,46,14,2,10000.00),(50,46,15,1,12120000.00),(51,47,15,1,12120000.00),(52,48,11,2,1000000.00),(53,49,11,2,1000000.00),(54,50,15,2,12120000.00),(55,51,15,2,12120000.00),(56,52,15,2,12120000.00),(57,53,15,2,12120000.00),(58,54,15,2,12120000.00),(59,55,15,2,12120000.00),(60,56,15,2,12120000.00),(61,57,15,2,12120000.00),(62,58,15,2,12120000.00),(63,59,15,2,12120000.00),(64,60,14,1,10000.00),(65,61,14,1,10000.00),(66,62,14,1,10000.00),(67,63,14,1,10000.00),(68,64,15,1,12120000.00),(69,65,15,1,12120000.00),(70,66,15,1,12120000.00),(71,67,15,1,12120000.00),(72,68,15,1,12120000.00),(73,69,15,1,12120000.00),(74,70,15,1,12120000.00),(75,71,15,1,12120000.00),(76,72,15,1,12120000.00),(77,73,15,1,12120000.00),(78,74,6,1,1000000.00),(79,75,13,1,10000000.00),(80,76,13,1,10000000.00),(81,77,15,1,12120000.00),(82,78,15,1,12120000.00),(83,79,15,1,12120000.00),(84,80,15,1,12120000.00),(85,81,15,1,12120000.00),(86,82,15,1,12120000.00),(87,83,13,1,10000000.00),(88,84,13,1,10000000.00);
/*!40000 ALTER TABLE `orderitems` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('pending','processing','shipped','completed','cancelled') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `payment_method` varchar(50) NOT NULL DEFAULT 'COD',
  `shipping_address` varchar(255) NOT NULL,
  `payment_status` varchar(10) NOT NULL DEFAULT 'unpaid',
  `payment_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `orders_chk_1` CHECK ((`payment_status` in (_utf8mb4'unpaid',_utf8mb4'paid')))
) ENGINE=InnoDB AUTO_INCREMENT=85 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (8,2,13000000.00,'processing','2025-09-23 11:35:00','cod','{\"full_name\":\"Nguyễn Văn A\",\"phone\":\"0123456789\",\"address\":\"123 Street\",\"city\":\"\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"p@g.c\"}','paid','2025-09-26 18:26:12'),(9,2,13000000.00,'cancelled','2025-09-23 12:03:22','cod','{\"full_name\":\"wwww\",\"phone\":\"0123456789\",\"address\":\"123 Street\",\"city\":\"\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"p@g.c\"}','unpaid',NULL),(10,2,14000000.00,'processing','2025-09-23 15:01:52','bank','{\"full_name\":\"wwwww\",\"phone\":\"0123456789\",\"address\":\"123 Street\",\"city\":\"\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"p@g.c\"}','unpaid',NULL),(11,2,11000000.00,'pending','2025-09-23 15:04:44','cod','{\"full_name\":\"cccccc\",\"phone\":\"0123456789\",\"address\":\"123 Street\",\"city\":\"\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"p@g.c\"}','unpaid',NULL),(12,2,11000000.00,'pending','2025-09-23 15:14:30','cod','{\"full_name\":\"xxxxxx\",\"phone\":\"0123456789\",\"address\":\"123 Street\",\"city\":\"\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"p@g.c\"}','unpaid',NULL),(13,2,12000000.00,'pending','2025-09-23 15:17:35','cod','{\"full_name\":\"Nguyễn Văn A\",\"phone\":\"0123456789\",\"address\":\"123 Street\",\"city\":\"\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"p@g.c\"}','unpaid',NULL),(14,2,11000000.00,'pending','2025-09-23 15:18:44','cod','{\"full_name\":\"fsdfsdfsdfsdf\",\"phone\":\"0123456789\",\"address\":\"123 Street\",\"city\":\"\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"p@g.c\"}','unpaid',NULL),(15,2,10000000.00,'cancelled','2025-09-23 15:28:00','cod','{\"full_name\":\"xzxzxzxz\",\"phone\":\"0123456789\",\"address\":\"123 Street\",\"city\":\"\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"p@g.c\"}','unpaid',NULL),(16,12,10000000.00,'cancelled','2025-09-24 11:53:18','cod','{\"full_name\":\"fdfsdfds\",\"phone\":\"11111111111111\",\"address\":\"1\",\"city\":\"hanoi\",\"district\":\"1\",\"ward\":\"1\",\"email\":\"n@gmail.com\"}','unpaid',NULL),(17,12,10000000.00,'cancelled','2025-09-24 12:02:38','cod','{\"full_name\":\"aâ\",\"phone\":\"12313123123\",\"address\":\"12321\",\"city\":\"\",\"district\":\"123123\",\"ward\":\"\",\"email\":\"n@gmail.com\"}','unpaid',NULL),(18,2,30000000.00,'processing','2025-09-25 07:11:06','momo','{\"full_name\":\"Nguyễn Văn A\",\"phone\":\"0123456789\",\"address\":\"123 Street 12133\",\"city\":\"\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"p@g.c\"}','unpaid',NULL),(19,12,3000000.00,'cancelled','2025-09-25 08:22:56','cod','{\"full_name\":\"s\",\"phone\":\"s\",\"address\":\"s\",\"city\":\"\",\"district\":\"s\",\"ward\":\"s\",\"email\":\"n@gmail.com\"}','unpaid',NULL),(20,12,20000000.00,'pending','2025-09-25 08:23:58','cod','{\"full_name\":\"Nguyễn Văn A\",\"phone\":\"d\",\"address\":\"d\",\"city\":\"\",\"district\":\"d\",\"ward\":\"d\",\"email\":\"n@gmail.com\"}','unpaid',NULL),(21,12,10000000.00,'shipped','2025-09-25 08:34:09','cod','{\"full_name\":\"wwww\",\"phone\":\"fdsfsdf\",\"address\":\"sdfsdf\",\"city\":\"\",\"district\":\"sdfsdf\",\"ward\":\"sdfsdf\",\"email\":\"n@gmail.com\"}','unpaid',NULL),(22,12,31000000.00,'shipped','2025-09-25 08:46:17','cod','{\"full_name\":\"d\",\"phone\":\"d\",\"address\":\"dd\",\"city\":\"\",\"district\":\"d\",\"ward\":\"d\",\"email\":\"n@gmail.com\"}','unpaid',NULL),(23,12,10000000.00,'cancelled','2025-09-25 09:35:50','cod','{\"full_name\":\"xdsasá\",\"phone\":\"áđâsd\",\"address\":\"áđâsds\",\"city\":\"\",\"district\":\"áđâs\",\"ward\":\"áđâsd\",\"email\":\"n@gmail.com\"}','unpaid',NULL),(24,12,10000000.00,'pending','2025-09-25 09:36:23','cod','{\"full_name\":\"áđasa\",\"phone\":\"áđâs\",\"address\":\"áđá\",\"city\":\"\",\"district\":\"áđasa\",\"ward\":\"áđâsd\",\"email\":\"n@gmail.com\"}','unpaid',NULL),(25,12,1000000.00,'pending','2025-09-25 09:36:53','cod','{\"full_name\":\"rtẻtwẻwẻ\",\"phone\":\"ưẻwẻwẻwẻ\",\"address\":\"ưẻwẻwẻ\",\"city\":\"\",\"district\":\"ưẻwẻwể\",\"ward\":\"ưẻwẻwểw\",\"email\":\"n@gmail.com\"}','unpaid',NULL),(26,12,10000000.00,'pending','2025-09-25 09:50:47','cod','{\"full_name\":\"ádsađasa\",\"phone\":\"ádád\",\"address\":\"áđâs\",\"city\":\"\",\"district\":\"áđâsdá\",\"ward\":\"ađâs\",\"email\":\"n@gmail.com\"}','unpaid',NULL),(27,12,1000000.00,'pending','2025-09-25 10:12:27','cod','{\"full_name\":\"rưẻwẻ\",\"phone\":\"ưẻwẻwẻ\",\"address\":\"rưểw\",\"city\":\"\",\"district\":\"ưẻwẻ\",\"ward\":\"ưẻwẻ\",\"email\":\"n@gmail.com\"}','unpaid',NULL),(28,12,1000000.00,'cancelled','2025-09-25 10:14:49','cod','{\"full_name\":\"sdfsdfsd\",\"phone\":\"fsdfsdf\",\"address\":\"sdfsdfds\",\"city\":\"\",\"district\":\"sdfsdfsd\",\"ward\":\"sdfsdfsd\",\"email\":\"n@gmail.com\"}','unpaid',NULL),(29,12,70000000.00,'cancelled','2025-09-25 10:29:28','cod','{\"full_name\":\"Phu Ng\",\"phone\":\"dsds\",\"address\":\"sdsdsd\",\"city\":\"\",\"district\":\"dsds\",\"ward\":\"sđsd\",\"email\":\"n@gmail.com\"}','unpaid',NULL),(30,12,20000000.00,'cancelled','2025-09-25 10:34:17','cod','{\"full_name\":\"Phu Ng\",\"phone\":\"đấ\",\"address\":\"ádsa\",\"city\":\"\",\"district\":\"dsadá\",\"ward\":\"đasa\",\"email\":\"n@gmail.com\"}','unpaid',NULL),(31,12,10000000.00,'cancelled','2025-09-25 10:35:28','cod','{\"full_name\":\"Phu Ng\",\"phone\":\"sadsd\",\"address\":\"ádá\",\"city\":\"\",\"district\":\"sđá\",\"ward\":\"áđá\",\"email\":\"n@gmail.com\"}','unpaid',NULL),(32,12,10000000.00,'cancelled','2025-09-25 10:37:09','cod','{\"full_name\":\"Phu Ng\",\"phone\":\"0123456789\",\"address\":\"dssdf\",\"city\":\"\",\"district\":\"123123\",\"ward\":\"Dịch Vọng\",\"email\":\"n@gmail.com\"}','unpaid',NULL),(33,12,10000000.00,'cancelled','2025-09-25 10:38:27','cod','{\"full_name\":\"Phu Ng\",\"phone\":\"0123456789\",\"address\":\"dsfsdf\",\"city\":\"hanoi\",\"district\":\"Cầu Giấy\",\"ward\":\"áđâsd\",\"email\":\"n@gmail.com\"}','unpaid',NULL),(34,12,10000000.00,'pending','2025-09-25 10:42:28','cod','{\"full_name\":\"Phu Ng\",\"phone\":\"0123456789\",\"address\":\"ewrưể\",\"city\":\"\",\"district\":\"Cầu Giấy\",\"ward\":\"Dịch Vọng\",\"email\":\"n@gmail.com\"}','unpaid',NULL),(35,12,1000000.00,'pending','2025-09-25 10:43:03','cod','{\"full_name\":\"Phu Ng\",\"phone\":\"11111111111111\",\"address\":\"sdsad\",\"city\":\"\",\"district\":\"123123\",\"ward\":\"Dịch Vọng\",\"email\":\"n@gmail.com\"}','unpaid',NULL),(36,12,10000000.00,'pending','2025-09-25 10:45:29','cod','{\"full_name\":\"Phu Ng\",\"phone\":\"sfdfsdf\",\"address\":\"sdfsdf\",\"city\":\"\",\"district\":\"sdfsdf\",\"ward\":\"sdfsdf\",\"email\":\"n@gmail.com\"}','unpaid',NULL),(37,12,10000000.00,'pending','2025-09-25 10:46:53','cod','{\"full_name\":\"Phu Ng\",\"phone\":\"0123456789\",\"address\":\"sdfsdf\",\"city\":\"\",\"district\":\"fsdfsf\",\"ward\":\"sdfsdf\",\"email\":\"n@gmail.com\"}','unpaid',NULL),(38,12,1000000.00,'pending','2025-09-25 10:47:18','cod','{\"full_name\":\"Phu Ng\",\"phone\":\"0123456789\",\"address\":\"dsfdfs\",\"city\":\"\",\"district\":\"123123\",\"ward\":\"áđâsd\",\"email\":\"n@gmail.com\"}','unpaid',NULL),(39,12,10000.00,'pending','2025-09-26 01:06:51','cod','{\"full_name\":\"Phu Ng\",\"phone\":\"sdsd\",\"address\":\"dssa\",\"city\":\"1\",\"district\":\"Ba Dinh\",\"ward\":\"sd\",\"email\":\"n@gmail.com\"}','unpaid',NULL),(40,12,20000000.00,'pending','2025-09-26 01:08:49','vnpay','{\"full_name\":\"Phu Ng\",\"phone\":\"0123456789\",\"address\":\"lk\",\"city\":\"1\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"n@gmail.com\"}','unpaid',NULL),(41,12,48480000.00,'pending','2025-09-26 02:12:58','vnpay','{\"full_name\":\"Phu Ng\",\"phone\":\"0123456789\",\"address\":\"1232\",\"city\":\"1\",\"district\":\"Cầu Giấy\",\"ward\":\"Dịch Vọng\",\"email\":\"n@gmail.com\"}','unpaid',NULL),(42,12,12120000.00,'pending','2025-09-26 04:58:39','vnpay','{\"full_name\":\"Phu Ng\",\"phone\":\"0123456789\",\"address\":\"ưqưeqư\",\"city\":\"1\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"n@gmail.com\"}','unpaid',NULL),(43,12,12120000.00,'pending','2025-09-26 06:00:02','vnpay','{\"full_name\":\"Phu Ng\",\"phone\":\"0123456789\",\"address\":\"111\",\"city\":\"1\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"n@gmail.com\"}','unpaid',NULL),(44,12,12120000.00,'pending','2025-09-26 06:00:07','vnpay','{\"full_name\":\"Phu Ng\",\"phone\":\"0123456789\",\"address\":\"111\",\"city\":\"1\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"n@gmail.com\"}','unpaid',NULL),(45,12,12120000.00,'pending','2025-09-26 06:04:36','vnpay','{\"full_name\":\"Phu Ng\",\"phone\":\"0123456789\",\"address\":\"111\",\"city\":\"1\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"n@gmail.com\"}','unpaid',NULL),(46,12,12140000.00,'pending','2025-09-26 06:06:11','vnpay','{\"full_name\":\"Phu Ng\",\"phone\":\"0123456789\",\"address\":\"22\",\"city\":\"1\",\"district\":\"\",\"ward\":\"Dien Bien\",\"email\":\"n@gmail.com\"}','unpaid',NULL),(47,2,12120000.00,'pending','2025-09-26 09:02:10','vnpay','{\"full_name\":\"Phu le23 Nguyen\",\"phone\":\"0123456789\",\"address\":\"123 Street 3\",\"city\":\"Hanoi\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"p@g.c\"}','unpaid',NULL),(48,2,2000000.00,'pending','2025-09-26 10:29:25','vnpay','{\"full_name\":\"Phu le23 Nguyen\",\"phone\":\"0123456789\",\"address\":\"123 Street 3\",\"city\":\"Hanoi\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"p@g.c\"}','unpaid',NULL),(49,2,2000000.00,'pending','2025-09-26 10:29:27','vnpay','{\"full_name\":\"Phu le23 Nguyen\",\"phone\":\"0123456789\",\"address\":\"123 Street 3\",\"city\":\"Hanoi\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"p@g.c\"}','unpaid',NULL),(50,2,24240000.00,'pending','2025-09-26 10:29:40','vnpay','{\"full_name\":\"Phu le23 Nguyen\",\"phone\":\"0123456789\",\"address\":\"123 Street 3\",\"city\":\"Hanoi\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"p@g.c\"}','unpaid',NULL),(51,2,24240000.00,'pending','2025-09-26 10:29:42','vnpay','{\"full_name\":\"Phu le23 Nguyen\",\"phone\":\"0123456789\",\"address\":\"123 Street 3\",\"city\":\"Hanoi\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"p@g.c\"}','unpaid',NULL),(52,2,24240000.00,'pending','2025-09-26 10:30:47','vnpay','{\"full_name\":\"Phu le23 Nguyen\",\"phone\":\"0123456789\",\"address\":\"123 Street 3\",\"city\":\"Hanoi\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"p@g.c\"}','unpaid',NULL),(53,2,24240000.00,'pending','2025-09-26 10:32:54','vnpay','{\"full_name\":\"Phu le23 Nguyen\",\"phone\":\"0123456789\",\"address\":\"123 Street 3\",\"city\":\"Hanoi\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"p@g.c\"}','unpaid',NULL),(54,2,24240000.00,'pending','2025-09-26 10:32:58','vnpay','{\"full_name\":\"Phu le23 Nguyen\",\"phone\":\"0123456789\",\"address\":\"123 Street 3\",\"city\":\"Hanoi\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"p@g.c\"}','unpaid',NULL),(55,2,24240000.00,'pending','2025-09-26 10:33:40','vnpay','{\"full_name\":\"Phu le23 Nguyen\",\"phone\":\"0123456789\",\"address\":\"123 Street 3\",\"city\":\"Hanoi\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"p@g.c\"}','unpaid',NULL),(56,2,24240000.00,'pending','2025-09-26 10:34:13','vnpay','{\"full_name\":\"Phu le23 Nguyen\",\"phone\":\"0123456789\",\"address\":\"123 Street 3\",\"city\":\"Hanoi\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"p@g.c\"}','unpaid',NULL),(57,2,24240000.00,'pending','2025-09-26 10:35:24','vnpay','{\"full_name\":\"Phu le23 Nguyen\",\"phone\":\"0123456789\",\"address\":\"123 Street 3\",\"city\":\"Hanoi\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"p@g.c\"}','unpaid',NULL),(58,2,24240000.00,'pending','2025-09-26 10:36:08','vnpay','{\"full_name\":\"Phu le23 Nguyen\",\"phone\":\"0123456789\",\"address\":\"123 Street 3\",\"city\":\"Hanoi\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"p@g.c\"}','unpaid',NULL),(59,2,24240000.00,'pending','2025-09-26 10:38:32','cod','{\"full_name\":\"Phu le23 Nguyen\",\"phone\":\"0123456789\",\"address\":\"123 Street 3\",\"city\":\"Hanoi\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"p@g.c\"}','unpaid',NULL),(60,2,10000.00,'pending','2025-09-26 10:38:56','vnpay','{\"full_name\":\"Phu le23 Nguyen\",\"phone\":\"0123456789\",\"address\":\"123 Street 3\",\"city\":\"Hanoi\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"p@g.c\"}','unpaid',NULL),(61,2,10000.00,'pending','2025-09-26 10:39:32','cod','{\"full_name\":\"Phu le23 Nguyen\",\"phone\":\"0123456789\",\"address\":\"123 Street 3\",\"city\":\"Hanoi\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"p@g.c\"}','unpaid',NULL),(62,2,10000.00,'pending','2025-09-26 10:39:48','vnpay','{\"full_name\":\"Phu le23 Nguyen\",\"phone\":\"0123456789\",\"address\":\"123 Street 3\",\"city\":\"Hanoi\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"p@g.c\"}','unpaid',NULL),(63,2,10000.00,'pending','2025-09-26 10:44:46','vnpay','{\"full_name\":\"Phu le23 Nguyen\",\"phone\":\"0123456789\",\"address\":\"123 Street 3\",\"city\":\"Hanoi\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"p@g.c\"}','unpaid',NULL),(64,2,12120000.00,'pending','2025-09-26 10:54:32','vnpay','{\"full_name\":\"Phu le23 Nguyen\",\"phone\":\"0123456789\",\"address\":\"123 Street 3\",\"city\":\"Hanoi\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"p@g.c\"}','unpaid',NULL),(65,2,12120000.00,'pending','2025-09-26 11:01:52','cod','{\"full_name\":\"Phu le23 Nguyen\",\"phone\":\"0123456789\",\"address\":\"123 Street 3\",\"city\":\"Hanoi\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"p@g.c\"}','unpaid',NULL),(66,2,12120000.00,'pending','2025-09-26 11:02:15','vnpay','{\"full_name\":\"Phu le23 Nguyen\",\"phone\":\"0123456789\",\"address\":\"123 Street 3\",\"city\":\"Hanoi\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"p@g.c\"}','unpaid',NULL),(67,2,12120000.00,'pending','2025-09-26 11:02:58','vnpay','{\"full_name\":\"Phu le23 Nguyen\",\"phone\":\"0123456789\",\"address\":\"123 Street 3\",\"city\":\"Hanoi\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"p@g.c\"}','unpaid',NULL),(68,2,12120000.00,'processing','2025-09-26 11:03:51','vnpay','{\"full_name\":\"Phu le23 Nguyen\",\"phone\":\"0123456789\",\"address\":\"123 Street 3\",\"city\":\"Hanoi\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"p@g.c\"}','paid','2025-09-26 18:03:51'),(69,2,12120000.00,'pending','2025-09-26 11:04:29','cod','{\"full_name\":\"Phu le23 Nguyen\",\"phone\":\"0123456789\",\"address\":\"123 Street 3\",\"city\":\"Hanoi\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"p@g.c\"}','unpaid',NULL),(70,2,12120000.00,'pending','2025-09-26 11:04:43','vnpay','{\"full_name\":\"Phu le23 Nguyen\",\"phone\":\"0123456789\",\"address\":\"123 Street 3\",\"city\":\"Hanoi\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"p@g.c\"}','unpaid',NULL),(71,2,12120000.00,'pending','2025-09-26 11:07:13','cod','{\"full_name\":\"Phu le23 Nguyen\",\"phone\":\"0123456789\",\"address\":\"123 Street 3\",\"city\":\"Hanoi\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"p@g.c\"}','unpaid',NULL),(72,2,12120000.00,'processing','2025-09-26 11:07:39','vnpay','{\"full_name\":\"Phu le23 Nguyen\",\"phone\":\"0123456789\",\"address\":\"123 Street 3\",\"city\":\"Hanoi\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"p@g.c\"}','paid','2025-09-26 18:07:39'),(73,2,12120000.00,'pending','2025-09-26 11:13:41','vnpay','{\"full_name\":\"Phu le23 Nguyen\",\"phone\":\"0123456789\",\"address\":\"123 Street 3\",\"city\":\"Hanoi\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"p@g.c\"}','unpaid',NULL),(74,2,1000000.00,'pending','2025-09-26 11:18:10','vnpay','{\"full_name\":\"Phu le23 Nguyen\",\"phone\":\"0123456789\",\"address\":\"123 Street 3\",\"city\":\"Hanoi\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"p@g.c\"}','unpaid',NULL),(75,2,10000000.00,'pending','2025-09-26 11:23:23','vnpay','{\"full_name\":\"Phu le23 Nguyen\",\"phone\":\"0123456789\",\"address\":\"123 Street 3\",\"city\":\"Hanoi\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"p@g.c\"}','unpaid',NULL),(76,2,10000000.00,'pending','2025-09-26 11:26:54','vnpay','{\"full_name\":\"Phu le23 Nguyen\",\"phone\":\"0123456789\",\"address\":\"123 Street 3\",\"city\":\"Hanoi\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"p@g.c\"}','unpaid',NULL),(77,2,12120000.00,'processing','2025-09-26 11:31:00','vnpay','{\"full_name\":\"Phu le23 Nguyen\",\"phone\":\"0123456789\",\"address\":\"123 Street 3\",\"city\":\"Hanoi\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"p@g.c\"}','paid','2025-09-26 18:35:39'),(78,2,12120000.00,'pending','2025-09-26 11:36:05','vnpay','{\"full_name\":\"Phu le23 Nguyen\",\"phone\":\"0123456789\",\"address\":\"123 Street 3\",\"city\":\"Hanoi\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"p@g.c\"}','unpaid',NULL),(79,2,12120000.00,'pending','2025-09-26 11:36:31','cod','{\"full_name\":\"Phu le23 Nguyen\",\"phone\":\"0123456789\",\"address\":\"123 Street 3\",\"city\":\"Hanoi\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"p@g.c\"}','unpaid',NULL),(80,2,12120000.00,'cancelled','2025-09-26 11:36:48','vnpay','{\"full_name\":\"Phu le23 Nguyen\",\"phone\":\"0123456789\",\"address\":\"123 Street 3\",\"city\":\"Hanoi\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"p@g.c\"}','unpaid',NULL),(81,2,12120000.00,'processing','2025-09-26 11:36:51','vnpay','{\"full_name\":\"Phu le23 Nguyen\",\"phone\":\"0123456789\",\"address\":\"123 Street 3\",\"city\":\"Hanoi\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"p@g.c\"}','paid','2025-09-26 18:44:32'),(82,2,12120000.00,'cancelled','2025-09-26 11:37:40','vnpay','{\"full_name\":\"Phu le23 Nguyen\",\"phone\":\"0123456789\",\"address\":\"123 Street 3\",\"city\":\"Hanoi\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"p@g.c\"}','paid','2025-09-26 18:38:17'),(83,2,10000000.00,'pending','2025-09-26 11:46:12','vnpay','{\"full_name\":\"Phu le23 Nguyen\",\"phone\":\"0123456789\",\"address\":\"123 Street 3\",\"city\":\"Hanoi\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"p@g.c\"}','unpaid',NULL),(84,2,10000000.00,'cancelled','2025-09-26 11:46:20','cod','{\"full_name\":\"Phu le23 Nguyen\",\"phone\":\"0123456789\",\"address\":\"123 Street 3\",\"city\":\"Hanoi\",\"district\":\"Ba Dinh\",\"ward\":\"Dien Bien\",\"email\":\"p@g.c\"}','unpaid',NULL);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `author` varchar(255) DEFAULT NULL,
  `translator` varchar(255) DEFAULT NULL,
  `publisher` varchar(255) DEFAULT NULL,
  `pages` int DEFAULT NULL,
  `dimensions` varchar(50) DEFAULT NULL,
  `weight` varchar(50) DEFAULT NULL,
  `publish_year` year DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock` int DEFAULT '0',
  `category_id` int DEFAULT NULL,
  `description` text,
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `public_id` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (3,'The Great Gatsby (Updated)','1','1','1',1,'1','1',2025,100000.00,1,NULL,'1','null','2025-09-21 03:38:44',NULL,0),(4,'ds','ss','ss','sss',1321312,'21312','12312',2025,20000.00,222,NULL,'321123','https://res.cloudinary.com/dyh0sob9j/image/upload/v1758554632/products/d55694be-83ec-432d-a07a-5c367602b884.jpg','2025-09-22 15:23:55',NULL,0),(5,'1','1','1','1',111,'111','111',2025,1110000.00,12,NULL,'111','https://res.cloudinary.com/dyh0sob9j/image/upload/v1758557670/products/96c8d822-8e63-4fc9-9966-23b73438d912.png','2025-09-22 16:13:47',NULL,0),(6,'2Science Fiction 2 Science Fiction 2 Science Fiction 2 Science Fiction 2 Science Fiction 2 Science Fiction 2 Science Fiction 2 Science Fiction 2 Science Fiction 2','1','1','1',111,'1','1',2025,1000000.00,111,15,'1','https://res.cloudinary.com/dyh0sob9j/image/upload/v1758559254/products/3f964543-5728-4cf7-929f-32399d329d19.png','2025-09-22 16:40:56',NULL,1),(7,'f','f','f','f',2,'22','2',2025,2000000.00,22,NULL,'22','https://res.cloudinary.com/dyh0sob9j/image/upload/v1758613795/products/9951defe-43db-43c3-b335-15bf82c7b64e.png','2025-09-23 07:49:58',NULL,0),(8,'1','1','1','1',1,'1','1',2025,100000.00,1,5,'1','https://res.cloudinary.com/dyh0sob9j/image/upload/v1758622585/products/ab2ca364-3e38-4815-b935-c2e071ed044a.png','2025-09-23 10:16:27',NULL,0),(9,'1','1','1','1',1,'1','1',2025,10000000.00,1,12,'1','https://res.cloudinary.com/dyh0sob9j/image/upload/v1758622604/products/00e9fb16-8d67-4f12-a84a-69a0492ae3db.png','2025-09-23 10:16:46',NULL,0),(10,'1','1','1','1',1,'1','1',2025,1000000.00,1,NULL,'1','https://res.cloudinary.com/dyh0sob9j/image/upload/v1758622624/products/39d2cac0-30c1-4745-8ff2-415616f4bb61.png','2025-09-23 10:17:06',NULL,0),(11,'q','q','q','q',1,'1','1',2025,1000000.00,1,5,'1','','2025-09-23 10:17:17',NULL,1),(12,'ok','`','1','1',1,'1','1',2025,10000000.00,1,15,'1','https://res.cloudinary.com/dyh0sob9j/image/upload/v1758622678/products/0758af82-648b-4d00-a4cd-15945b450d40.png','2025-09-23 10:18:00',NULL,1),(13,'Â','A','A','A',11,'11','11',2025,10000000.00,12,15,'1','https://res.cloudinary.com/dyh0sob9j/image/upload/v1758784341/products/059433c6-7c6e-427a-aae5-938e6d83752f.jpg','2025-09-25 07:12:22',NULL,1),(14,'Sách Hay','PHú Lê','Lê Phú','Văn Phú',200,'fsdfsd','200',2025,10000.00,20,5,'sdfsdfdsfs','https://res.cloudinary.com/dyh0sob9j/image/upload/v1758809058/products/d5e2a613-3307-4d6f-b66b-b08ed464c656.png','2025-09-25 14:04:18',NULL,1),(15,'Combo 3 sách hay nhất tg','dsf','sdfsd','fsfds',12,'1212','1212',2025,12120000.00,1210,5,'12121','https://res.cloudinary.com/dyh0sob9j/image/upload/v1758809459/products/d639345f-e089-4a9e-a6df-38a9df54e09e.jpg','2025-09-25 14:10:59',NULL,1);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  `rating` int DEFAULT NULL,
  `comment` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `orderitem_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `product_id` (`product_id`),
  KEY `fk_review_orderitem` (`orderitem_id`),
  CONSTRAINT `fk_review_orderitem` FOREIGN KEY (`orderitem_id`) REFERENCES `orderitems` (`id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `reviews_chk_1` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `district` varchar(100) DEFAULT NULL,
  `ward` varchar(100) DEFAULT NULL,
  `address` text,
  `role` enum('user','admin') DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_active` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  CONSTRAINT `users_chk_1` CHECK ((`is_active` in (0,1)))
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,'Phu le23','Nguyen','p@g.c','$2b$10$n4cknW9eWE91dHhXdIsDL.GpQRWYrnmZq2jMjYyZIOKepLrKAPYLa','0123456789','Hanoi','Ba Dinh','Dien Bien','123 Street 3','user','2025-09-21 03:13:31',1),(4,'Phu','Nguyen Van','phuupdated@example.com','$2b$10$CfSNRSIMjMpuO71DLz9wgOka4E062yddHjcKq..Ix/ysP2pQA8oxK',NULL,NULL,NULL,NULL,NULL,'user','2025-09-21 05:21:56',1),(6,'Phu','Nguyen','phu13@example.com','$2b$10$.jQTG8u5cjNWyn3XwuFe9em1s.7CS.QlKdvbkA.g3kjUuzK6OItXC','0123456789','Hanoi','Ba Dinh','Dien Bien','123 Street','user','2025-09-21 05:23:01',1),(9,'Phu','Nguyen Van','phu111112113@example.com','$2b$10$/.Nd8hkWg8LxZJkgBzsYLePnF5G6wuGEJvdwTZltyVsaFSDdJxHGC',NULL,NULL,NULL,NULL,NULL,'user','2025-09-21 05:51:54',1),(10,'Phu','Nguyen Van','phu211112113@example.com','$2b$10$VNOdqHJVbemI/fcqr52AtO.y75WRXcayl69uidbsuSK2SBL8AeXCe',NULL,NULL,NULL,NULL,NULL,'user','2025-09-21 05:51:57',1),(12,'Phu','Ng','n@gmail.com','$2b$10$y/9kNxG3jRT2LPU0NSouX.551pbhTRpyDZVan3.AAObHFjchTdwae',NULL,NULL,NULL,NULL,NULL,'admin','2025-09-22 10:33:43',1),(14,'qândfskdfjsds fsdf','q','adm1in@bookhaven.com','123456','1','1','1','1','1','user','2025-09-23 04:34:34',1),(15,'s','s','ang@gmail.com','s','s','s','s','s','s','user','2025-09-23 10:29:01',0),(16,'d','d','d@gmai.com','d','d','d','d','d','d','user','2025-09-23 10:29:14',0),(18,'1','1','n1@gmail.com','123456','111112','1','1','1','1','user','2025-09-24 11:54:33',0);
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

-- Dump completed on 2025-09-27  0:29:43

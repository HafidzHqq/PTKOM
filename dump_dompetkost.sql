/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.20-13.0.2-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: gizikost_db
-- ------------------------------------------------------
-- Server version	13.0.2-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `Food`
--

DROP TABLE IF EXISTS `Food`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Food` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `category` enum('SARAPAN','MAKAN_SIANG','MAKAN_MALAM','CAMILAN','MINUMAN') NOT NULL,
  `type` enum('BELI','MASAK','KEDUANYA') NOT NULL,
  `pricePerPortion` double DEFAULT NULL,
  `portionsYielded` int(11) DEFAULT NULL,
  `calories` double NOT NULL,
  `protein` double NOT NULL,
  `carbs` double NOT NULL,
  `fat` double NOT NULL,
  `isHalal` tinyint(1) NOT NULL DEFAULT 1,
  `isVegetarian` tinyint(1) NOT NULL DEFAULT 0,
  `allergens` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`allergens`)),
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `cookTimeMinutes` int(11) DEFAULT NULL,
  `imageUrl` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Food`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `Food` WRITE;
/*!40000 ALTER TABLE `Food` DISABLE KEYS */;
INSERT INTO `Food` VALUES
('cmv50pc7d000rlxr4mv4c8qsf','Nasi Telur Dadar Warteg','MAKAN_SIANG','BELI',10000,NULL,450,12,50,20,1,0,'[\"telur\"]','[\"murah\",\"warteg\",\"nasi\"]',NULL,NULL,'2026-10-12 08:56:15.626','2026-10-12 08:56:15.626'),
('cmv50pc7f000slxr44phqjpji','Ayam Geprek Nasi','MAKAN_MALAM','BELI',15000,NULL,650,25,60,30,1,0,'[\"gluten\"]','[\"pedas\",\"ayam\",\"populer\"]',NULL,NULL,'2026-10-12 08:56:15.628','2026-10-12 08:56:15.628'),
('cmv50pc7h000tlxr4df1mrg6t','Nasi Uduk Telur Bulat','SARAPAN','BELI',12000,NULL,500,10,55,22,1,0,'[\"telur\",\"kacang\"]','[\"sarapan\",\"nasi uduk\",\"khas\"]',NULL,NULL,'2026-10-12 08:56:15.629','2026-10-12 08:56:15.629'),
('cmv50pc7i000ulxr45lvwzzhy','Pecel Lele + Nasi','MAKAN_MALAM','BELI',16000,NULL,550,22,50,25,1,0,'[\"ikan\"]','[\"malam\",\"lele\",\"kaki lima\"]',NULL,NULL,'2026-10-12 08:56:15.631','2026-10-12 08:56:15.631'),
('cmv50pc7k000vlxr4grra0zrx','Tumis Kangkung Tempe','MAKAN_SIANG','MASAK',NULL,2,250,15,20,12,1,1,'[\"kedelai\"]','[\"sehat\",\"sayur\",\"murah\"]',15,NULL,'2026-10-12 08:56:15.632','2026-10-12 08:56:15.632'),
('cmv50pc7m0012lxr43xvrxc1x','Mie Instan Telur Sawi','MAKAN_MALAM','MASAK',NULL,1,480,14,60,18,1,0,'[\"telur\",\"gluten\"]','[\"cepat\",\"mie\",\"akhir bulan\"]',10,NULL,'2026-10-12 08:56:15.634','2026-10-12 08:56:15.634'),
('cmv50pc7o0017lxr4kdokfled','Ayam Goreng Bumbu Kuning','MAKAN_SIANG','MASAK',NULL,4,350,25,5,22,1,0,'[]','[\"ayam\",\"lauk\",\"protein tinggi\"]',45,NULL,'2026-10-12 08:56:15.636','2026-10-12 08:56:15.636'),
('cmv50pc7p001dlxr4i1c89f0a','Nasi Goreng Biasa','MAKAN_SIANG','MASAK',NULL,2,506.4565632723891,9.001442323784643,62.2266021778599,21.64210028764328,1,0,'[]','[\"generated\",\"biasa\"]',36,NULL,'2026-10-12 08:56:15.638','2026-10-12 08:56:15.638'),
('cmv50pc7r001mlxr4xun54269','Nasi Goreng Spesial','MAKAN_SIANG','BELI',16326,NULL,474.325387795766,8.654434871708768,61.45498347276745,21.66317809257955,1,0,'[]','[\"generated\",\"spesial\"]',NULL,NULL,'2026-10-12 08:56:15.640','2026-10-12 08:56:15.640'),
('cmv50pc7t001nlxr49ymqf46v','Nasi Goreng Jumbo','MAKAN_MALAM','MASAK',NULL,3,518.4462053556296,10.96643198091997,65.91388544704404,22.31941507565308,1,0,'[]','[\"generated\",\"jumbo\"]',23,NULL,'2026-10-12 08:56:15.641','2026-10-12 08:56:15.641'),
('cmv50pc7u001wlxr4dtqnbxgn','Nasi Goreng Pedas','MAKAN_MALAM','BELI',15286,NULL,496.843823881408,7.904029640709673,57.34139821069991,17.76044058611031,1,0,'[]','[\"generated\",\"pedas\"]',NULL,NULL,'2026-10-12 08:56:15.643','2026-10-12 08:56:15.643'),
('cmv50pc7w001xlxr4v70qhp5p','Nasi Goreng Komplit','MAKAN_SIANG','BELI',22768,NULL,485.4730917735777,7.241333506773445,57.61624182358286,21.20577968384745,1,0,'[]','[\"generated\",\"komplit\"]',NULL,NULL,'2026-10-12 08:56:15.644','2026-10-12 08:56:15.644'),
('cmv50pc7x001ylxr4fd8xlxq6','Nasi Goreng Telur','SARAPAN','BELI',13446,NULL,486.0279035417753,8.967698847627208,60.94772059416133,22.34908102467236,1,0,'[\"telur\"]','[\"generated\",\"telur\"]',NULL,NULL,'2026-10-12 08:56:15.646','2026-10-12 08:56:15.646'),
('cmv50pc7z001zlxr4hfkgdddx','Nasi Goreng Seafood','SARAPAN','MASAK',NULL,2,511.2544680648224,12.56268934799861,58.65882428142234,21.40034375484908,1,0,'[\"seafood\"]','[\"generated\",\"seafood\"]',23,NULL,'2026-10-12 08:56:15.647','2026-10-12 08:56:15.647'),
('cmv50pc810029lxr4ovjkgrjg','Nasi Goreng Sapi','MAKAN_MALAM','BELI',32638,NULL,514.8123223148317,11.64733406410739,59.34345845638715,17.8096912971497,1,0,'[]','[\"generated\",\"sapi\"]',NULL,NULL,'2026-10-12 08:56:15.649','2026-10-12 08:56:15.649'),
('cmv50pc82002alxr46hs25rc4','Mie Goreng Biasa','MAKAN_MALAM','BELI',23790,NULL,480.7832307109321,8.347293472325873,55.46635647446914,19.10657877457582,1,0,'[]','[\"generated\",\"biasa\"]',NULL,NULL,'2026-10-12 08:56:15.651','2026-10-12 08:56:15.651'),
('cmv50pc84002blxr4ru49hlvf','Mie Goreng Spesial','MAKAN_SIANG','BELI',15381,NULL,429.8867797594904,10.24788439103223,49.42385339121693,15.0037356220404,1,0,'[]','[\"generated\",\"spesial\"]',NULL,NULL,'2026-10-12 08:56:15.653','2026-10-12 08:56:15.653'),
('cmv50pc86002clxr4mlfsnp3n','Mie Goreng Jumbo','SARAPAN','BELI',12947,NULL,423.3370991393816,9.51242892635886,56.17367263618902,15.83011765186162,1,0,'[]','[\"generated\",\"jumbo\"]',NULL,NULL,'2026-10-12 08:56:15.654','2026-10-12 08:56:15.654'),
('cmv50pc88002dlxr4qnmkoaox','Mie Goreng Pedas','MAKAN_MALAM','BELI',16894,NULL,476.99837077592,9.729793281331164,53.14563051523283,17.95977254145452,1,0,'[]','[\"generated\",\"pedas\"]',NULL,NULL,'2026-10-12 08:56:15.656','2026-10-12 08:56:15.656'),
('cmv50pc8a002elxr4cvz3m36s','Mie Goreng Komplit','SARAPAN','MASAK',NULL,3,461.315058560041,7.149183729364244,62.53947856595297,15.62454665217848,1,0,'[]','[\"generated\",\"komplit\"]',20,NULL,'2026-10-12 08:56:15.658','2026-10-12 08:56:15.658'),
('cmv50pc8b002mlxr4incrl3fj','Mie Goreng Telur','SARAPAN','BELI',21919,NULL,436.0149943620052,8.042855643076017,55.79615284966771,16.81422591073464,1,0,'[\"telur\"]','[\"generated\",\"telur\"]',NULL,NULL,'2026-10-12 08:56:15.660','2026-10-12 08:56:15.660'),
('cmv50pc8d002nlxr4m804p8z6','Mie Goreng Seafood','SARAPAN','MASAK',NULL,2,416.2470715781091,7.320767601390617,52.20203632689934,20.05944938219627,1,0,'[\"seafood\"]','[\"generated\",\"seafood\"]',23,NULL,'2026-10-12 08:56:15.661','2026-10-12 08:56:15.661'),
('cmv50pc8e002wlxr4iyz8f3e2','Mie Goreng Sapi','MAKAN_MALAM','BELI',33255,NULL,428.8022429836286,8.165786861148158,51.32295132210319,17.61568469360609,1,0,'[]','[\"generated\",\"sapi\"]',NULL,NULL,'2026-10-12 08:56:15.663','2026-10-12 08:56:15.663'),
('cmv50pc8g002xlxr4s22g2poo','Soto Ayam Biasa','MAKAN_MALAM','MASAK',NULL,3,306.5894496905876,15.0689611123538,26.08045021686972,11.5389409172589,1,0,'[]','[\"generated\",\"biasa\"]',33,NULL,'2026-10-12 08:56:15.664','2026-10-12 08:56:15.664'),
('cmv50pc8h0035lxr47oixzh5m','Soto Ayam Spesial','SARAPAN','BELI',16552,NULL,329.2755954446932,16.13299021164918,19.73797614507042,12.71920546321848,1,0,'[]','[\"generated\",\"spesial\"]',NULL,NULL,'2026-10-12 08:56:15.666','2026-10-12 08:56:15.666'),
('cmv50pc8j0036lxr4aw15kaey','Soto Ayam Jumbo','SARAPAN','MASAK',NULL,2,315.4214805207096,14.37388034510998,13.2394840482165,7.75090298450701,1,0,'[]','[\"generated\",\"jumbo\"]',18,NULL,'2026-10-12 08:56:15.667','2026-10-12 08:56:15.667'),
('cmv50pc8l003elxr4ewnlun8p','Soto Ayam Pedas','MAKAN_MALAM','BELI',25741,NULL,326.6800006214742,17.17130807287792,13.34878553049957,8.247663508703367,1,0,'[]','[\"generated\",\"pedas\"]',NULL,NULL,'2026-10-12 08:56:15.669','2026-10-12 08:56:15.669'),
('cmv50pc8m003flxr4kfmn5pxu','Soto Ayam Komplit','MAKAN_MALAM','MASAK',NULL,2,278.2566065472425,12.04930121601306,23.96604177125003,11.85715862229855,1,0,'[]','[\"generated\",\"komplit\"]',37,NULL,'2026-10-12 08:56:15.671','2026-10-12 08:56:15.671'),
('cmv50pc8o003nlxr4phap5ruu','Soto Ayam Telur','MAKAN_MALAM','BELI',12457,NULL,315.0700817349457,15.19648137711238,18.50245057733359,7.303631090524702,1,0,'[\"telur\"]','[\"generated\",\"telur\"]',NULL,NULL,'2026-10-12 08:56:15.672','2026-10-12 08:56:15.672'),
('cmv50pc8p003olxr4mygf48rk','Soto Ayam Seafood','MAKAN_SIANG','BELI',25410,NULL,320.2445773058897,17.42889083636814,19.68533972639732,12.46743747225223,1,0,'[\"seafood\"]','[\"generated\",\"seafood\"]',NULL,NULL,'2026-10-12 08:56:15.674','2026-10-12 08:56:15.674'),
('cmv50pc8r003plxr4z2j8e2sw','Soto Ayam Sapi','SARAPAN','MASAK',NULL,2,262.9499441800643,16.74593424805635,25.67579227953419,9.665447298009404,1,0,'[]','[\"generated\",\"sapi\"]',24,NULL,'2026-10-12 08:56:15.675','2026-10-12 08:56:15.675'),
('cmv50pc8s003xlxr4536uh6oa','Bakso Biasa','MAKAN_MALAM','MASAK',NULL,3,391.5848182009265,14.79667148139285,24.16975696405638,13.83559490234323,1,0,'[]','[\"generated\",\"biasa\"]',27,NULL,'2026-10-12 08:56:15.677','2026-10-12 08:56:15.677'),
('cmv50pc8u0044lxr4eifvh69k','Bakso Spesial','MAKAN_MALAM','BELI',12107,NULL,439.2465906857061,10.64698056877634,36.57119329932785,16.3853518128293,1,0,'[]','[\"generated\",\"spesial\"]',NULL,NULL,'2026-10-12 08:56:15.678','2026-10-12 08:56:15.678'),
('cmv50pc8v0045lxr4fy8tuzki','Bakso Jumbo','MAKAN_SIANG','MASAK',NULL,3,371.60037930128,12.1539699291903,25.16105985071728,12.7492257373636,1,0,'[]','[\"generated\",\"jumbo\"]',23,NULL,'2026-10-12 08:56:15.680','2026-10-12 08:56:15.680'),
('cmv50pc8x004clxr4bieiiij8','Bakso Pedas','SARAPAN','MASAK',NULL,2,403.5611909010927,9.805599581213148,37.35580021214066,15.66564288985541,1,0,'[]','[\"generated\",\"pedas\"]',18,NULL,'2026-10-12 08:56:15.681','2026-10-12 08:56:15.681'),
('cmv50pc8y004jlxr4ivkpie69','Bakso Komplit','SARAPAN','BELI',26903,NULL,401.7093214434499,14.60835772236428,28.63499219486011,13.68528514632601,1,0,'[]','[\"generated\",\"komplit\"]',NULL,NULL,'2026-10-12 08:56:15.683','2026-10-12 08:56:15.683'),
('cmv50pc90004klxr4wo5887ym','Bakso Telur','SARAPAN','BELI',23913,NULL,376.4236486830338,14.0718837499951,29.26602967568742,14.91886489278826,1,0,'[\"telur\"]','[\"generated\",\"telur\"]',NULL,NULL,'2026-10-12 08:56:15.684','2026-10-12 08:56:15.684'),
('cmv50pc92004llxr44vp03t8s','Bakso Seafood','MAKAN_MALAM','MASAK',NULL,2,415.9186828167421,12.84485775892939,33.70840518696903,13.6580721770443,1,0,'[\"seafood\"]','[\"generated\",\"seafood\"]',31,NULL,'2026-10-12 08:56:15.686','2026-10-12 08:56:15.686'),
('cmv50pc93004slxr4wzjy52va','Bakso Sapi','MAKAN_SIANG','MASAK',NULL,3,380.3551876932721,9.118758003124782,35.21858488426954,14.15912930743151,1,0,'[]','[\"generated\",\"sapi\"]',36,NULL,'2026-10-12 08:56:15.688','2026-10-12 08:56:15.688'),
('cmv50pc96004zlxr42w4kc23y','Sate Ayam Biasa','MAKAN_MALAM','BELI',13322,NULL,317.7934167524718,20.52905147800303,13.45975244890885,20.59635443009508,1,0,'[]','[\"generated\",\"biasa\"]',NULL,NULL,'2026-10-12 08:56:15.690','2026-10-12 08:56:15.690'),
('cmv50pc980050lxr4ttq0oaox','Sate Ayam Spesial','SARAPAN','MASAK',NULL,2,367.6874373958271,21.04048828182727,20.03223902875004,17.64510820776378,1,0,'[]','[\"generated\",\"spesial\"]',21,NULL,'2026-10-12 08:56:15.692','2026-10-12 08:56:15.692'),
('cmv50pc990058lxr4d7op9qqy','Sate Ayam Jumbo','SARAPAN','BELI',15589,NULL,354.7686050026671,20.9568551965205,9.294750595920922,17.71423675228659,1,0,'[]','[\"generated\",\"jumbo\"]',NULL,NULL,'2026-10-12 08:56:15.694','2026-10-12 08:56:15.694'),
('cmv50pc9b0059lxr44ifc6kqt','Sate Ayam Pedas','MAKAN_SIANG','MASAK',NULL,2,369.6593122793962,17.81711400293069,22.40484007609564,18.80831466751797,1,0,'[]','[\"generated\",\"pedas\"]',28,NULL,'2026-10-12 08:56:15.695','2026-10-12 08:56:15.695'),
('cmv50pc9c005hlxr48gxaii6e','Sate Ayam Komplit','SARAPAN','MASAK',NULL,2,366.2822230424775,17.97017842480761,13.25208692310839,20.90922630305742,1,0,'[]','[\"generated\",\"komplit\"]',27,NULL,'2026-10-12 08:56:15.697','2026-10-12 08:56:15.697'),
('cmv50pc9e005plxr4g7agk144','Sate Ayam Telur','MAKAN_SIANG','BELI',19234,NULL,361.1450903485054,18.66434798186294,9.898675879486252,18.01282102572792,1,0,'[\"telur\"]','[\"generated\",\"telur\"]',NULL,NULL,'2026-10-12 08:56:15.698','2026-10-12 08:56:15.698'),
('cmv50pc9f005qlxr48nhpi4fq','Sate Ayam Seafood','MAKAN_SIANG','BELI',21648,NULL,365.0590128543271,17.20774776341775,8.246533262906556,16.78984142567197,1,0,'[\"seafood\"]','[\"generated\",\"seafood\"]',NULL,NULL,'2026-10-12 08:56:15.700','2026-10-12 08:56:15.700'),
('cmv50pc9h005rlxr4x9toqxe9','Sate Ayam Sapi','MAKAN_MALAM','MASAK',NULL,3,373.5566123429472,21.8730315025858,14.00862985929009,15.154177352932,1,0,'[]','[\"generated\",\"sapi\"]',28,NULL,'2026-10-12 08:56:15.701','2026-10-12 08:56:15.701'),
('cmv50pc9j005zlxr4q30pijv2','Gado-Gado Biasa','SARAPAN','BELI',25195,NULL,316.0126189885479,14.99481292557892,47.43625323631966,13.91011376171877,1,1,'[]','[\"generated\",\"biasa\"]',NULL,NULL,'2026-10-12 08:56:15.703','2026-10-12 08:56:15.703'),
('cmv50pc9k0060lxr4mhrj6eg4','Gado-Gado Spesial','MAKAN_MALAM','MASAK',NULL,2,325.8953095151574,13.76433328811411,39.19868283192205,16.4175618645934,1,0,'[]','[\"generated\",\"spesial\"]',28,NULL,'2026-10-12 08:56:15.705','2026-10-12 08:56:15.705'),
('cmv50pc9m0068lxr4joifaffr','Gado-Gado Jumbo','MAKAN_MALAM','MASAK',NULL,3,320.8672908756601,9.666112958936456,33.17641384219296,14.79116494813806,1,0,'[]','[\"generated\",\"jumbo\"]',33,NULL,'2026-10-12 08:56:15.706','2026-10-12 08:56:15.706'),
('cmv50pc9o006glxr4tq3rze1t','Gado-Gado Pedas','MAKAN_MALAM','MASAK',NULL,2,377.5250941064761,12.826866315025,47.1117584427935,13.58794857518014,1,0,'[]','[\"generated\",\"pedas\"]',32,NULL,'2026-10-12 08:56:15.708','2026-10-12 08:56:15.708'),
('cmv50pc9p006olxr4827tnh27','Gado-Gado Komplit','SARAPAN','BELI',15942,NULL,373.9274002873804,9.245868088618831,38.1069223375447,17.83976388771824,1,0,'[]','[\"generated\",\"komplit\"]',NULL,NULL,'2026-10-12 08:56:15.710','2026-10-12 08:56:15.710'),
('cmv50pc9q006plxr46s3012k8','Gado-Gado Telur','MAKAN_MALAM','BELI',18471,NULL,366.2221026672281,13.39154197874341,45.34613795126995,14.40794782454557,1,0,'[\"telur\"]','[\"generated\",\"telur\"]',NULL,NULL,'2026-10-12 08:56:15.711','2026-10-12 08:56:15.711'),
('cmv50pc9s006qlxr43n7rqo46','Gado-Gado Seafood','MAKAN_MALAM','BELI',28601,NULL,327.8921545739425,11.95228289112703,34.79900610371364,15.31624678917041,1,0,'[\"seafood\"]','[\"generated\",\"seafood\"]',NULL,NULL,'2026-10-12 08:56:15.712','2026-10-12 08:56:15.712'),
('cmv50pc9t006rlxr4cf79p465','Gado-Gado Sapi','MAKAN_MALAM','BELI',25005,NULL,376.8051396449844,12.05904438443963,33.59718957338878,17.12353975339106,1,0,'[]','[\"generated\",\"sapi\"]',NULL,NULL,'2026-10-12 08:56:15.714','2026-10-12 08:56:15.714'),
('cmv50pc9v006slxr41k877s2w','Ketoprak Biasa','MAKAN_MALAM','BELI',16383,NULL,444.9976920862599,8.862022550043338,49.2964741793009,22.36913355669364,1,1,'[]','[\"generated\",\"biasa\"]',NULL,NULL,'2026-10-12 08:56:15.715','2026-10-12 08:56:15.715'),
('cmv50pc9w006tlxr4mm9lgdg3','Ketoprak Spesial','MAKAN_MALAM','BELI',21503,NULL,434.1129623610645,10.97543572479503,54.46041656006101,19.64152766183485,1,0,'[]','[\"generated\",\"spesial\"]',NULL,NULL,'2026-10-12 08:56:15.716','2026-10-12 08:56:15.716'),
('cmv50pc9y006ulxr4ohh07c3m','Ketoprak Jumbo','SARAPAN','BELI',13801,NULL,486.935559586053,9.021140017878198,43.2934736969992,22.56157955189856,1,0,'[]','[\"generated\",\"jumbo\"]',NULL,NULL,'2026-10-12 08:56:15.718','2026-10-12 08:56:15.718'),
('cmv50pc9z006vlxr4d43h6wb3','Ketoprak Pedas','MAKAN_SIANG','MASAK',NULL,3,413.6392269762234,8.4725627729622,56.31926133395589,19.23916833182112,1,0,'[]','[\"generated\",\"pedas\"]',29,NULL,'2026-10-12 08:56:15.720','2026-10-12 08:56:15.720'),
('cmv50pca10072lxr4ko9md4mn','Ketoprak Komplit','MAKAN_MALAM','MASAK',NULL,2,480.2679503490293,9.976003903943287,53.31119031245522,22.27309752996632,1,0,'[]','[\"generated\",\"komplit\"]',37,NULL,'2026-10-12 08:56:15.722','2026-10-12 08:56:15.722'),
('cmv50pca30079lxr4lwgtad26','Ketoprak Telur','SARAPAN','MASAK',NULL,2,458.1114720399669,11.04719176905405,54.237747074266,20.37801372164959,1,0,'[\"telur\"]','[\"generated\",\"telur\"]',19,NULL,'2026-10-12 08:56:15.723','2026-10-12 08:56:15.723'),
('cmv50pca5007hlxr4edr9wr8x','Ketoprak Seafood','SARAPAN','MASAK',NULL,2,414.9611973814116,7.85641471485064,46.21390176294845,20.04343922585737,1,0,'[\"seafood\"]','[\"generated\",\"seafood\"]',34,NULL,'2026-10-12 08:56:15.726','2026-10-12 08:56:15.726'),
('cmv50pca7007plxr451su32rh','Ketoprak Sapi','MAKAN_SIANG','BELI',33743,NULL,443.2429576676269,10.30011043040504,55.1783718871262,18.74291513233817,1,0,'[]','[\"generated\",\"sapi\"]',NULL,NULL,'2026-10-12 08:56:15.727','2026-10-12 08:56:15.727'),
('cmv50pca8007qlxr4y4gtlzt4','Nasi Padang Biasa','MAKAN_MALAM','MASAK',NULL,2,682.1706758130384,25.70014128770442,72.49253521571546,28.9461260617412,1,0,'[]','[\"generated\",\"biasa\"]',39,NULL,'2026-10-12 08:56:15.729','2026-10-12 08:56:15.729'),
('cmv50pcaa007ylxr482u5jrsc','Nasi Padang Spesial','MAKAN_MALAM','BELI',19051,NULL,726.4526624654574,27.95893834630301,69.3480569615299,31.87339230110513,1,0,'[]','[\"generated\",\"spesial\"]',NULL,NULL,'2026-10-12 08:56:15.730','2026-10-12 08:56:15.730'),
('cmv50pcab007zlxr4ozzisq50','Nasi Padang Jumbo','SARAPAN','MASAK',NULL,2,731.2844380753916,27.54066418378341,63.39269547637002,32.97090707454626,1,0,'[]','[\"generated\",\"jumbo\"]',16,NULL,'2026-10-12 08:56:15.731','2026-10-12 08:56:15.731'),
('cmv50pcac0087lxr493un8itc','Nasi Padang Pedas','SARAPAN','MASAK',NULL,3,695.1441603263742,23.38367957225642,77.58160463060787,29.93666142084211,1,0,'[]','[\"generated\",\"pedas\"]',24,NULL,'2026-10-12 08:56:15.733','2026-10-12 08:56:15.733'),
('cmv50pcae008flxr42lps6q91','Nasi Padang Komplit','MAKAN_MALAM','BELI',24335,NULL,707.6288267396349,22.73556942915036,66.09573335054877,28.40321975057739,1,0,'[]','[\"generated\",\"komplit\"]',NULL,NULL,'2026-10-12 08:56:15.735','2026-10-12 08:56:15.735'),
('cmv50pcag008glxr40iq92xqy','Nasi Padang Telur','MAKAN_MALAM','BELI',15855,NULL,687.1633050566486,24.23665027223455,75.62605155292627,28.72802911885228,1,0,'[\"telur\"]','[\"generated\",\"telur\"]',NULL,NULL,'2026-10-12 08:56:15.737','2026-10-12 08:56:15.737'),
('cmv50pcai008hlxr4bqh5x2ir','Nasi Padang Seafood','MAKAN_SIANG','BELI',26018,NULL,716.0283562656381,25.13765829136864,67.34036219846551,30.23024709605779,1,0,'[\"seafood\"]','[\"generated\",\"seafood\"]',NULL,NULL,'2026-10-12 08:56:15.738','2026-10-12 08:56:15.738'),
('cmv50pcaj008ilxr41e0qqwal','Nasi Padang Sapi','MAKAN_MALAM','MASAK',NULL,2,705.3616142481535,27.67850543669305,66.11901220194972,31.31969511818941,1,0,'[]','[\"generated\",\"sapi\"]',19,NULL,'2026-10-12 08:56:15.740','2026-10-12 08:56:15.740'),
('cmv50pcal008qlxr4953u53dl','Ayam Bakar Biasa','SARAPAN','MASAK',NULL,3,415.1952290207907,24.76280582438162,16.03320024271813,14.03772073223741,1,0,'[]','[\"generated\",\"biasa\"]',31,NULL,'2026-10-12 08:56:15.741','2026-10-12 08:56:15.741'),
('cmv50pcam008ylxr4ag1tmzbg','Ayam Bakar Spesial','MAKAN_SIANG','BELI',13369,NULL,371.0185783263667,25.16786809420886,8.664594774652759,17.41130513426859,1,0,'[]','[\"generated\",\"spesial\"]',NULL,NULL,'2026-10-12 08:56:15.743','2026-10-12 08:56:15.743'),
('cmv50pcao008zlxr4z9xrsot1','Ayam Bakar Jumbo','SARAPAN','BELI',23392,NULL,433.1668362923357,26.71548411948378,13.01521951796645,17.43649936346119,1,0,'[]','[\"generated\",\"jumbo\"]',NULL,NULL,'2026-10-12 08:56:15.744','2026-10-12 08:56:15.744'),
('cmv50pcap0090lxr4rsxydzyq','Ayam Bakar Pedas','MAKAN_SIANG','BELI',20931,NULL,400.1701669557402,23.17419079178965,3.954431201825366,16.13419089753388,1,0,'[]','[\"generated\",\"pedas\"]',NULL,NULL,'2026-10-12 08:56:15.746','2026-10-12 08:56:15.746'),
('cmv50pcar0091lxr4aj1ua1go','Ayam Bakar Komplit','MAKAN_MALAM','BELI',23061,NULL,376.2588654851717,27.55130832572993,4.35221889882134,14.6934151208571,1,0,'[]','[\"generated\",\"komplit\"]',NULL,NULL,'2026-10-12 08:56:15.747','2026-10-12 08:56:15.747'),
('cmv50pcas0092lxr49q4pcm02','Ayam Bakar Telur','MAKAN_SIANG','MASAK',NULL,3,376.1151610453546,25.61345485854957,3.705890486192277,13.79992022319336,1,0,'[\"telur\"]','[\"generated\",\"telur\"]',27,NULL,'2026-10-12 08:56:15.748','2026-10-12 08:56:15.748'),
('cmv50pcau009blxr44yv0gbsm','Ayam Bakar Seafood','SARAPAN','MASAK',NULL,3,404.1051561456082,22.08867264125311,17.75640985745819,16.31806916048935,1,0,'[\"seafood\"]','[\"generated\",\"seafood\"]',18,NULL,'2026-10-12 08:56:15.750','2026-10-12 08:56:15.750'),
('cmv50pcaw009jlxr4oc6hwdis','Ayam Bakar Sapi','SARAPAN','MASAK',NULL,2,374.8849030286967,24.15646096933206,13.15656083140008,14.55191453317298,1,0,'[]','[\"generated\",\"sapi\"]',27,NULL,'2026-10-12 08:56:15.752','2026-10-12 08:56:15.752'),
('cmv50pcay009rlxr42sjahft5','Ikan Bakar Biasa','MAKAN_SIANG','MASAK',NULL,3,381.0222959785563,20.75910293163108,10.20094598127179,11.6889674287844,1,0,'[]','[\"generated\",\"biasa\"]',22,NULL,'2026-10-12 08:56:15.754','2026-10-12 08:56:15.754'),
('cmv50pcaz009zlxr4z0i3wpur','Ikan Bakar Spesial','MAKAN_MALAM','BELI',23033,NULL,360.5501211935647,21.12161720102151,9.536011184417067,10.44414617891496,1,0,'[]','[\"generated\",\"spesial\"]',NULL,NULL,'2026-10-12 08:56:15.756','2026-10-12 08:56:15.756'),
('cmv50pcb100a0lxr41sjp3fut','Ikan Bakar Jumbo','MAKAN_MALAM','BELI',25927,NULL,368.6631148858867,21.5403372295295,8.96817687974883,9.439864900038451,1,0,'[]','[\"generated\",\"jumbo\"]',NULL,NULL,'2026-10-12 08:56:15.757','2026-10-12 08:56:15.757'),
('cmv50pcb300a1lxr4kdhp2a8p','Ikan Bakar Pedas','MAKAN_SIANG','BELI',19138,NULL,349.2290462154196,22.98570561793725,1.576173071118637,12.02090903227226,1,0,'[]','[\"generated\",\"pedas\"]',NULL,NULL,'2026-10-12 08:56:15.759','2026-10-12 08:56:15.759'),
('cmv50pcb400a2lxr4rwpmfvnf','Ikan Bakar Komplit','MAKAN_SIANG','BELI',26604,NULL,350.0000962981026,22.4594008563528,2.224138917584791,12.99146146835131,1,0,'[]','[\"generated\",\"komplit\"]',NULL,NULL,'2026-10-12 08:56:15.761','2026-10-12 08:56:15.761'),
('cmv50pcb600a3lxr4rwu99p8z','Ikan Bakar Telur','MAKAN_MALAM','MASAK',NULL,2,327.3491047192169,19.82351659788949,0.5666795675480696,13.48214272071312,1,0,'[\"telur\"]','[\"generated\",\"telur\"]',15,NULL,'2026-10-12 08:56:15.762','2026-10-12 08:56:15.762'),
('cmv50pcb700aclxr4umor2l9x','Ikan Bakar Seafood','SARAPAN','MASAK',NULL,2,364.2481466762887,23.33771544049419,0.02686687774096086,10.77464772919102,1,0,'[\"seafood\"]','[\"generated\",\"seafood\"]',20,NULL,'2026-10-12 08:56:15.764','2026-10-12 08:56:15.764'),
('cmv50pcb900aklxr4758ps55l','Ikan Bakar Sapi','SARAPAN','BELI',20035,NULL,385.1965788326515,24.45522902520849,1.989477539606519,13.09190034277694,1,0,'[]','[\"generated\",\"sapi\"]',NULL,NULL,'2026-10-12 08:56:15.765','2026-10-12 08:56:15.765');
/*!40000 ALTER TABLE `Food` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `FoodPlace`
--

DROP TABLE IF EXISTS `FoodPlace`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `FoodPlace` (
  `foodId` varchar(191) NOT NULL,
  `placeId` varchar(191) NOT NULL,
  PRIMARY KEY (`foodId`,`placeId`),
  KEY `FoodPlace_placeId_fkey` (`placeId`),
  CONSTRAINT `FoodPlace_foodId_fkey` FOREIGN KEY (`foodId`) REFERENCES `Food` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FoodPlace_placeId_fkey` FOREIGN KEY (`placeId`) REFERENCES `Place` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `FoodPlace`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `FoodPlace` WRITE;
/*!40000 ALTER TABLE `FoodPlace` DISABLE KEYS */;
INSERT INTO `FoodPlace` VALUES
('cmv50pc7d000rlxr4mv4c8qsf','cmv50pc74000mlxr41cvzxdbj'),
('cmv50pc7r001mlxr4xun54269','cmv50pc74000mlxr41cvzxdbj'),
('cmv50pc7w001xlxr4v70qhp5p','cmv50pc74000mlxr41cvzxdbj'),
('cmv50pc8b002mlxr4incrl3fj','cmv50pc74000mlxr41cvzxdbj'),
('cmv50pc8h0035lxr47oixzh5m','cmv50pc74000mlxr41cvzxdbj'),
('cmv50pc96004zlxr42w4kc23y','cmv50pc74000mlxr41cvzxdbj'),
('cmv50pc9j005zlxr4q30pijv2','cmv50pc74000mlxr41cvzxdbj'),
('cmv50pc9p006olxr4827tnh27','cmv50pc74000mlxr41cvzxdbj'),
('cmv50pcao008zlxr4z9xrsot1','cmv50pc74000mlxr41cvzxdbj'),
('cmv50pcb900aklxr4758ps55l','cmv50pc74000mlxr41cvzxdbj'),
('cmv50pc7d000rlxr4mv4c8qsf','cmv50pc77000nlxr4zwxttrz2'),
('cmv50pc7x001ylxr4fd8xlxq6','cmv50pc77000nlxr4zwxttrz2'),
('cmv50pc8o003nlxr4phap5ruu','cmv50pc77000nlxr4zwxttrz2'),
('cmv50pc8u0044lxr4eifvh69k','cmv50pc77000nlxr4zwxttrz2'),
('cmv50pc9f005qlxr48nhpi4fq','cmv50pc77000nlxr4zwxttrz2'),
('cmv50pc9w006tlxr4mm9lgdg3','cmv50pc77000nlxr4zwxttrz2'),
('cmv50pcai008hlxr4bqh5x2ir','cmv50pc77000nlxr4zwxttrz2'),
('cmv50pcar0091lxr4aj1ua1go','cmv50pc77000nlxr4zwxttrz2'),
('cmv50pcb300a1lxr4kdhp2a8p','cmv50pc77000nlxr4zwxttrz2'),
('cmv50pc7f000slxr44phqjpji','cmv50pc79000olxr4gs8laz52'),
('cmv50pc7u001wlxr4dtqnbxgn','cmv50pc79000olxr4gs8laz52'),
('cmv50pc82002alxr46hs25rc4','cmv50pc79000olxr4gs8laz52'),
('cmv50pc88002dlxr4qnmkoaox','cmv50pc79000olxr4gs8laz52'),
('cmv50pc8e002wlxr4iyz8f3e2','cmv50pc79000olxr4gs8laz52'),
('cmv50pc8l003elxr4ewnlun8p','cmv50pc79000olxr4gs8laz52'),
('cmv50pc8p003olxr4mygf48rk','cmv50pc79000olxr4gs8laz52'),
('cmv50pc90004klxr4wo5887ym','cmv50pc79000olxr4gs8laz52'),
('cmv50pc990058lxr4d7op9qqy','cmv50pc79000olxr4gs8laz52'),
('cmv50pc9q006plxr46s3012k8','cmv50pc79000olxr4gs8laz52'),
('cmv50pc9y006ulxr4ohh07c3m','cmv50pc79000olxr4gs8laz52'),
('cmv50pcb100a0lxr41sjp3fut','cmv50pc79000olxr4gs8laz52'),
('cmv50pc7h000tlxr4df1mrg6t','cmv50pc7a000plxr4oqmzddr7'),
('cmv50pc810029lxr4ovjkgrjg','cmv50pc7a000plxr4oqmzddr7'),
('cmv50pc86002clxr4mlfsnp3n','cmv50pc7a000plxr4oqmzddr7'),
('cmv50pc8y004jlxr4ivkpie69','cmv50pc7a000plxr4oqmzddr7'),
('cmv50pcae008flxr42lps6q91','cmv50pc7a000plxr4oqmzddr7'),
('cmv50pcag008glxr40iq92xqy','cmv50pc7a000plxr4oqmzddr7'),
('cmv50pcaz009zlxr4z0i3wpur','cmv50pc7a000plxr4oqmzddr7'),
('cmv50pcb400a2lxr4rwpmfvnf','cmv50pc7a000plxr4oqmzddr7'),
('cmv50pc7i000ulxr45lvwzzhy','cmv50pc7b000qlxr4ubf6uwc9'),
('cmv50pc84002blxr4ru49hlvf','cmv50pc7b000qlxr4ubf6uwc9'),
('cmv50pc9e005plxr4g7agk144','cmv50pc7b000qlxr4ubf6uwc9'),
('cmv50pc9s006qlxr43n7rqo46','cmv50pc7b000qlxr4ubf6uwc9'),
('cmv50pc9t006rlxr4cf79p465','cmv50pc7b000qlxr4ubf6uwc9'),
('cmv50pc9v006slxr41k877s2w','cmv50pc7b000qlxr4ubf6uwc9'),
('cmv50pca7007plxr451su32rh','cmv50pc7b000qlxr4ubf6uwc9'),
('cmv50pcaa007ylxr482u5jrsc','cmv50pc7b000qlxr4ubf6uwc9'),
('cmv50pcam008ylxr4ag1tmzbg','cmv50pc7b000qlxr4ubf6uwc9'),
('cmv50pcap0090lxr4rsxydzyq','cmv50pc7b000qlxr4ubf6uwc9');
/*!40000 ALTER TABLE `FoodPlace` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `Ingredient`
--

DROP TABLE IF EXISTS `Ingredient`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Ingredient` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `unit` varchar(191) NOT NULL,
  `pricePerUnit` double NOT NULL,
  `region` varchar(191) DEFAULT NULL,
  `priceUpdatedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Ingredient`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `Ingredient` WRITE;
/*!40000 ALTER TABLE `Ingredient` DISABLE KEYS */;
INSERT INTO `Ingredient` VALUES
('cmv50pc6c0000lxr4xtvf5zz5','Beras','kg',15100,'Bandar Lampung','2026-10-12 08:56:15.589'),
('cmv50pc6e0001lxr4ekja2cse','Telur Ayam','kg',28500,'Bandar Lampung','2026-10-12 08:56:15.590'),
('cmv50pc6g0002lxr4m2yo6h41','Daging Ayam','kg',33800,'Bandar Lampung','2026-10-12 08:56:15.593'),
('cmv50pc6i0003lxr4dsa2ytrm','Tempe','papan',5000,'Bandar Lampung','2026-10-12 08:56:15.594'),
('cmv50pc6j0004lxr427a0aop1','Tahu','bungkus',4000,'Bandar Lampung','2026-10-12 08:56:15.596'),
('cmv50pc6k0005lxr4z8crph3i','Bawang Merah','kg',45500,'Bandar Lampung','2026-10-12 08:56:15.597'),
('cmv50pc6l0006lxr46oszzxyt','Bawang Putih','kg',32500,'Bandar Lampung','2026-10-12 08:56:15.598'),
('cmv50pc6n0007lxr47gucpggh','Cabai Merah','kg',57500,'Bandar Lampung','2026-10-12 08:56:15.599'),
('cmv50pc6o0008lxr4hannq9vm','Minyak Goreng','liter',21000,'Bandar Lampung','2026-10-12 08:56:15.600'),
('cmv50pc6p0009lxr4hw7495k1','Garam','bungkus',2000,'Bandar Lampung','2026-10-12 08:56:15.602'),
('cmv50pc6r000alxr4v5wrnrf5','Kangkung','ikat',2500,'Bandar Lampung','2026-10-12 08:56:15.603'),
('cmv50pc6s000blxr4q9r4eoll','Bayam','ikat',2500,'Bandar Lampung','2026-10-12 08:56:15.604'),
('cmv50pc6t000clxr4bn2vsvgo','Mie Instan','bungkus',3000,'Bandar Lampung','2026-10-12 08:56:15.605'),
('cmv50pc6u000dlxr4jb2c2zgk','Sawi Hijau','ikat',3000,'Bandar Lampung','2026-10-12 08:56:15.607'),
('cmv50pc6v000elxr4bk7lb83o','Tomat','kg',12000,'Bandar Lampung','2026-10-12 08:56:15.608'),
('cmv50pc6w000flxr4aw7axxwt','Kecap Manis','botol',10000,'Bandar Lampung','2026-10-12 08:56:15.609'),
('cmv50pc6y000glxr4a4xvus2c','Ikan Lele','kg',25000,'Bandar Lampung','2026-10-12 08:56:15.610'),
('cmv50pc6z000hlxr4ga8au9ih','Ikan Nila','kg',30000,'Bandar Lampung','2026-10-12 08:56:15.611'),
('cmv50pc70000ilxr4um1wc5hy','Kacang Panjang','ikat',3000,'Bandar Lampung','2026-10-12 08:56:15.612'),
('cmv50pc71000jlxr4cfm7bgv4','Wortel','kg',15000,'Bandar Lampung','2026-10-12 08:56:15.613'),
('cmv50pc72000klxr445ad4ob0','Daging Sapi','kg',140000,'Bandar Lampung','2026-10-12 08:56:15.615'),
('cmv50pc73000llxr4nne5nm2w','Udang/Seafood','kg',80000,'Bandar Lampung','2026-10-12 08:56:15.616');
/*!40000 ALTER TABLE `Ingredient` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `Place`
--

DROP TABLE IF EXISTS `Place`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Place` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `priceRange` varchar(191) NOT NULL,
  `location` varchar(191) NOT NULL,
  `source` varchar(191) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Place`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `Place` WRITE;
/*!40000 ALTER TABLE `Place` DISABLE KEYS */;
INSERT INTO `Place` VALUES
('cmv50pc74000mlxr41cvzxdbj','Warteg Bahari Pramuka','Rp 10.000 - Rp 20.000','Jl. Pramuka, Rajabasa','warteg'),
('cmv50pc77000nlxr4zwxttrz2','Kantin Unila','Rp 8.000 - Rp 15.000','Kampus Unila','kantin'),
('cmv50pc79000olxr4gs8laz52','Ayam Geprek Bensu Kedaton','Rp 15.000 - Rp 25.000','Kedaton','restoran'),
('cmv50pc7a000plxr4oqmzddr7','Nasi Uduk Toha','Rp 12.000 - Rp 25.000','Jl. Kartini','kaki lima'),
('cmv50pc7b000qlxr4ubf6uwc9','Pecel Lele Mas Budi','Rp 12.000 - Rp 20.000','Way Halim','kaki lima');
/*!40000 ALTER TABLE `Place` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `RecipeItem`
--

DROP TABLE IF EXISTS `RecipeItem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `RecipeItem` (
  `id` varchar(191) NOT NULL,
  `foodId` varchar(191) NOT NULL,
  `ingredientId` varchar(191) NOT NULL,
  `quantity` double NOT NULL,
  `unit` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `RecipeItem_foodId_ingredientId_key` (`foodId`,`ingredientId`),
  KEY `RecipeItem_ingredientId_fkey` (`ingredientId`),
  CONSTRAINT `RecipeItem_foodId_fkey` FOREIGN KEY (`foodId`) REFERENCES `Food` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `RecipeItem_ingredientId_fkey` FOREIGN KEY (`ingredientId`) REFERENCES `Ingredient` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `RecipeItem`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `RecipeItem` WRITE;
/*!40000 ALTER TABLE `RecipeItem` DISABLE KEYS */;
INSERT INTO `RecipeItem` VALUES
('cmv50pc7k000xlxr46zvp6x1d','cmv50pc7k000vlxr4grra0zrx','cmv50pc6r000alxr4v5wrnrf5',1,'ikat'),
('cmv50pc7k000ylxr4o1cxc42t','cmv50pc7k000vlxr4grra0zrx','cmv50pc6i0003lxr4dsa2ytrm',0.5,'papan'),
('cmv50pc7k000zlxr4nkfx7gdw','cmv50pc7k000vlxr4grra0zrx','cmv50pc6k0005lxr4z8crph3i',0.02,'kg'),
('cmv50pc7k0010lxr443jah802','cmv50pc7k000vlxr4grra0zrx','cmv50pc6l0006lxr46oszzxyt',0.01,'kg'),
('cmv50pc7k0011lxr4idratc7e','cmv50pc7k000vlxr4grra0zrx','cmv50pc6o0008lxr4hannq9vm',0.02,'liter'),
('cmv50pc7m0014lxr4il7hfxjq','cmv50pc7m0012lxr43xvrxc1x','cmv50pc6t000clxr4bn2vsvgo',1,'bungkus'),
('cmv50pc7m0015lxr4j2j3ae5o','cmv50pc7m0012lxr43xvrxc1x','cmv50pc6e0001lxr4ekja2cse',0.06,'kg'),
('cmv50pc7m0016lxr4rhxzhjj9','cmv50pc7m0012lxr43xvrxc1x','cmv50pc6u000dlxr4jb2c2zgk',0.2,'ikat'),
('cmv50pc7o0019lxr4dkgfkpe4','cmv50pc7o0017lxr4kdokfled','cmv50pc6g0002lxr4m2yo6h41',0.5,'kg'),
('cmv50pc7o001alxr4bn47rupg','cmv50pc7o0017lxr4kdokfled','cmv50pc6c0000lxr4xtvf5zz5',0.4,'kg'),
('cmv50pc7o001blxr4jeyhs3xo','cmv50pc7o0017lxr4kdokfled','cmv50pc6o0008lxr4hannq9vm',0.1,'liter'),
('cmv50pc7o001clxr42t0yrfws','cmv50pc7o0017lxr4kdokfled','cmv50pc6l0006lxr46oszzxyt',0.02,'kg'),
('cmv50pc7p001flxr4r0jb4q4y','cmv50pc7p001dlxr4i1c89f0a','cmv50pc6c0000lxr4xtvf5zz5',0.3,'kg'),
('cmv50pc7p001glxr4xhyg4hss','cmv50pc7p001dlxr4i1c89f0a','cmv50pc6e0001lxr4ekja2cse',0.12,'kg'),
('cmv50pc7p001hlxr4ez42gnic','cmv50pc7p001dlxr4i1c89f0a','cmv50pc6o0008lxr4hannq9vm',0.06,'liter'),
('cmv50pc7q001ilxr485awkm7o','cmv50pc7p001dlxr4i1c89f0a','cmv50pc6k0005lxr4z8crph3i',0.04,'kg'),
('cmv50pc7q001jlxr49ef2xpx7','cmv50pc7p001dlxr4i1c89f0a','cmv50pc6l0006lxr46oszzxyt',0.03,'kg'),
('cmv50pc7q001klxr4wuhbfnkd','cmv50pc7p001dlxr4i1c89f0a','cmv50pc6w000flxr4aw7axxwt',0.1,'botol'),
('cmv50pc7q001llxr4wxea0g50','cmv50pc7p001dlxr4i1c89f0a','cmv50pc6n0007lxr47gucpggh',0.03,'kg'),
('cmv50pc7t001plxr43f184eto','cmv50pc7t001nlxr49ymqf46v','cmv50pc6c0000lxr4xtvf5zz5',0.6749999999999999,'kg'),
('cmv50pc7t001qlxr4uhalcj70','cmv50pc7t001nlxr49ymqf46v','cmv50pc6e0001lxr4ekja2cse',0.27,'kg'),
('cmv50pc7t001rlxr41byg5caj','cmv50pc7t001nlxr49ymqf46v','cmv50pc6o0008lxr4hannq9vm',0.135,'liter'),
('cmv50pc7t001slxr4z9efp82n','cmv50pc7t001nlxr49ymqf46v','cmv50pc6k0005lxr4z8crph3i',0.09,'kg'),
('cmv50pc7t001tlxr4mldr0g6f','cmv50pc7t001nlxr49ymqf46v','cmv50pc6l0006lxr46oszzxyt',0.0675,'kg'),
('cmv50pc7t001ulxr46300foez','cmv50pc7t001nlxr49ymqf46v','cmv50pc6w000flxr4aw7axxwt',0.225,'botol'),
('cmv50pc7t001vlxr4qfnje0jj','cmv50pc7t001nlxr49ymqf46v','cmv50pc6n0007lxr47gucpggh',0.0675,'kg'),
('cmv50pc7z0021lxr4ht3fhk1e','cmv50pc7z001zlxr4hfkgdddx','cmv50pc6c0000lxr4xtvf5zz5',0.3,'kg'),
('cmv50pc7z0022lxr4pjvnxayy','cmv50pc7z001zlxr4hfkgdddx','cmv50pc6e0001lxr4ekja2cse',0.12,'kg'),
('cmv50pc7z0023lxr4ufxqvmxf','cmv50pc7z001zlxr4hfkgdddx','cmv50pc6o0008lxr4hannq9vm',0.06,'liter'),
('cmv50pc7z0024lxr4rmwtsxdb','cmv50pc7z001zlxr4hfkgdddx','cmv50pc6k0005lxr4z8crph3i',0.04,'kg'),
('cmv50pc7z0025lxr4jz0fmg2j','cmv50pc7z001zlxr4hfkgdddx','cmv50pc6l0006lxr46oszzxyt',0.03,'kg'),
('cmv50pc7z0026lxr4g4hpdj27','cmv50pc7z001zlxr4hfkgdddx','cmv50pc6w000flxr4aw7axxwt',0.1,'botol'),
('cmv50pc7z0027lxr4uvvafy7y','cmv50pc7z001zlxr4hfkgdddx','cmv50pc6n0007lxr47gucpggh',0.03,'kg'),
('cmv50pc7z0028lxr4vtq8rj1c','cmv50pc7z001zlxr4hfkgdddx','cmv50pc73000llxr4nne5nm2w',0.15,'kg'),
('cmv50pc8a002glxr4t7gm0v85','cmv50pc8a002elxr4cvz3m36s','cmv50pc6t000clxr4bn2vsvgo',3,'bungkus'),
('cmv50pc8a002hlxr4p01rvhut','cmv50pc8a002elxr4cvz3m36s','cmv50pc6e0001lxr4ekja2cse',0.18,'kg'),
('cmv50pc8a002ilxr4w2hofnrc','cmv50pc8a002elxr4cvz3m36s','cmv50pc6u000dlxr4jb2c2zgk',0.8999999999999999,'ikat'),
('cmv50pc8a002jlxr4bhv53s4w','cmv50pc8a002elxr4cvz3m36s','cmv50pc6o0008lxr4hannq9vm',0.06,'liter'),
('cmv50pc8a002klxr4q3x16vgz','cmv50pc8a002elxr4cvz3m36s','cmv50pc6k0005lxr4z8crph3i',0.045,'kg'),
('cmv50pc8a002llxr4g6i2qa84','cmv50pc8a002elxr4cvz3m36s','cmv50pc6w000flxr4aw7axxwt',0.12,'botol'),
('cmv50pc8d002plxr4nbaq2vb2','cmv50pc8d002nlxr4m804p8z6','cmv50pc6t000clxr4bn2vsvgo',2,'bungkus'),
('cmv50pc8d002qlxr4amh8vhuh','cmv50pc8d002nlxr4m804p8z6','cmv50pc6e0001lxr4ekja2cse',0.12,'kg'),
('cmv50pc8d002rlxr4slqgl006','cmv50pc8d002nlxr4m804p8z6','cmv50pc6u000dlxr4jb2c2zgk',0.6,'ikat'),
('cmv50pc8d002slxr46icpk1a0','cmv50pc8d002nlxr4m804p8z6','cmv50pc6o0008lxr4hannq9vm',0.04,'liter'),
('cmv50pc8d002tlxr4xnobzzi6','cmv50pc8d002nlxr4m804p8z6','cmv50pc6k0005lxr4z8crph3i',0.03,'kg'),
('cmv50pc8d002ulxr4mzdn4s2o','cmv50pc8d002nlxr4m804p8z6','cmv50pc6w000flxr4aw7axxwt',0.08,'botol'),
('cmv50pc8d002vlxr4zictnlwj','cmv50pc8d002nlxr4m804p8z6','cmv50pc73000llxr4nne5nm2w',0.15,'kg'),
('cmv50pc8g002zlxr4hfnb32iy','cmv50pc8g002xlxr4s22g2poo','cmv50pc6g0002lxr4m2yo6h41',0.6000000000000001,'kg'),
('cmv50pc8g0030lxr408alukwa','cmv50pc8g002xlxr4s22g2poo','cmv50pc6c0000lxr4xtvf5zz5',0.3,'kg'),
('cmv50pc8g0031lxr45q77qs8b','cmv50pc8g002xlxr4s22g2poo','cmv50pc6k0005lxr4z8crph3i',0.06,'kg'),
('cmv50pc8g0032lxr4fnw3164a','cmv50pc8g002xlxr4s22g2poo','cmv50pc6l0006lxr46oszzxyt',0.045,'kg'),
('cmv50pc8g0033lxr4vox70y8o','cmv50pc8g002xlxr4s22g2poo','cmv50pc6o0008lxr4hannq9vm',0.06,'liter'),
('cmv50pc8g0034lxr4kb183qff','cmv50pc8g002xlxr4s22g2poo','cmv50pc6v000elxr4bk7lb83o',0.15,'kg'),
('cmv50pc8j0038lxr4tpt4n8r3','cmv50pc8j0036lxr4aw15kaey','cmv50pc6g0002lxr4m2yo6h41',0.6000000000000001,'kg'),
('cmv50pc8j0039lxr4xwv84jtf','cmv50pc8j0036lxr4aw15kaey','cmv50pc6c0000lxr4xtvf5zz5',0.3,'kg'),
('cmv50pc8j003alxr42fl8er39','cmv50pc8j0036lxr4aw15kaey','cmv50pc6k0005lxr4z8crph3i',0.06,'kg'),
('cmv50pc8j003blxr4r7s1ibzr','cmv50pc8j0036lxr4aw15kaey','cmv50pc6l0006lxr46oszzxyt',0.045,'kg'),
('cmv50pc8j003clxr46kvkk9td','cmv50pc8j0036lxr4aw15kaey','cmv50pc6o0008lxr4hannq9vm',0.06,'liter'),
('cmv50pc8j003dlxr4vckpxufx','cmv50pc8j0036lxr4aw15kaey','cmv50pc6v000elxr4bk7lb83o',0.15,'kg'),
('cmv50pc8m003hlxr4rm3t13l5','cmv50pc8m003flxr4kfmn5pxu','cmv50pc6g0002lxr4m2yo6h41',0.4,'kg'),
('cmv50pc8m003ilxr47usp5ogn','cmv50pc8m003flxr4kfmn5pxu','cmv50pc6c0000lxr4xtvf5zz5',0.2,'kg'),
('cmv50pc8m003jlxr4iommbay9','cmv50pc8m003flxr4kfmn5pxu','cmv50pc6k0005lxr4z8crph3i',0.04,'kg'),
('cmv50pc8m003klxr49mbg2mhu','cmv50pc8m003flxr4kfmn5pxu','cmv50pc6l0006lxr46oszzxyt',0.03,'kg'),
('cmv50pc8m003llxr46kruw7km','cmv50pc8m003flxr4kfmn5pxu','cmv50pc6o0008lxr4hannq9vm',0.04,'liter'),
('cmv50pc8m003mlxr4kn2y7586','cmv50pc8m003flxr4kfmn5pxu','cmv50pc6v000elxr4bk7lb83o',0.1,'kg'),
('cmv50pc8r003rlxr4ervvaqt0','cmv50pc8r003plxr4z2j8e2sw','cmv50pc72000klxr445ad4ob0',0.4,'kg'),
('cmv50pc8r003slxr40tlbee90','cmv50pc8r003plxr4z2j8e2sw','cmv50pc6c0000lxr4xtvf5zz5',0.2,'kg'),
('cmv50pc8r003tlxr4ypxanmij','cmv50pc8r003plxr4z2j8e2sw','cmv50pc6k0005lxr4z8crph3i',0.04,'kg'),
('cmv50pc8r003ulxr47grslrbk','cmv50pc8r003plxr4z2j8e2sw','cmv50pc6l0006lxr46oszzxyt',0.03,'kg'),
('cmv50pc8r003vlxr4onnac155','cmv50pc8r003plxr4z2j8e2sw','cmv50pc6o0008lxr4hannq9vm',0.04,'liter'),
('cmv50pc8r003wlxr4601aqryy','cmv50pc8r003plxr4z2j8e2sw','cmv50pc6v000elxr4bk7lb83o',0.1,'kg'),
('cmv50pc8s003zlxr49mw8z1ai','cmv50pc8s003xlxr4536uh6oa','cmv50pc6g0002lxr4m2yo6h41',0.45,'kg'),
('cmv50pc8s0040lxr4id7pa98f','cmv50pc8s003xlxr4536uh6oa','cmv50pc6l0006lxr46oszzxyt',0.045,'kg'),
('cmv50pc8s0041lxr4e6spa43d','cmv50pc8s003xlxr4536uh6oa','cmv50pc6p0009lxr4hw7495k1',0.3,'bungkus'),
('cmv50pc8s0042lxr4bpbw5039','cmv50pc8s003xlxr4536uh6oa','cmv50pc6o0008lxr4hannq9vm',0.045,'liter'),
('cmv50pc8s0043lxr4kyknoasq','cmv50pc8s003xlxr4536uh6oa','cmv50pc6n0007lxr47gucpggh',0.03,'kg'),
('cmv50pc8v0047lxr4vp2sfyh9','cmv50pc8v0045lxr4fy8tuzki','cmv50pc6g0002lxr4m2yo6h41',0.6749999999999999,'kg'),
('cmv50pc8v0048lxr4h0pf1b8r','cmv50pc8v0045lxr4fy8tuzki','cmv50pc6l0006lxr46oszzxyt',0.0675,'kg'),
('cmv50pc8v0049lxr4kiwg778y','cmv50pc8v0045lxr4fy8tuzki','cmv50pc6p0009lxr4hw7495k1',0.4500000000000001,'bungkus'),
('cmv50pc8v004alxr41eudf00e','cmv50pc8v0045lxr4fy8tuzki','cmv50pc6o0008lxr4hannq9vm',0.0675,'liter'),
('cmv50pc8v004blxr4e7zc70up','cmv50pc8v0045lxr4fy8tuzki','cmv50pc6n0007lxr47gucpggh',0.045,'kg'),
('cmv50pc8x004elxr47hlclgwh','cmv50pc8x004clxr4bieiiij8','cmv50pc6g0002lxr4m2yo6h41',0.3,'kg'),
('cmv50pc8x004flxr42ri703tf','cmv50pc8x004clxr4bieiiij8','cmv50pc6l0006lxr46oszzxyt',0.03,'kg'),
('cmv50pc8x004glxr46o6cfwkc','cmv50pc8x004clxr4bieiiij8','cmv50pc6p0009lxr4hw7495k1',0.2,'bungkus'),
('cmv50pc8x004hlxr42kya4p6y','cmv50pc8x004clxr4bieiiij8','cmv50pc6o0008lxr4hannq9vm',0.03,'liter'),
('cmv50pc8x004ilxr4qkyu80qc','cmv50pc8x004clxr4bieiiij8','cmv50pc6n0007lxr47gucpggh',0.02,'kg'),
('cmv50pc92004nlxr416a9lib8','cmv50pc92004llxr44vp03t8s','cmv50pc73000llxr4nne5nm2w',0.3,'kg'),
('cmv50pc92004olxr4l2dgw8cp','cmv50pc92004llxr44vp03t8s','cmv50pc6l0006lxr46oszzxyt',0.03,'kg'),
('cmv50pc92004plxr44u6f6dxs','cmv50pc92004llxr44vp03t8s','cmv50pc6p0009lxr4hw7495k1',0.2,'bungkus'),
('cmv50pc92004qlxr4qr8oxwgm','cmv50pc92004llxr44vp03t8s','cmv50pc6o0008lxr4hannq9vm',0.03,'liter'),
('cmv50pc92004rlxr493kqas8n','cmv50pc92004llxr44vp03t8s','cmv50pc6n0007lxr47gucpggh',0.02,'kg'),
('cmv50pc93004ulxr4z5bq1nuq','cmv50pc93004slxr4wzjy52va','cmv50pc72000klxr445ad4ob0',0.45,'kg'),
('cmv50pc93004vlxr4c4ensysp','cmv50pc93004slxr4wzjy52va','cmv50pc6l0006lxr46oszzxyt',0.045,'kg'),
('cmv50pc93004wlxr4w8q6qx65','cmv50pc93004slxr4wzjy52va','cmv50pc6p0009lxr4hw7495k1',0.3,'bungkus'),
('cmv50pc94004xlxr4jduv1ts5','cmv50pc93004slxr4wzjy52va','cmv50pc6o0008lxr4hannq9vm',0.045,'liter'),
('cmv50pc94004ylxr4gn6kbz2n','cmv50pc93004slxr4wzjy52va','cmv50pc6n0007lxr47gucpggh',0.03,'kg'),
('cmv50pc980052lxr4k7bx3hg9','cmv50pc980050lxr4ttq0oaox','cmv50pc6g0002lxr4m2yo6h41',0.6,'kg'),
('cmv50pc980053lxr4ihpsto0b','cmv50pc980050lxr4ttq0oaox','cmv50pc6k0005lxr4z8crph3i',0.04,'kg'),
('cmv50pc980054lxr4v874ap9j','cmv50pc980050lxr4ttq0oaox','cmv50pc6l0006lxr46oszzxyt',0.03,'kg'),
('cmv50pc980055lxr4o725j2lw','cmv50pc980050lxr4ttq0oaox','cmv50pc6w000flxr4aw7axxwt',0.12,'botol'),
('cmv50pc980056lxr4g2kbenw1','cmv50pc980050lxr4ttq0oaox','cmv50pc6o0008lxr4hannq9vm',0.04,'liter'),
('cmv50pc980057lxr4s6vc9s5q','cmv50pc980050lxr4ttq0oaox','cmv50pc6n0007lxr47gucpggh',0.03,'kg'),
('cmv50pc9b005blxr4luaql0bp','cmv50pc9b0059lxr44ifc6kqt','cmv50pc6g0002lxr4m2yo6h41',0.6,'kg'),
('cmv50pc9b005clxr4cmu07y6b','cmv50pc9b0059lxr44ifc6kqt','cmv50pc6k0005lxr4z8crph3i',0.04,'kg'),
('cmv50pc9b005dlxr4vi0os8u8','cmv50pc9b0059lxr44ifc6kqt','cmv50pc6l0006lxr46oszzxyt',0.03,'kg'),
('cmv50pc9b005elxr4u1zlbncw','cmv50pc9b0059lxr44ifc6kqt','cmv50pc6w000flxr4aw7axxwt',0.12,'botol'),
('cmv50pc9b005flxr47vamxana','cmv50pc9b0059lxr44ifc6kqt','cmv50pc6o0008lxr4hannq9vm',0.04,'liter'),
('cmv50pc9b005glxr40sfvmbnl','cmv50pc9b0059lxr44ifc6kqt','cmv50pc6n0007lxr47gucpggh',0.03,'kg'),
('cmv50pc9c005jlxr4g98eg2q4','cmv50pc9c005hlxr48gxaii6e','cmv50pc6g0002lxr4m2yo6h41',0.6,'kg'),
('cmv50pc9c005klxr4b86h0bnj','cmv50pc9c005hlxr48gxaii6e','cmv50pc6k0005lxr4z8crph3i',0.04,'kg'),
('cmv50pc9c005llxr4ns9ho036','cmv50pc9c005hlxr48gxaii6e','cmv50pc6l0006lxr46oszzxyt',0.03,'kg'),
('cmv50pc9c005mlxr4p0jrihpw','cmv50pc9c005hlxr48gxaii6e','cmv50pc6w000flxr4aw7axxwt',0.12,'botol'),
('cmv50pc9c005nlxr437r9afcf','cmv50pc9c005hlxr48gxaii6e','cmv50pc6o0008lxr4hannq9vm',0.04,'liter'),
('cmv50pc9c005olxr4p6659bcx','cmv50pc9c005hlxr48gxaii6e','cmv50pc6n0007lxr47gucpggh',0.03,'kg'),
('cmv50pc9h005tlxr4qhahsb2x','cmv50pc9h005rlxr4x9toqxe9','cmv50pc72000klxr445ad4ob0',0.8999999999999999,'kg'),
('cmv50pc9h005ulxr4jr2ki73s','cmv50pc9h005rlxr4x9toqxe9','cmv50pc6k0005lxr4z8crph3i',0.06,'kg'),
('cmv50pc9h005vlxr4sr8tzrbp','cmv50pc9h005rlxr4x9toqxe9','cmv50pc6l0006lxr46oszzxyt',0.045,'kg'),
('cmv50pc9h005wlxr4p94biizm','cmv50pc9h005rlxr4x9toqxe9','cmv50pc6w000flxr4aw7axxwt',0.18,'botol'),
('cmv50pc9h005xlxr4tu2rc459','cmv50pc9h005rlxr4x9toqxe9','cmv50pc6o0008lxr4hannq9vm',0.06,'liter'),
('cmv50pc9h005ylxr4l75vsd76','cmv50pc9h005rlxr4x9toqxe9','cmv50pc6n0007lxr47gucpggh',0.045,'kg'),
('cmv50pc9k0062lxr4rt8anlht','cmv50pc9k0060lxr4mhrj6eg4','cmv50pc6r000alxr4v5wrnrf5',1,'ikat'),
('cmv50pc9k0063lxr4wlowg2yi','cmv50pc9k0060lxr4mhrj6eg4','cmv50pc6s000blxr4q9r4eoll',1,'ikat'),
('cmv50pc9k0064lxr40q3xkm82','cmv50pc9k0060lxr4mhrj6eg4','cmv50pc6j0004lxr427a0aop1',1,'bungkus'),
('cmv50pc9k0065lxr47lvvg0qy','cmv50pc9k0060lxr4mhrj6eg4','cmv50pc6i0003lxr4dsa2ytrm',1,'papan'),
('cmv50pc9k0066lxr4mu1bv6en','cmv50pc9k0060lxr4mhrj6eg4','cmv50pc70000ilxr4um1wc5hy',1,'ikat'),
('cmv50pc9k0067lxr42d3alo2h','cmv50pc9k0060lxr4mhrj6eg4','cmv50pc6k0005lxr4z8crph3i',0.03,'kg'),
('cmv50pc9m006alxr44yvm3gff','cmv50pc9m0068lxr4joifaffr','cmv50pc6r000alxr4v5wrnrf5',2.25,'ikat'),
('cmv50pc9m006blxr4h836tha0','cmv50pc9m0068lxr4joifaffr','cmv50pc6s000blxr4q9r4eoll',2.25,'ikat'),
('cmv50pc9m006clxr4se6wph9y','cmv50pc9m0068lxr4joifaffr','cmv50pc6j0004lxr427a0aop1',2.25,'bungkus'),
('cmv50pc9m006dlxr42milmc6w','cmv50pc9m0068lxr4joifaffr','cmv50pc6i0003lxr4dsa2ytrm',2.25,'papan'),
('cmv50pc9m006elxr4mtz174sa','cmv50pc9m0068lxr4joifaffr','cmv50pc70000ilxr4um1wc5hy',2.25,'ikat'),
('cmv50pc9m006flxr4ogegayz3','cmv50pc9m0068lxr4joifaffr','cmv50pc6k0005lxr4z8crph3i',0.0675,'kg'),
('cmv50pc9o006ilxr4h8orocjv','cmv50pc9o006glxr4tq3rze1t','cmv50pc6r000alxr4v5wrnrf5',1,'ikat'),
('cmv50pc9o006jlxr4ub9cxodq','cmv50pc9o006glxr4tq3rze1t','cmv50pc6s000blxr4q9r4eoll',1,'ikat'),
('cmv50pc9o006klxr40w3ffo6r','cmv50pc9o006glxr4tq3rze1t','cmv50pc6j0004lxr427a0aop1',1,'bungkus'),
('cmv50pc9o006llxr436964ddk','cmv50pc9o006glxr4tq3rze1t','cmv50pc6i0003lxr4dsa2ytrm',1,'papan'),
('cmv50pc9o006mlxr4e7gpeuup','cmv50pc9o006glxr4tq3rze1t','cmv50pc70000ilxr4um1wc5hy',1,'ikat'),
('cmv50pc9o006nlxr43io0dkvz','cmv50pc9o006glxr4tq3rze1t','cmv50pc6k0005lxr4z8crph3i',0.03,'kg'),
('cmv50pc9z006xlxr4o4h53gwd','cmv50pc9z006vlxr4d43h6wb3','cmv50pc6j0004lxr427a0aop1',1.5,'bungkus'),
('cmv50pc9z006ylxr43r40zoej','cmv50pc9z006vlxr4d43h6wb3','cmv50pc6c0000lxr4xtvf5zz5',0.36,'kg'),
('cmv50pc9z006zlxr4deyaif0f','cmv50pc9z006vlxr4d43h6wb3','cmv50pc6k0005lxr4z8crph3i',0.045,'kg'),
('cmv50pc9z0070lxr42v9dxh8u','cmv50pc9z006vlxr4d43h6wb3','cmv50pc6w000flxr4aw7axxwt',0.15,'botol'),
('cmv50pc9z0071lxr4b4am1oke','cmv50pc9z006vlxr4d43h6wb3','cmv50pc6n0007lxr47gucpggh',0.03,'kg'),
('cmv50pca10074lxr4h24pyrs4','cmv50pca10072lxr4ko9md4mn','cmv50pc6j0004lxr427a0aop1',1,'bungkus'),
('cmv50pca10075lxr4typ36o73','cmv50pca10072lxr4ko9md4mn','cmv50pc6c0000lxr4xtvf5zz5',0.24,'kg'),
('cmv50pca10076lxr4jmas6rgj','cmv50pca10072lxr4ko9md4mn','cmv50pc6k0005lxr4z8crph3i',0.03,'kg'),
('cmv50pca10077lxr4k3cmaacn','cmv50pca10072lxr4ko9md4mn','cmv50pc6w000flxr4aw7axxwt',0.1,'botol'),
('cmv50pca10078lxr4raqojzc3','cmv50pca10072lxr4ko9md4mn','cmv50pc6n0007lxr47gucpggh',0.02,'kg'),
('cmv50pca3007blxr4p2y7yfd0','cmv50pca30079lxr4lwgtad26','cmv50pc6j0004lxr427a0aop1',1,'bungkus'),
('cmv50pca3007clxr4j3stvg3s','cmv50pca30079lxr4lwgtad26','cmv50pc6c0000lxr4xtvf5zz5',0.24,'kg'),
('cmv50pca3007dlxr4m6ym1hij','cmv50pca30079lxr4lwgtad26','cmv50pc6k0005lxr4z8crph3i',0.03,'kg'),
('cmv50pca3007elxr4mwlops44','cmv50pca30079lxr4lwgtad26','cmv50pc6w000flxr4aw7axxwt',0.1,'botol'),
('cmv50pca3007flxr4w7k7k510','cmv50pca30079lxr4lwgtad26','cmv50pc6n0007lxr47gucpggh',0.02,'kg'),
('cmv50pca3007glxr4ngrympll','cmv50pca30079lxr4lwgtad26','cmv50pc6e0001lxr4ekja2cse',0.06,'kg'),
('cmv50pca5007jlxr49gp2znlp','cmv50pca5007hlxr4edr9wr8x','cmv50pc6j0004lxr427a0aop1',1,'bungkus'),
('cmv50pca5007klxr4fz46oc7m','cmv50pca5007hlxr4edr9wr8x','cmv50pc6c0000lxr4xtvf5zz5',0.24,'kg'),
('cmv50pca5007llxr4xu2l7hmu','cmv50pca5007hlxr4edr9wr8x','cmv50pc6k0005lxr4z8crph3i',0.03,'kg'),
('cmv50pca5007mlxr4u1h4jjf5','cmv50pca5007hlxr4edr9wr8x','cmv50pc6w000flxr4aw7axxwt',0.1,'botol'),
('cmv50pca5007nlxr42lq8b328','cmv50pca5007hlxr4edr9wr8x','cmv50pc6n0007lxr47gucpggh',0.02,'kg'),
('cmv50pca5007olxr4jeplhvp5','cmv50pca5007hlxr4edr9wr8x','cmv50pc73000llxr4nne5nm2w',0.15,'kg'),
('cmv50pca8007slxr4xgh8b47k','cmv50pca8007qlxr4y4gtlzt4','cmv50pc6c0000lxr4xtvf5zz5',0.3,'kg'),
('cmv50pca8007tlxr4z4n4kqnd','cmv50pca8007qlxr4y4gtlzt4','cmv50pc6g0002lxr4m2yo6h41',0.4,'kg'),
('cmv50pca8007ulxr46iiu1tcm','cmv50pca8007qlxr4y4gtlzt4','cmv50pc6o0008lxr4hannq9vm',0.06,'liter'),
('cmv50pca8007vlxr458dro6o6','cmv50pca8007qlxr4y4gtlzt4','cmv50pc6k0005lxr4z8crph3i',0.04,'kg'),
('cmv50pca8007wlxr4k50cmyyn','cmv50pca8007qlxr4y4gtlzt4','cmv50pc6n0007lxr47gucpggh',0.04,'kg'),
('cmv50pca8007xlxr4ddltcfld','cmv50pca8007qlxr4y4gtlzt4','cmv50pc6l0006lxr46oszzxyt',0.03,'kg'),
('cmv50pcab0081lxr4xg1zvc04','cmv50pcab007zlxr4ozzisq50','cmv50pc6c0000lxr4xtvf5zz5',0.45,'kg'),
('cmv50pcab0082lxr4y4qk4xjm','cmv50pcab007zlxr4ozzisq50','cmv50pc6g0002lxr4m2yo6h41',0.6000000000000001,'kg'),
('cmv50pcab0083lxr4pyky2z9x','cmv50pcab007zlxr4ozzisq50','cmv50pc6o0008lxr4hannq9vm',0.09,'liter'),
('cmv50pcab0084lxr4t7kedq6d','cmv50pcab007zlxr4ozzisq50','cmv50pc6k0005lxr4z8crph3i',0.06,'kg'),
('cmv50pcab0085lxr4jl6xrsoc','cmv50pcab007zlxr4ozzisq50','cmv50pc6n0007lxr47gucpggh',0.06,'kg'),
('cmv50pcab0086lxr4d3r5jm2e','cmv50pcab007zlxr4ozzisq50','cmv50pc6l0006lxr46oszzxyt',0.045,'kg'),
('cmv50pcad0089lxr4nbgs23z4','cmv50pcac0087lxr493un8itc','cmv50pc6c0000lxr4xtvf5zz5',0.45,'kg'),
('cmv50pcad008alxr4446dqgy3','cmv50pcac0087lxr493un8itc','cmv50pc6g0002lxr4m2yo6h41',0.6000000000000001,'kg'),
('cmv50pcad008blxr490a1sfsu','cmv50pcac0087lxr493un8itc','cmv50pc6o0008lxr4hannq9vm',0.09,'liter'),
('cmv50pcad008clxr4bdxmbod6','cmv50pcac0087lxr493un8itc','cmv50pc6k0005lxr4z8crph3i',0.06,'kg'),
('cmv50pcad008dlxr4wvt5rgcj','cmv50pcac0087lxr493un8itc','cmv50pc6n0007lxr47gucpggh',0.06,'kg'),
('cmv50pcad008elxr4b8pof56d','cmv50pcac0087lxr493un8itc','cmv50pc6l0006lxr46oszzxyt',0.045,'kg'),
('cmv50pcaj008klxr4uti2wjkj','cmv50pcaj008ilxr41e0qqwal','cmv50pc6c0000lxr4xtvf5zz5',0.3,'kg'),
('cmv50pcaj008llxr4o8ib63fr','cmv50pcaj008ilxr41e0qqwal','cmv50pc72000klxr445ad4ob0',0.4,'kg'),
('cmv50pcaj008mlxr4oa0p9yfs','cmv50pcaj008ilxr41e0qqwal','cmv50pc6o0008lxr4hannq9vm',0.06,'liter'),
('cmv50pcaj008nlxr43rvkljxh','cmv50pcaj008ilxr41e0qqwal','cmv50pc6k0005lxr4z8crph3i',0.04,'kg'),
('cmv50pcaj008olxr45ipktbh2','cmv50pcaj008ilxr41e0qqwal','cmv50pc6n0007lxr47gucpggh',0.04,'kg'),
('cmv50pcaj008plxr4cwq5gfmo','cmv50pcaj008ilxr41e0qqwal','cmv50pc6l0006lxr46oszzxyt',0.03,'kg'),
('cmv50pcal008slxr44yzojaal','cmv50pcal008qlxr4953u53dl','cmv50pc6g0002lxr4m2yo6h41',0.8999999999999999,'kg'),
('cmv50pcal008tlxr4j1kniv79','cmv50pcal008qlxr4953u53dl','cmv50pc6w000flxr4aw7axxwt',0.18,'botol'),
('cmv50pcal008ulxr4cgsl2skm','cmv50pcal008qlxr4953u53dl','cmv50pc6k0005lxr4z8crph3i',0.06,'kg'),
('cmv50pcal008vlxr4suii68zs','cmv50pcal008qlxr4953u53dl','cmv50pc6l0006lxr46oszzxyt',0.045,'kg'),
('cmv50pcal008wlxr4skszxzuw','cmv50pcal008qlxr4953u53dl','cmv50pc6o0008lxr4hannq9vm',0.06,'liter'),
('cmv50pcal008xlxr4s8x2ruaz','cmv50pcal008qlxr4953u53dl','cmv50pc6n0007lxr47gucpggh',0.045,'kg'),
('cmv50pcas0094lxr4xgr3076a','cmv50pcas0092lxr49q4pcm02','cmv50pc6g0002lxr4m2yo6h41',0.8999999999999999,'kg'),
('cmv50pcas0095lxr4k0d9xu5v','cmv50pcas0092lxr49q4pcm02','cmv50pc6w000flxr4aw7axxwt',0.18,'botol'),
('cmv50pcas0096lxr4sr5qxckx','cmv50pcas0092lxr49q4pcm02','cmv50pc6k0005lxr4z8crph3i',0.06,'kg'),
('cmv50pcas0097lxr416bv2ri3','cmv50pcas0092lxr49q4pcm02','cmv50pc6l0006lxr46oszzxyt',0.045,'kg'),
('cmv50pcas0098lxr4nqzsao1p','cmv50pcas0092lxr49q4pcm02','cmv50pc6o0008lxr4hannq9vm',0.06,'liter'),
('cmv50pcas0099lxr4sr7ugu88','cmv50pcas0092lxr49q4pcm02','cmv50pc6n0007lxr47gucpggh',0.045,'kg'),
('cmv50pcas009alxr40nx1ovxg','cmv50pcas0092lxr49q4pcm02','cmv50pc6e0001lxr4ekja2cse',0.06,'kg'),
('cmv50pcau009dlxr40hfahntq','cmv50pcau009blxr44yv0gbsm','cmv50pc73000llxr4nne5nm2w',0.8999999999999999,'kg'),
('cmv50pcau009elxr4aeh7w27n','cmv50pcau009blxr44yv0gbsm','cmv50pc6w000flxr4aw7axxwt',0.18,'botol'),
('cmv50pcau009flxr444rwpkbm','cmv50pcau009blxr44yv0gbsm','cmv50pc6k0005lxr4z8crph3i',0.06,'kg'),
('cmv50pcau009glxr4g3khmwqt','cmv50pcau009blxr44yv0gbsm','cmv50pc6l0006lxr46oszzxyt',0.045,'kg'),
('cmv50pcau009hlxr47w8a763g','cmv50pcau009blxr44yv0gbsm','cmv50pc6o0008lxr4hannq9vm',0.06,'liter'),
('cmv50pcau009ilxr409k987lm','cmv50pcau009blxr44yv0gbsm','cmv50pc6n0007lxr47gucpggh',0.045,'kg'),
('cmv50pcaw009llxr43vn333pa','cmv50pcaw009jlxr4oc6hwdis','cmv50pc72000klxr445ad4ob0',0.6,'kg'),
('cmv50pcaw009mlxr4c8g7l9nj','cmv50pcaw009jlxr4oc6hwdis','cmv50pc6w000flxr4aw7axxwt',0.12,'botol'),
('cmv50pcaw009nlxr4n7j42xlc','cmv50pcaw009jlxr4oc6hwdis','cmv50pc6k0005lxr4z8crph3i',0.04,'kg'),
('cmv50pcaw009olxr4prtxxedh','cmv50pcaw009jlxr4oc6hwdis','cmv50pc6l0006lxr46oszzxyt',0.03,'kg'),
('cmv50pcaw009plxr4to4zq1tl','cmv50pcaw009jlxr4oc6hwdis','cmv50pc6o0008lxr4hannq9vm',0.04,'liter'),
('cmv50pcaw009qlxr4u7uyzvrd','cmv50pcaw009jlxr4oc6hwdis','cmv50pc6n0007lxr47gucpggh',0.03,'kg'),
('cmv50pcay009tlxr40tscavlw','cmv50pcay009rlxr42sjahft5','cmv50pc6y000glxr4a4xvus2c',0.8999999999999999,'kg'),
('cmv50pcay009ulxr4ab1r8b95','cmv50pcay009rlxr42sjahft5','cmv50pc6k0005lxr4z8crph3i',0.06,'kg'),
('cmv50pcay009vlxr40j4i55h8','cmv50pcay009rlxr42sjahft5','cmv50pc6n0007lxr47gucpggh',0.045,'kg'),
('cmv50pcay009wlxr4kgtv8xsq','cmv50pcay009rlxr42sjahft5','cmv50pc6o0008lxr4hannq9vm',0.06,'liter'),
('cmv50pcay009xlxr4fjdyqi3o','cmv50pcay009rlxr42sjahft5','cmv50pc6l0006lxr46oszzxyt',0.03,'kg'),
('cmv50pcay009ylxr43kq1ek62','cmv50pcay009rlxr42sjahft5','cmv50pc6v000elxr4bk7lb83o',0.15,'kg'),
('cmv50pcb600a5lxr4s5kb8rhc','cmv50pcb600a3lxr4rwu99p8z','cmv50pc6y000glxr4a4xvus2c',0.6,'kg'),
('cmv50pcb600a6lxr4yd6dbfjl','cmv50pcb600a3lxr4rwu99p8z','cmv50pc6k0005lxr4z8crph3i',0.04,'kg'),
('cmv50pcb600a7lxr4ivoir5o0','cmv50pcb600a3lxr4rwu99p8z','cmv50pc6n0007lxr47gucpggh',0.03,'kg'),
('cmv50pcb600a8lxr4dgpnfhv2','cmv50pcb600a3lxr4rwu99p8z','cmv50pc6o0008lxr4hannq9vm',0.04,'liter'),
('cmv50pcb600a9lxr4le97rbcd','cmv50pcb600a3lxr4rwu99p8z','cmv50pc6l0006lxr46oszzxyt',0.02,'kg'),
('cmv50pcb600aalxr4h75lqllg','cmv50pcb600a3lxr4rwu99p8z','cmv50pc6v000elxr4bk7lb83o',0.1,'kg'),
('cmv50pcb600ablxr4eobej4r1','cmv50pcb600a3lxr4rwu99p8z','cmv50pc6e0001lxr4ekja2cse',0.06,'kg'),
('cmv50pcb700aelxr4zvyjz9n4','cmv50pcb700aclxr4umor2l9x','cmv50pc73000llxr4nne5nm2w',0.6,'kg'),
('cmv50pcb700aflxr4dva5kob0','cmv50pcb700aclxr4umor2l9x','cmv50pc6k0005lxr4z8crph3i',0.04,'kg'),
('cmv50pcb700aglxr4l1x3jz7b','cmv50pcb700aclxr4umor2l9x','cmv50pc6n0007lxr47gucpggh',0.03,'kg'),
('cmv50pcb700ahlxr4auv65z4v','cmv50pcb700aclxr4umor2l9x','cmv50pc6o0008lxr4hannq9vm',0.04,'liter'),
('cmv50pcb700ailxr4kk2f5rgk','cmv50pcb700aclxr4umor2l9x','cmv50pc6l0006lxr46oszzxyt',0.02,'kg'),
('cmv50pcb700ajlxr4viiz01u3','cmv50pcb700aclxr4umor2l9x','cmv50pc6v000elxr4bk7lb83o',0.1,'kg');
/*!40000 ALTER TABLE `RecipeItem` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `local_foods`
--

DROP TABLE IF EXISTS `local_foods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `local_foods` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `category` varchar(191) NOT NULL,
  `avg_price_idr` int(11) NOT NULL,
  `calories` double NOT NULL,
  `protein_g` double NOT NULL,
  `fat_g` double NOT NULL,
  `carbs_g` double NOT NULL,
  `fiber_g` double NOT NULL,
  `availability` varchar(191) DEFAULT NULL,
  `is_budget_friendly` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `local_foods`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `local_foods` WRITE;
/*!40000 ALTER TABLE `local_foods` DISABLE KEYS */;
INSERT INTO `local_foods` VALUES
(1,'Nasi Putih','pokok',3000,260,4.4,0.4,57,0.6,'warteg',1,'2026-10-12 08:56:15.449'),
(2,'Nasi Uduk Polos','pokok',5000,290,4.5,7.5,51,0.8,'angkringan',1,'2026-10-12 08:56:15.450'),
(3,'Nasi Kucing','pokok',3000,180,3.5,4,32,0.5,'angkringan',1,'2026-10-12 08:56:15.453'),
(4,'Lontong','pokok',4000,180,3.2,0.5,40,1.2,'warteg',1,'2026-10-12 08:56:15.454'),
(5,'Mie Instan Goreng','pokok',3500,380,8,14,52,2,'masak_sendiri',1,'2026-10-12 08:56:15.456'),
(6,'Mie Instan Kuah','pokok',3500,350,7.5,12,50,2,'masak_sendiri',1,'2026-10-12 08:56:15.457'),
(7,'Indomie Goreng Telur','pokok',8000,530,18,24,55,2,'burjo',1,'2026-10-12 08:56:15.459'),
(8,'Indomie Kuah Telur','pokok',8000,500,17,22,53,2,'burjo',1,'2026-10-12 08:56:15.461'),
(9,'Indomie Double','pokok',10000,760,16,28,104,4,'burjo',1,'2026-10-12 08:56:15.462'),
(10,'Roti Selai Kacang','pokok',3000,250,8,10,32,2,'masak_sendiri',1,'2026-10-12 08:56:15.463'),
(11,'Roti Bakar Coklat Keju','pokok',8000,320,7,14,42,1.5,'angkringan',1,'2026-10-12 08:56:15.465'),
(12,'Bubur Ayam','pokok',10000,350,14,10,48,1.5,'angkringan',1,'2026-10-12 08:56:15.466'),
(13,'Tempe Goreng','lauk',3000,200,18,10,8,3,'warteg',1,'2026-10-12 08:56:15.467'),
(14,'Tempe Bacem','lauk',3000,180,16,6,15,3.5,'warteg',1,'2026-10-12 08:56:15.469'),
(15,'Tempe Orek','lauk',3000,190,13,8,16,2.8,'warteg',1,'2026-10-12 08:56:15.470'),
(16,'Tempe Mendoan','lauk',5000,250,14,15,16,2.5,'angkringan',1,'2026-10-12 08:56:15.472'),
(17,'Tahu Goreng','lauk',3000,170,12,10,6,1.5,'warteg',1,'2026-10-12 08:56:15.473'),
(18,'Tahu Bacem','lauk',3000,150,11,5,14,1.8,'warteg',1,'2026-10-12 08:56:15.474'),
(19,'Tahu Isi','lauk',5000,210,9,13,15,1.5,'angkringan',1,'2026-10-12 08:56:15.475'),
(20,'Telur Dadar','lauk',4000,160,11,12.5,1.5,0,'warteg',1,'2026-10-12 08:56:15.476'),
(21,'Telur Ceplok','lauk',4000,145,12,10.5,0.8,0,'burjo',1,'2026-10-12 08:56:15.478'),
(22,'Telur Balado','lauk',4000,150,10.5,10,3.5,0.5,'warteg',1,'2026-10-12 08:56:15.479'),
(23,'Telur Rebus','lauk',4000,155,14,10,1,0,'masak_sendiri',1,'2026-10-12 08:56:15.480'),
(24,'Orak-arik Telur','lauk',3000,170,12,13,1,0,'masak_sendiri',1,'2026-10-12 08:56:15.481'),
(25,'Ayam Goreng','lauk',10000,290,25,18,5,0,'warteg',1,'2026-10-12 08:56:15.482'),
(26,'Ayam Suwir Pedas','lauk',7000,180,22,8,4,0.5,'warteg',1,'2026-10-12 08:56:15.484'),
(27,'Ati Ampela Goreng','lauk',4000,160,18,9,1,0,'angkringan',1,'2026-10-12 08:56:15.486'),
(28,'Sate Usus Ayam','lauk',5000,180,12,14,2,0,'angkringan',1,'2026-10-12 08:56:15.488'),
(29,'Ikan Tongkol Balado','lauk',7000,210,24,10,3,0.4,'warteg',1,'2026-10-12 08:56:15.489'),
(30,'Ikan Kembung Goreng','lauk',8000,230,23,13,1,0,'warteg',1,'2026-10-12 08:56:15.490'),
(31,'Ikan Lele Goreng','lauk',8000,240,20,15,2,0,'kantin',1,'2026-10-12 08:56:15.492'),
(32,'Sarden Kaleng','lauk',7000,200,18,12,4,0.5,'masak_sendiri',1,'2026-10-12 08:56:15.493'),
(33,'Kornet Sapi Kaleng','lauk',8000,190,15,13,3,0,'masak_sendiri',1,'2026-10-12 08:56:15.494'),
(34,'Nugget Goreng','lauk',6000,250,12,16,15,0.5,'masak_sendiri',1,'2026-10-12 08:56:15.495'),
(35,'Sosis Goreng','lauk',5000,220,10,18,5,0,'masak_sendiri',1,'2026-10-12 08:56:15.496'),
(36,'Perkedel Kentang','lauk',4000,220,5,12,22,2,'warteg',1,'2026-10-12 08:56:15.498'),
(37,'Sayur Bayam Bening','sayur',3000,40,3,0.5,6,4,'warteg',1,'2026-10-12 08:56:15.499'),
(38,'Tumis Kangkung','sayur',3000,65,3,3.5,6,3.5,'warteg',1,'2026-10-12 08:56:15.500'),
(39,'Sayur Asem','sayur',3000,75,2.8,1.2,14,3.8,'warteg',1,'2026-10-12 08:56:15.502'),
(40,'Sayur Sop','sayur',3000,60,3,1,10,3,'warteg',1,'2026-10-12 08:56:15.503'),
(41,'Sayur Lodeh','sayur',3000,110,3.5,6,12,3,'warteg',1,'2026-10-12 08:56:15.504'),
(42,'Tumis Buncis Wortel','sayur',3000,70,2.5,2.8,10,3.5,'warteg',1,'2026-10-12 08:56:15.506'),
(43,'Tumis Tauge Tahu','sayur',3000,85,5.5,4,7,2.5,'warteg',1,'2026-10-12 08:56:15.507'),
(44,'Capcay Kuah','sayur',4000,95,4,3.5,12,4.2,'warteg',1,'2026-10-12 08:56:15.508'),
(45,'Urap Sayur','sayur',4000,130,4,7,14,5.5,'warteg',1,'2026-10-12 08:56:15.509'),
(46,'Sambal Goreng Kentang Teri','sayur',4000,180,5,8,22,2,'warteg',1,'2026-10-12 08:56:15.510'),
(47,'Lalapan (timun, kemangi, kol)','sayur',2000,20,1,0.2,4,2,'kantin',1,'2026-10-12 08:56:15.512'),
(48,'Paket Hemat (nasi + tempe + sayur)','paket',10000,460,22,11,71,6.5,'warteg',1,'2026-10-12 08:56:15.513'),
(49,'Paket Komplit (nasi + ayam + sayur)','paket',15000,590,32,19,68,4.5,'warteg',1,'2026-10-12 08:56:15.515'),
(50,'Nasi Goreng Telur','paket',10000,480,14,18,62,2,'burjo',1,'2026-10-12 08:56:15.516'),
(51,'Nasi Goreng Spesial','paket',13000,580,20,24,65,2.5,'burjo',1,'2026-10-12 08:56:15.518'),
(52,'Nasi Ayam Geprek','paket',13000,620,28,24,70,1.5,'kantin',1,'2026-10-12 08:56:15.519'),
(53,'Nasi Ayam Penyet','paket',14000,600,30,22,65,3,'kantin',1,'2026-10-12 08:56:15.520'),
(54,'Pecel Lele Nasi','paket',13000,560,26,22,62,3,'kantin',1,'2026-10-12 08:56:15.521'),
(55,'Nasi Padang Rendang','paket',15000,650,28,28,68,3,'kantin',1,'2026-10-12 08:56:15.523'),
(56,'Nasi Kuning Komplit','paket',8000,420,12,14,60,1.5,'angkringan',1,'2026-10-12 08:56:15.524'),
(57,'Sego Kucing (3 bungkus)','paket',9000,540,10.5,12,96,1.5,'angkringan',1,'2026-10-12 08:56:15.525'),
(58,'Mie Ayam Bakso','paket',12000,450,18,14,58,2,'kantin',1,'2026-10-12 08:56:15.526'),
(59,'Bakso Urat','paket',12000,380,20,12,45,1.5,'kantin',1,'2026-10-12 08:56:15.527'),
(60,'Soto Ayam Nasi','paket',12000,480,22,16,58,2,'kantin',1,'2026-10-12 08:56:15.528'),
(61,'Rawon Nasi','paket',15000,520,26,18,60,2.5,'kantin',1,'2026-10-12 08:56:15.530'),
(62,'Gado-gado Lontong','paket',12000,420,16,18,48,6,'kantin',1,'2026-10-12 08:56:15.531'),
(63,'Ketoprak','paket',10000,400,14,16,50,4,'angkringan',1,'2026-10-12 08:56:15.532'),
(64,'Nasi Telur Mie Instan','paket',6000,680,22,24,95,2.5,'masak_sendiri',1,'2026-10-12 08:56:15.533'),
(65,'Gorengan Campur (3 buah)','snack',3000,300,5,18,30,2,'angkringan',1,'2026-10-12 08:56:15.535'),
(66,'Pisang Goreng (2 buah)','snack',4000,200,2,8,30,2,'angkringan',1,'2026-10-12 08:56:15.536'),
(67,'Risoles (2 buah)','snack',5000,240,6,14,24,1,'kantin',1,'2026-10-12 08:56:15.537'),
(68,'Martabak Telur Mini (1 porsi)','snack',8000,350,14,18,32,1,'angkringan',1,'2026-10-12 08:56:15.538'),
(69,'Cilok Bumbu Kacang (1 porsi)','snack',5000,200,5,8,28,1.5,'angkringan',1,'2026-10-12 08:56:15.540'),
(70,'Batagor (1 porsi)','snack',8000,280,10,14,28,1.5,'kantin',1,'2026-10-12 08:56:15.541'),
(71,'Siomay Bandung (1 porsi)','snack',10000,300,14,12,32,2,'kantin',1,'2026-10-12 08:56:15.543'),
(72,'Seblak (1 porsi)','snack',8000,320,8,10,48,2,'angkringan',1,'2026-10-12 08:56:15.544'),
(73,'Kentang Goreng (1 porsi)','snack',7000,280,3,15,35,3,'angkringan',1,'2026-10-12 08:56:15.545'),
(74,'Roti Sobek Coklat (1 bungkus)','snack',5000,280,5,8,48,1.5,'minimarket',1,'2026-10-12 08:56:15.547'),
(75,'Pisang (2 buah)','buah',3000,180,2.2,0.6,46,5.2,'angkringan',1,'2026-10-12 08:56:15.548'),
(76,'Pepaya Potong (1 porsi)','buah',5000,60,0.8,0.2,15,2.5,'kantin',1,'2026-10-12 08:56:15.549'),
(77,'Jeruk (2 buah)','buah',5000,90,1.8,0.2,22,4.6,'minimarket',1,'2026-10-12 08:56:15.550'),
(78,'Semangka Potong (1 porsi)','buah',5000,45,0.9,0.2,11.5,0.6,'kantin',1,'2026-10-12 08:56:15.552'),
(79,'Es Teh Manis','minuman',3000,80,0,0,20,0,'warteg',1,'2026-10-12 08:56:15.553'),
(80,'Teh Anget','minuman',2000,40,0,0,10,0,'angkringan',1,'2026-10-12 08:56:15.554'),
(81,'Kopi Sachet Gula','minuman',2000,90,0.5,2,18,0,'masak_sendiri',1,'2026-10-12 08:56:15.555'),
(82,'Es Jeruk','minuman',5000,100,0.5,0,25,0.3,'kantin',1,'2026-10-12 08:56:15.556'),
(83,'Susu UHT Kotak (200ml)','minuman',5000,120,6,5,12,0,'minimarket',1,'2026-10-12 08:56:15.558'),
(84,'Air Mineral Gelas','minuman',1000,0,0,0,0,0,'warteg',1,'2026-10-12 08:56:15.559'),
(85,'Pop Ice','minuman',5000,130,1,3,25,0,'burjo',1,'2026-10-12 08:56:15.560'),
(86,'Ikan Lele Goreng','lauk',8000,240,18,15,5,0,'warteg',1,'2026-10-12 08:56:15.561'),
(87,'Ikan Nila Bakar','lauk',12000,200,22,10,2,0,'warteg',0,'2026-10-12 08:56:15.562'),
(88,'Sayur Lodeh','sayur',4000,150,4,10,12,3,'warteg',1,'2026-10-12 08:56:15.563'),
(89,'Sayur Asem','sayur',4000,80,2,1,15,4,'warteg',1,'2026-10-12 08:56:15.564'),
(90,'Tumis Kangkung','sayur',4000,110,3,7,8,3.5,'warteg',1,'2026-10-12 08:56:15.565'),
(91,'Tahu Isi Goreng','snack',2000,130,4,8,10,1.5,'angkringan',1,'2026-10-12 08:56:15.566'),
(92,'Bakwan Sayur','snack',1500,140,2,9,12,1,'angkringan',1,'2026-10-12 08:56:15.568'),
(93,'Pisang Goreng','snack',2000,180,1,8,25,2,'angkringan',1,'2026-10-12 08:56:15.570'),
(94,'Sate Ayam (5 tusuk)','lauk',10000,220,15,12,10,0.5,'angkringan',1,'2026-10-12 08:56:15.571'),
(95,'Sate Usus','lauk',2000,90,8,6,1,0,'angkringan',1,'2026-10-12 08:56:15.573'),
(96,'Sate Telur Puyuh','lauk',3000,110,8,8,1,0,'angkringan',1,'2026-10-12 08:56:15.574'),
(97,'Nasi Rames Lengkap','paket',15000,650,25,20,85,6,'warteg',1,'2026-10-12 08:56:15.575'),
(98,'Gado-Gado','paket',12000,450,18,22,45,8,'warteg',1,'2026-10-12 08:56:15.576'),
(99,'Ketoprak','paket',12000,520,15,25,60,5,'warteg',1,'2026-10-12 08:56:15.578'),
(100,'Salad Buah Lokal','buah',10000,150,2,5,25,4,'kantin',1,'2026-10-12 08:56:15.579');
/*!40000 ALTER TABLE `local_foods` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `nutrition_history`
--

DROP TABLE IF EXISTS `nutrition_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `nutrition_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `foods` text NOT NULL,
  `calories` double NOT NULL DEFAULT 0,
  `protein_g` double NOT NULL DEFAULT 0,
  `fat_g` double NOT NULL DEFAULT 0,
  `carbs_g` double NOT NULL DEFAULT 0,
  `fiber_g` double NOT NULL DEFAULT 0,
  `logged_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `nutrition_history_user_id_logged_at_idx` (`user_id`,`logged_at`),
  CONSTRAINT `nutrition_history_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nutrition_history`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `nutrition_history` WRITE;
/*!40000 ALTER TABLE `nutrition_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `nutrition_history` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(191) DEFAULT NULL,
  `name` varchar(191) DEFAULT NULL,
  `image` text DEFAULT NULL,
  `provider` varchar(191) DEFAULT NULL,
  `provider_id` varchar(191) DEFAULT NULL,
  `gender` varchar(191) DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `weight_kg` double DEFAULT NULL,
  `height_cm` double DEFAULT NULL,
  `activity_level` varchar(191) DEFAULT NULL,
  `daily_calorie_target` int(11) DEFAULT NULL,
  `daily_protein_target` int(11) DEFAULT NULL,
  `daily_fat_target` int(11) DEFAULT NULL,
  `daily_carb_target` int(11) DEFAULT NULL,
  `daily_fiber_target` int(11) DEFAULT NULL,
  `bmr` double DEFAULT NULL,
  `tdee` double DEFAULT NULL,
  `monthly_food_budget` int(11) DEFAULT NULL,
  `profile_updated_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,'guest@gizikost.local','Teman Kost',NULL,NULL,NULL,'male',20,60,170,'light',2250,84,62,337,25,1540,2117.5,900000,NULL,'2026-10-12 08:56:15.445');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-10-12 17:05:56

/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.4.3-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: nba_stats
-- ------------------------------------------------------
-- Server version	11.4.3-MariaDB-1

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
-- Table structure for table `players`
--

DROP TABLE IF EXISTS `players`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `players` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `team` varchar(255) DEFAULT NULL,
  `number` float DEFAULT NULL,
  `position` varchar(50) DEFAULT NULL,
  `age` float DEFAULT NULL,
  `height` varchar(10) DEFAULT NULL,
  `weight` float DEFAULT NULL,
  `college` varchar(255) DEFAULT NULL,
  `salary` float DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=458 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `players`
--

LOCK TABLES `players` WRITE;
/*!40000 ALTER TABLE `players` DISABLE KEYS */;
INSERT INTO `players` VALUES
(1,'Avery Bradley','Boston Celtics',0,'PG',25,'6-2',180,'Texas',7730340),
(2,'Jae Crowder','Boston Celtics',99,'SF',25,'6-6',235,'Marquette',6796120),
(3,'John Holland','Boston Celtics',30,'SG',27,'6-5',205,'Boston University',NULL),
(4,'R.J. Hunter','Boston Celtics',28,'SG',22,'6-5',185,'Georgia State',1148640),
(5,'Jonas Jerebko','Boston Celtics',8,'PF',29,'6-10',231,'',5000000),
(6,'Amir Johnson','Boston Celtics',90,'PF',29,'6-9',240,'',12000000),
(7,'Jordan Mickey','Boston Celtics',55,'PF',21,'6-8',235,'LSU',1170960),
(8,'Kelly Olynyk','Boston Celtics',41,'C',25,'7-0',238,'Gonzaga',2165160),
(9,'Terry Rozier','Boston Celtics',12,'PG',22,'6-2',190,'Louisville',1824360),
(10,'Marcus Smart','Boston Celtics',36,'PG',22,'6-4',220,'Oklahoma State',3431040),
(11,'Jared Sullinger','Boston Celtics',7,'C',24,'6-9',260,'Ohio State',2569260),
(12,'Isaiah Thomas','Boston Celtics',4,'PG',27,'5-9',185,'Washington',6912870),
(13,'Evan Turner','Boston Celtics',11,'SG',27,'6-7',220,'Ohio State',3425510),
(14,'James Young','Boston Celtics',13,'SG',20,'6-6',215,'Kentucky',1749840),
(15,'Tyler Zeller','Boston Celtics',44,'C',26,'7-0',253,'North Carolina',2616980),
(16,'Bojan Bogdanovic','Brooklyn Nets',44,'SG',27,'6-8',216,'',3425510),
(17,'Markel Brown','Brooklyn Nets',22,'SG',24,'6-3',190,'Oklahoma State',845059),
(18,'Wayne Ellington','Brooklyn Nets',21,'SG',28,'6-4',200,'North Carolina',1500000),
(19,'Rondae Hollis-Jefferson','Brooklyn Nets',24,'SG',21,'6-7',220,'Arizona',1335480),
(20,'Jarrett Jack','Brooklyn Nets',2,'PG',32,'6-3',200,'Georgia Tech',6300000),
(21,'Sergey Karasev','Brooklyn Nets',10,'SG',22,'6-7',208,'',1599840),
(22,'Sean Kilpatrick','Brooklyn Nets',6,'SG',26,'6-4',219,'Cincinnati',134215),
(23,'Shane Larkin','Brooklyn Nets',0,'PG',23,'5-11',175,'Miami (FL)',1500000),
(24,'Brook Lopez','Brooklyn Nets',11,'C',28,'7-0',275,'Stanford',19689000),
(25,'Chris McCullough','Brooklyn Nets',1,'PF',21,'6-11',200,'Syracuse',1140240),
(26,'Willie Reed','Brooklyn Nets',33,'PF',26,'6-10',220,'Saint Louis',947276),
(27,'Thomas Robinson','Brooklyn Nets',41,'PF',25,'6-10',237,'Kansas',981348),
(28,'Henry Sims','Brooklyn Nets',14,'C',26,'6-10',248,'Georgetown',947276),
(29,'Donald Sloan','Brooklyn Nets',15,'PG',28,'6-3',205,'Texas A&M',947276),
(30,'Thaddeus Young','Brooklyn Nets',30,'PF',27,'6-8',221,'Georgia Tech',11236000),
(31,'Arron Afflalo','New York Knicks',4,'SG',30,'6-5',210,'UCLA',8000000),
(32,'Lou Amundson','New York Knicks',17,'PF',33,'6-9',220,'UNLV',1635480),
(33,'Thanasis Antetokounmpo','New York Knicks',43,'SF',23,'6-7',205,'',30888),
(34,'Carmelo Anthony','New York Knicks',7,'SF',32,'6-8',240,'Syracuse',22875000),
(35,'Jose Calderon','New York Knicks',3,'PG',34,'6-3',200,'',7402810),
(36,'Cleanthony Early','New York Knicks',11,'SF',25,'6-8',210,'Wichita State',845059),
(37,'Langston Galloway','New York Knicks',2,'SG',24,'6-2',200,'Saint Joseph\'s',845059),
(38,'Jerian Grant','New York Knicks',13,'PG',23,'6-4',195,'Notre Dame',1572360),
(39,'Robin Lopez','New York Knicks',8,'C',28,'7-0',255,'Stanford',12650000),
(40,'Kyle O\'Quinn','New York Knicks',9,'PF',26,'6-10',250,'Norfolk State',3750000),
(41,'Kristaps Porzingis','New York Knicks',6,'PF',20,'7-3',240,'',4131720),
(42,'Kevin Seraphin','New York Knicks',1,'C',26,'6-10',278,'',2814000),
(43,'Lance Thomas','New York Knicks',42,'SF',28,'6-8',235,'Duke',1636840),
(44,'Sasha Vujacic','New York Knicks',18,'SG',32,'6-7',195,'',947276),
(45,'Derrick Williams','New York Knicks',23,'PF',25,'6-8',240,'Arizona',4000000),
(46,'Tony Wroten','New York Knicks',5,'SG',23,'6-6',205,'Washington',167406),
(47,'Elton Brand','Philadelphia 76ers',42,'PF',37,'6-9',254,'Duke',NULL),
(48,'Isaiah Canaan','Philadelphia 76ers',0,'PG',25,'6-0',201,'Murray State',947276),
(49,'Robert Covington','Philadelphia 76ers',33,'SF',25,'6-9',215,'Tennessee State',1000000),
(50,'Joel Embiid','Philadelphia 76ers',21,'C',22,'7-0',250,'Kansas',4626960),
(51,'Jerami Grant','Philadelphia 76ers',39,'SF',22,'6-8',210,'Syracuse',845059),
(52,'Richaun Holmes','Philadelphia 76ers',22,'PF',22,'6-10',245,'Bowling Green',1074170),
(53,'Carl Landry','Philadelphia 76ers',7,'PF',32,'6-9',248,'Purdue',6500000),
(54,'Kendall Marshall','Philadelphia 76ers',5,'PG',24,'6-4',200,'North Carolina',2144770),
(55,'T.J. McConnell','Philadelphia 76ers',12,'PG',24,'6-2',200,'Arizona',525093),
(56,'Nerlens Noel','Philadelphia 76ers',4,'PF',22,'6-11',228,'Kentucky',3457800),
(57,'Jahlil Okafor','Philadelphia 76ers',8,'C',20,'6-11',275,'Duke',4582680),
(58,'Ish Smith','Philadelphia 76ers',1,'PG',27,'6-0',175,'Wake Forest',947276),
(59,'Nik Stauskas','Philadelphia 76ers',11,'SG',22,'6-6',205,'Michigan',2869440),
(60,'Hollis Thompson','Philadelphia 76ers',31,'SG',25,'6-8',206,'Georgetown',947276),
(61,'Christian Wood','Philadelphia 76ers',35,'PF',20,'6-11',220,'UNLV',525093),
(62,'Bismack Biyombo','Toronto Raptors',8,'C',23,'6-9',245,'',2814000),
(63,'Bruno Caboclo','Toronto Raptors',20,'SF',20,'6-9',205,'',1524000),
(64,'DeMarre Carroll','Toronto Raptors',5,'SF',29,'6-8',212,'Missouri',13600000),
(65,'DeMar DeRozan','Toronto Raptors',10,'SG',26,'6-7',220,'USC',10050000),
(66,'James Johnson','Toronto Raptors',3,'PF',29,'6-9',250,'Wake Forest',2500000),
(67,'Cory Joseph','Toronto Raptors',6,'PG',24,'6-3',190,'Texas',7000000),
(68,'Kyle Lowry','Toronto Raptors',7,'PG',30,'6-0',205,'Villanova',12000000),
(69,'Lucas Nogueira','Toronto Raptors',92,'C',23,'7-0',220,'',1842000),
(70,'Patrick Patterson','Toronto Raptors',54,'PF',27,'6-9',235,'Kentucky',6268680),
(71,'Norman Powell','Toronto Raptors',24,'SG',23,'6-4',215,'UCLA',650000),
(72,'Terrence Ross','Toronto Raptors',31,'SF',25,'6-7',195,'Washington',3553920),
(73,'Luis Scola','Toronto Raptors',4,'PF',36,'6-9',240,'',2900000),
(74,'Jason Thompson','Toronto Raptors',1,'PF',29,'6-11',250,'Rider',245177),
(75,'Jonas Valanciunas','Toronto Raptors',17,'C',24,'7-0',255,'',4660480),
(76,'Delon Wright','Toronto Raptors',55,'PG',24,'6-5',190,'Utah',1509360),
(77,'Leandro Barbosa','Golden State Warriors',19,'SG',33,'6-3',194,'',2500000),
(78,'Harrison Barnes','Golden State Warriors',40,'SF',24,'6-8',225,'North Carolina',3873400),
(79,'Andrew Bogut','Golden State Warriors',12,'C',31,'7-0',260,'Utah',13800000),
(80,'Ian Clark','Golden State Warriors',21,'SG',25,'6-3',175,'Belmont',947276),
(81,'Stephen Curry','Golden State Warriors',30,'PG',28,'6-3',190,'Davidson',11370800),
(82,'Festus Ezeli','Golden State Warriors',31,'C',26,'6-11',265,'Vanderbilt',2008750),
(83,'Draymond Green','Golden State Warriors',23,'PF',26,'6-7',230,'Michigan State',14260900),
(84,'Andre Iguodala','Golden State Warriors',9,'SF',32,'6-6',215,'Arizona',11710500),
(85,'Shaun Livingston','Golden State Warriors',34,'PG',30,'6-7',192,'',5543720),
(86,'Kevon Looney','Golden State Warriors',36,'SF',20,'6-9',220,'UCLA',1131960),
(87,'James Michael McAdoo','Golden State Warriors',20,'SF',23,'6-9',240,'North Carolina',845059),
(88,'Brandon Rush','Golden State Warriors',4,'SF',30,'6-6',220,'Kansas',1270960),
(89,'Marreese Speights','Golden State Warriors',5,'C',28,'6-10',255,'Florida',3815000),
(90,'Klay Thompson','Golden State Warriors',11,'SG',26,'6-7',215,'Washington State',15501000),
(91,'Anderson Varejao','Golden State Warriors',18,'PF',33,'6-11',273,'',289755),
(92,'Cole Aldrich','Los Angeles Clippers',45,'C',27,'6-11',250,'Kansas',1100600),
(93,'Jeff Ayres','Los Angeles Clippers',19,'PF',29,'6-9',250,'Arizona State',111444),
(94,'Jamal Crawford','Los Angeles Clippers',11,'SG',36,'6-5',195,'Michigan',5675000),
(95,'Branden Dawson','Los Angeles Clippers',22,'SF',23,'6-6',225,'Michigan State',525093),
(96,'Jeff Green','Los Angeles Clippers',8,'SF',29,'6-9',235,'Georgetown',9650000),
(97,'Blake Griffin','Los Angeles Clippers',32,'PF',27,'6-10',251,'Oklahoma',18907700),
(98,'Wesley Johnson','Los Angeles Clippers',33,'SF',28,'6-7',215,'Syracuse',1100600),
(99,'DeAndre Jordan','Los Angeles Clippers',6,'C',27,'6-11',265,'Texas A&M',19689000),
(100,'Luc Richard Mbah a Moute','Los Angeles Clippers',12,'PF',29,'6-8',230,'UCLA',947276),
(101,'Chris Paul','Los Angeles Clippers',3,'PG',31,'6-0',175,'Wake Forest',21468700),
(102,'Paul Pierce','Los Angeles Clippers',34,'SF',38,'6-7',235,'Kansas',3376000),
(103,'Pablo Prigioni','Los Angeles Clippers',9,'PG',39,'6-3',185,'',947726),
(104,'JJ Redick','Los Angeles Clippers',4,'SG',31,'6-4',190,'Duke',7085000),
(105,'Austin Rivers','Los Angeles Clippers',25,'PG',23,'6-4',200,'Duke',3110800),
(106,'C.J. Wilcox','Los Angeles Clippers',30,'SG',25,'6-5',195,'Washington',1159680),
(107,'Brandon Bass','Los Angeles Lakers',2,'PF',31,'6-8',250,'LSU',3000000),
(108,'Tarik Black','Los Angeles Lakers',28,'C',24,'6-9',250,'Kansas',845059),
(109,'Anthony Brown','Los Angeles Lakers',3,'SF',23,'6-7',210,'Stanford',700000),
(110,'Kobe Bryant','Los Angeles Lakers',24,'SF',37,'6-6',212,'',25000000),
(111,'Jordan Clarkson','Los Angeles Lakers',6,'PG',24,'6-5',194,'Missouri',845059),
(112,'Roy Hibbert','Los Angeles Lakers',17,'C',29,'7-2',270,'Georgetown',15592200),
(113,'Marcelo Huertas','Los Angeles Lakers',9,'PG',33,'6-3',200,'',525093),
(114,'Ryan Kelly','Los Angeles Lakers',4,'PF',25,'6-11',230,'Duke',1724250),
(115,'Larry Nance Jr.','Los Angeles Lakers',7,'PF',23,'6-9',230,'Wyoming',1155600),
(116,'Julius Randle','Los Angeles Lakers',30,'PF',21,'6-9',250,'Kentucky',3132240),
(117,'D\'Angelo Russell','Los Angeles Lakers',1,'PG',20,'6-5',195,'Ohio State',5103120),
(118,'Robert Sacre','Los Angeles Lakers',50,'C',27,'7-0',270,'Gonzaga',981348),
(119,'Louis Williams','Los Angeles Lakers',23,'SG',29,'6-1',175,'',7000000),
(120,'Metta World Peace','Los Angeles Lakers',37,'SF',36,'6-7',260,'St. John\'s',947276),
(121,'Nick Young','Los Angeles Lakers',0,'SF',31,'6-7',210,'USC',5219170),
(122,'Eric Bledsoe','Phoenix Suns',2,'PG',26,'6-1',190,'Kentucky',13500000),
(123,'Devin Booker','Phoenix Suns',1,'SG',19,'6-6',206,'Kentucky',2127840),
(124,'Chase Budinger','Phoenix Suns',10,'SF',28,'6-7',209,'Arizona',206192),
(125,'Tyson Chandler','Phoenix Suns',4,'C',33,'7-1',240,'',13000000),
(126,'Archie Goodwin','Phoenix Suns',20,'SG',21,'6-5',200,'Kentucky',1160160),
(127,'John Jenkins','Phoenix Suns',23,'SG',25,'6-4',215,'Vanderbilt',981348),
(128,'Brandon Knight','Phoenix Suns',3,'PG',24,'6-3',189,'Kentucky',13500000),
(129,'Alex Len','Phoenix Suns',21,'C',22,'7-1',260,'Maryland',3807120),
(130,'Jon Leuer','Phoenix Suns',30,'PF',27,'6-10',228,'Wisconsin',1035000),
(131,'Phil Pressey','Phoenix Suns',25,'PG',25,'5-11',175,'Missouri',55722),
(132,'Ronnie Price','Phoenix Suns',14,'PG',32,'6-2',190,'Utah Valley',947276),
(133,'Mirza Teletovic','Phoenix Suns',35,'PF',30,'6-9',242,'',5500000),
(134,'P.J. Tucker','Phoenix Suns',17,'SF',31,'6-6',245,'Texas',5500000),
(135,'T.J. Warren','Phoenix Suns',12,'SF',22,'6-8',230,'North Carolina State',2041080),
(136,'Alan Williams','Phoenix Suns',15,'C',23,'6-8',260,'UC Santa Barbara',83397),
(137,'Quincy Acy','Sacramento Kings',13,'SF',25,'6-7',240,'Baylor',981348),
(138,'James Anderson','Sacramento Kings',5,'SG',27,'6-6',213,'Oklahoma State',1015420),
(139,'Marco Belinelli','Sacramento Kings',3,'SG',30,'6-5',210,'',6060610),
(140,'Caron Butler','Sacramento Kings',31,'SF',36,'6-7',228,'Connecticut',1449190),
(141,'Omri Casspi','Sacramento Kings',18,'SF',27,'6-9',225,'',2836190),
(142,'Willie Cauley-Stein','Sacramento Kings',0,'C',22,'7-0',240,'Kentucky',3398280),
(143,'Darren Collison','Sacramento Kings',7,'PG',28,'6-0',175,'UCLA',5013560),
(144,'DeMarcus Cousins','Sacramento Kings',15,'C',25,'6-11',270,'Kentucky',15852000),
(145,'Seth Curry','Sacramento Kings',30,'SG',25,'6-2',185,'Duke',947276),
(146,'Duje Dukan','Sacramento Kings',26,'PF',24,'6-9',220,'Wisconsin',525093),
(147,'Rudy Gay','Sacramento Kings',8,'SF',29,'6-8',230,'Connecticut',12403100),
(148,'Kosta Koufos','Sacramento Kings',41,'C',27,'7-0',265,'Ohio State',7700000),
(149,'Ben McLemore','Sacramento Kings',23,'SG',23,'6-5',195,'Kansas',3156600),
(150,'Eric Moreland','Sacramento Kings',25,'PF',24,'6-10',238,'Oregon State',845059),
(151,'Rajon Rondo','Sacramento Kings',9,'PG',30,'6-1',186,'Kentucky',9500000),
(152,'Cameron Bairstow','Chicago Bulls',41,'PF',25,'6-9',250,'New Mexico',845059),
(153,'Aaron Brooks','Chicago Bulls',0,'PG',31,'6-0',161,'Oregon',2250000),
(154,'Jimmy Butler','Chicago Bulls',21,'SG',26,'6-7',220,'Marquette',16407500),
(155,'Mike Dunleavy','Chicago Bulls',34,'SG',35,'6-9',230,'Duke',4500000),
(156,'Cristiano Felicio','Chicago Bulls',6,'PF',23,'6-10',275,'',525093),
(157,'Pau Gasol','Chicago Bulls',16,'C',35,'7-0',250,'',7448760),
(158,'Taj Gibson','Chicago Bulls',22,'PF',30,'6-9',225,'USC',8500000),
(159,'Justin Holiday','Chicago Bulls',7,'SG',27,'6-6',185,'Washington',947276),
(160,'Doug McDermott','Chicago Bulls',3,'SF',24,'6-8',225,'Creighton',2380440),
(161,'Nikola Mirotic','Chicago Bulls',44,'PF',25,'6-10',220,'',5543720),
(162,'E\'Twaun Moore','Chicago Bulls',55,'SG',27,'6-4',191,'Purdue',1015420),
(163,'Joakim Noah','Chicago Bulls',13,'C',31,'6-11',232,'Florida',13400000),
(164,'Bobby Portis','Chicago Bulls',5,'PF',21,'6-11',230,'Arkansas',1391160),
(165,'Derrick Rose','Chicago Bulls',1,'PG',27,'6-3',190,'Memphis',20093100),
(166,'Tony Snell','Chicago Bulls',20,'SF',24,'6-7',200,'New Mexico',1535880),
(167,'Matthew Dellavedova','Cleveland Cavaliers',8,'PG',25,'6-4',198,'Saint Mary\'s',1147280),
(168,'Channing Frye','Cleveland Cavaliers',9,'PF',33,'6-11',255,'Arizona',8193030),
(169,'Kyrie Irving','Cleveland Cavaliers',2,'PG',24,'6-3',193,'Duke',16407500),
(170,'LeBron James','Cleveland Cavaliers',23,'SF',31,'6-8',250,'',22970500),
(171,'Richard Jefferson','Cleveland Cavaliers',24,'SF',35,'6-7',233,'Arizona',947276),
(172,'Dahntay Jones','Cleveland Cavaliers',30,'SG',35,'6-6',225,'Duke',NULL),
(173,'James Jones','Cleveland Cavaliers',1,'SG',35,'6-8',218,'Miami (FL)',947276),
(174,'Sasha Kaun','Cleveland Cavaliers',14,'C',31,'6-11',260,'Kansas',1276000),
(175,'Kevin Love','Cleveland Cavaliers',0,'PF',27,'6-10',251,'UCLA',19689000),
(176,'Jordan McRae','Cleveland Cavaliers',12,'SG',25,'6-5',179,'Tennessee',111196),
(177,'Timofey Mozgov','Cleveland Cavaliers',20,'C',29,'7-1',275,'',4950000),
(178,'Iman Shumpert','Cleveland Cavaliers',4,'SG',25,'6-5',220,'Georgia Tech',8988760),
(179,'J.R. Smith','Cleveland Cavaliers',5,'SG',30,'6-6',225,'',5000000),
(180,'Tristan Thompson','Cleveland Cavaliers',13,'C',25,'6-9',238,'Texas',14260900),
(181,'Mo Williams','Cleveland Cavaliers',52,'PG',33,'6-1',198,'Alabama',2100000),
(182,'Joel Anthony','Detroit Pistons',50,'C',33,'6-9',245,'UNLV',2500000),
(183,'Aron Baynes','Detroit Pistons',12,'C',29,'6-10',260,'Washington State',6500000),
(184,'Steve Blake','Detroit Pistons',22,'PG',36,'6-3',172,'Maryland',2170460),
(185,'Lorenzo Brown','Detroit Pistons',17,'PG',25,'6-5',189,'North Carolina State',111444),
(186,'Reggie Bullock','Detroit Pistons',25,'SF',25,'6-7',205,'North Carolina',1252440),
(187,'Kentavious Caldwell-Pope','Detroit Pistons',5,'SG',23,'6-5',205,'Georgia',2891760),
(188,'Spencer Dinwiddie','Detroit Pistons',8,'PG',23,'6-6',200,'Colorado',845059),
(189,'Andre Drummond','Detroit Pistons',0,'C',22,'6-11',279,'Connecticut',3272090),
(190,'Tobias Harris','Detroit Pistons',34,'SF',23,'6-9',235,'Tennessee',16000000),
(191,'Darrun Hilliard','Detroit Pistons',6,'SF',23,'6-6',205,'Villanova',600000),
(192,'Reggie Jackson','Detroit Pistons',1,'PG',26,'6-3',208,'Boston College',13913000),
(193,'Stanley Johnson','Detroit Pistons',3,'SF',20,'6-7',245,'Arizona',2841960),
(194,'Jodie Meeks','Detroit Pistons',20,'SG',28,'6-4',210,'Kentucky',6270000),
(195,'Marcus Morris','Detroit Pistons',13,'PF',26,'6-9',235,'Kansas',5000000),
(196,'Anthony Tolliver','Detroit Pistons',43,'PF',31,'6-8',240,'Creighton',3000000),
(197,'Lavoy Allen','Indiana Pacers',5,'PF',27,'6-9',255,'Temple',4050000),
(198,'Rakeem Christmas','Indiana Pacers',25,'PF',24,'6-9',250,'Syracuse',1007030),
(199,'Monta Ellis','Indiana Pacers',11,'SG',30,'6-3',185,'',10300000),
(200,'Paul George','Indiana Pacers',13,'SF',26,'6-9',220,'Fresno State',17120100),
(201,'George Hill','Indiana Pacers',3,'PG',30,'6-3',188,'IUPUI',8000000),
(202,'Jordan Hill','Indiana Pacers',27,'C',28,'6-10',235,'Arizona',4000000),
(203,'Solomon Hill','Indiana Pacers',44,'SF',25,'6-7',225,'Arizona',1358880),
(204,'Ty Lawson','Indiana Pacers',10,'PG',28,'5-11',195,'North Carolina',211744),
(205,'Ian Mahinmi','Indiana Pacers',28,'C',29,'6-11',250,'',4000000),
(206,'C.J. Miles','Indiana Pacers',0,'SF',29,'6-6',231,'',4394220),
(207,'Glenn Robinson III','Indiana Pacers',40,'SG',22,'6-7',222,'Michigan',1100000),
(208,'Rodney Stuckey','Indiana Pacers',2,'PG',30,'6-5',205,'Eastern Washington',7000000),
(209,'Myles Turner','Indiana Pacers',33,'PF',20,'6-11',243,'Texas',2357760),
(210,'Shayne Whittington','Indiana Pacers',42,'PF',25,'6-11',250,'Western Michigan',845059),
(211,'Joe Young','Indiana Pacers',1,'PG',23,'6-2',180,'Oregon',1007030),
(212,'Giannis Antetokounmpo','Milwaukee Bucks',34,'SF',21,'6-11',222,'',1953960),
(213,'Jerryd Bayless','Milwaukee Bucks',19,'PG',27,'6-3',200,'Arizona',3000000),
(214,'Michael Carter-Williams','Milwaukee Bucks',5,'PG',24,'6-6',190,'Syracuse',2399040),
(215,'Jared Cunningham','Milwaukee Bucks',9,'SG',25,'6-4',195,'Oregon State',947276),
(216,'Tyler Ennis','Milwaukee Bucks',11,'PG',21,'6-3',194,'Syracuse',1662360),
(217,'John Henson','Milwaukee Bucks',31,'PF',25,'6-11',229,'North Carolina',2943220),
(218,'Damien Inglis','Milwaukee Bucks',17,'SF',21,'6-8',246,'',855000),
(219,'O.J. Mayo','Milwaukee Bucks',3,'SG',28,'6-5',210,'USC',8000000),
(220,'Khris Middleton','Milwaukee Bucks',22,'SG',24,'6-8',234,'Texas A&M',14700000),
(221,'Greg Monroe','Milwaukee Bucks',15,'C',26,'6-11',265,'Georgetown',16407500),
(222,'Steve Novak','Milwaukee Bucks',6,'SF',32,'6-10',225,'Marquette',295327),
(223,'Johnny O\'Bryant III','Milwaukee Bucks',77,'PF',23,'6-9',257,'LSU',845059),
(224,'Jabari Parker','Milwaukee Bucks',12,'PF',21,'6-8',250,'Duke',5152440),
(225,'Miles Plumlee','Milwaukee Bucks',18,'C',27,'6-11',249,'Duke',2109290),
(226,'Greivis Vasquez','Milwaukee Bucks',21,'PG',29,'6-6',217,'Maryland',6600000),
(227,'Rashad Vaughn','Milwaukee Bucks',20,'SG',19,'6-6',202,'UNLV',1733040),
(228,'Justin Anderson','Dallas Mavericks',1,'SG',22,'6-6',228,'Virginia',1449000),
(229,'J.J. Barea','Dallas Mavericks',5,'PG',31,'6-0',185,'Northeastern',4290000),
(230,'Jeremy Evans','Dallas Mavericks',21,'SF',28,'6-9',200,'Western Kentucky',1100600),
(231,'Raymond Felton','Dallas Mavericks',2,'PG',31,'6-1',205,'North Carolina',3950310),
(232,'Devin Harris','Dallas Mavericks',34,'PG',33,'6-3',185,'Wisconsin',4053450),
(233,'David Lee','Dallas Mavericks',42,'PF',33,'6-9',245,'Florida',2085670),
(234,'Wesley Matthews','Dallas Mavericks',23,'SG',29,'6-5',220,'Marquette',16407500),
(235,'JaVale McGee','Dallas Mavericks',11,'C',28,'7-0',270,'Nevada',1270960),
(236,'Salah Mejri','Dallas Mavericks',50,'C',29,'7-2',245,'',525093),
(237,'Dirk Nowitzki','Dallas Mavericks',41,'PF',37,'7-0',245,'',8333330),
(238,'Zaza Pachulia','Dallas Mavericks',27,'C',32,'6-11',275,'',5200000),
(239,'Chandler Parsons','Dallas Mavericks',25,'SF',27,'6-10',230,'Florida',15361500),
(240,'Dwight Powell','Dallas Mavericks',7,'PF',24,'6-11',240,'Stanford',845059),
(241,'Charlie Villanueva','Dallas Mavericks',3,'PF',31,'6-11',232,'Connecticut',947276),
(242,'Deron Williams','Dallas Mavericks',8,'PG',31,'6-3',200,'Illinois',5378970),
(243,'Trevor Ariza','Houston Rockets',1,'SF',30,'6-8',215,'UCLA',8193030),
(244,'Michael Beasley','Houston Rockets',8,'SF',27,'6-10',235,'Kansas State',306527),
(245,'Patrick Beverley','Houston Rockets',2,'PG',27,'6-1',185,'Arkansas',6486490),
(246,'Corey Brewer','Houston Rockets',33,'SG',30,'6-9',186,'Florida',8229380),
(247,'Clint Capela','Houston Rockets',15,'PF',22,'6-10',240,'',1242720),
(248,'Sam Dekker','Houston Rockets',7,'SF',22,'6-9',230,'Wisconsin',1646400),
(249,'Andrew Goudelock','Houston Rockets',0,'PG',27,'6-3',200,'Charleston',200600),
(250,'James Harden','Houston Rockets',13,'SG',26,'6-5',220,'Arizona State',15756400),
(251,'Montrezl Harrell','Houston Rockets',35,'PF',22,'6-8',240,'Louisville',1000000),
(252,'Dwight Howard','Houston Rockets',12,'C',30,'6-11',265,'',22359400),
(253,'Terrence Jones','Houston Rockets',6,'PF',24,'6-9',252,'Kentucky',2489530),
(254,'K.J. McDaniels','Houston Rockets',32,'SG',23,'6-6',205,'Clemson',3189790),
(255,'Donatas Motiejunas','Houston Rockets',20,'PF',25,'7-0',222,'',2288200),
(256,'Josh Smith','Houston Rockets',5,'C',30,'6-9',225,'',947276),
(257,'Jason Terry','Houston Rockets',31,'SG',38,'6-2',185,'Arizona',947276),
(258,'Jordan Adams','Memphis Grizzlies',3,'SG',21,'6-5',209,'UCLA',1404600),
(259,'Tony Allen','Memphis Grizzlies',9,'SG',34,'6-4',213,'Oklahoma State',5158540),
(260,'Chris Andersen','Memphis Grizzlies',7,'PF',37,'6-10',245,'Blinn College',5000000),
(261,'Matt Barnes','Memphis Grizzlies',22,'SF',36,'6-7',226,'UCLA',3542500),
(262,'Vince Carter','Memphis Grizzlies',15,'SG',39,'6-6',220,'North Carolina',4088020),
(263,'Mike Conley','Memphis Grizzlies',11,'PG',28,'6-1',175,'Ohio State',9588430),
(264,'Bryce Cotton','Memphis Grizzlies',8,'PG',23,'6-1',165,'Providence',700902),
(265,'Jordan Farmar','Memphis Grizzlies',4,'PG',29,'6-2',180,'UCLA',NULL),
(266,'Marc Gasol','Memphis Grizzlies',33,'C',31,'7-1',255,'',19688000),
(267,'JaMychal Green','Memphis Grizzlies',0,'PF',25,'6-9',227,'Alabama',845059),
(268,'P.J. Hairston','Memphis Grizzlies',19,'SF',23,'6-6',230,'North Carolina',1201440),
(269,'Jarell Martin','Memphis Grizzlies',10,'PF',22,'6-10',239,'LSU',1230840),
(270,'Ray McCallum','Memphis Grizzlies',5,'PG',24,'6-3',190,'Detroit',NULL),
(271,'Xavier Munford','Memphis Grizzlies',14,'PG',24,'6-3',180,'Rhode Island',NULL),
(272,'Zach Randolph','Memphis Grizzlies',50,'PF',34,'6-9',260,'Michigan State',9638560),
(273,'Lance Stephenson','Memphis Grizzlies',1,'SF',25,'6-5',230,'Cincinnati',9000000),
(274,'Alex Stepheson','Memphis Grizzlies',35,'PF',28,'6-10',270,'USC',NULL),
(275,'Brandan Wright','Memphis Grizzlies',34,'PF',28,'6-10',210,'North Carolina',5464000),
(276,'Alexis Ajinca','New Orleans Pelicans',42,'C',28,'7-2',248,'',4389610),
(277,'Ryan Anderson','New Orleans Pelicans',33,'PF',28,'6-10',240,'California',8500000),
(278,'Omer Asik','New Orleans Pelicans',3,'C',29,'7-0',255,'',9213480),
(279,'Luke Babbitt','New Orleans Pelicans',8,'SF',26,'6-9',225,'Nevada',1100600),
(280,'Norris Cole','New Orleans Pelicans',30,'PG',27,'6-2',175,'Cleveland State',3036930),
(281,'Dante Cunningham','New Orleans Pelicans',44,'PF',29,'6-8',230,'Villanova',2850000),
(282,'Anthony Davis','New Orleans Pelicans',23,'PF',23,'6-10',253,'Kentucky',7070730),
(283,'Bryce Dejean-Jones','New Orleans Pelicans',31,'SG',23,'6-6',203,'Iowa State',169883),
(284,'Toney Douglas','New Orleans Pelicans',16,'PG',30,'6-2',195,'Florida State',1164860),
(285,'James Ennis','New Orleans Pelicans',4,'SF',25,'6-7',210,'Long Beach State',845059),
(286,'Tyreke Evans','New Orleans Pelicans',1,'SG',26,'6-6',220,'Memphis',10734600),
(287,'Tim Frazier','New Orleans Pelicans',2,'PG',25,'6-1',170,'Penn State',845059),
(288,'Alonzo Gee','New Orleans Pelicans',15,'SF',29,'6-6',225,'Alabama',1320000),
(289,'Eric Gordon','New Orleans Pelicans',10,'SG',27,'6-4',215,'Indiana',15514000),
(290,'Jordan Hamilton','New Orleans Pelicans',25,'SG',25,'6-7',220,'Texas',1015420),
(291,'Jrue Holiday','New Orleans Pelicans',11,'PG',25,'6-4',205,'UCLA',10595500),
(292,'Orlando Johnson','New Orleans Pelicans',0,'SG',27,'6-5',220,'UC Santa Barbara',55722),
(293,'Kendrick Perkins','New Orleans Pelicans',5,'C',31,'6-10',270,'',947276),
(294,'Quincy Pondexter','New Orleans Pelicans',20,'SF',28,'6-7',220,'Washington',3382020),
(295,'LaMarcus Aldridge','San Antonio Spurs',12,'PF',30,'6-11',240,'Texas',19689000),
(296,'Kyle Anderson','San Antonio Spurs',1,'SF',22,'6-9',230,'UCLA',1142880),
(297,'Matt Bonner','San Antonio Spurs',15,'C',36,'6-10',235,'Florida',947276),
(298,'Boris Diaw','San Antonio Spurs',33,'C',34,'6-8',250,'',7500000),
(299,'Tim Duncan','San Antonio Spurs',21,'C',40,'6-11',250,'Wake Forest',5250000),
(300,'Manu Ginobili','San Antonio Spurs',20,'SG',38,'6-6',205,'',2814000),
(301,'Danny Green','San Antonio Spurs',14,'SG',28,'6-6',215,'North Carolina',10000000),
(302,'Kawhi Leonard','San Antonio Spurs',2,'SF',24,'6-7',230,'San Diego State',16407500),
(303,'Boban Marjanovic','San Antonio Spurs',40,'C',27,'7-3',290,'',1200000),
(304,'Kevin Martin','San Antonio Spurs',23,'SG',33,'6-7',199,'Western Carolina',200600),
(305,'Andre Miller','San Antonio Spurs',24,'PG',40,'6-3',200,'Utah',250750),
(306,'Patty Mills','San Antonio Spurs',8,'PG',27,'6-0',185,'Saint Mary\'s',3578950),
(307,'Tony Parker','San Antonio Spurs',9,'PG',34,'6-2',185,'',13437500),
(308,'Jonathon Simmons','San Antonio Spurs',17,'SG',26,'6-6',195,'Houston',525093),
(309,'David West','San Antonio Spurs',30,'PF',35,'6-9',250,'Xavier',1499190),
(310,'Kent Bazemore','Atlanta Hawks',24,'SF',26,'6-5',201,'Old Dominion',2000000),
(311,'Tim Hardaway Jr.','Atlanta Hawks',10,'SG',24,'6-6',205,'Michigan',1304520),
(312,'Kirk Hinrich','Atlanta Hawks',12,'SG',35,'6-4',190,'Kansas',2854940),
(313,'Al Horford','Atlanta Hawks',15,'C',30,'6-10',245,'Florida',12000000),
(314,'Kris Humphries','Atlanta Hawks',43,'PF',31,'6-9',235,'Minnesota',1000000),
(315,'Kyle Korver','Atlanta Hawks',26,'SG',35,'6-7',212,'Creighton',5746480),
(316,'Paul Millsap','Atlanta Hawks',4,'PF',31,'6-8',246,'Louisiana Tech',18671700),
(317,'Mike Muscala','Atlanta Hawks',31,'PF',24,'6-11',240,'Bucknell',947276),
(318,'Lamar Patterson','Atlanta Hawks',13,'SG',24,'6-5',225,'Pittsburgh',525093),
(319,'Dennis Schroder','Atlanta Hawks',17,'PG',22,'6-1',172,'',1763400),
(320,'Mike Scott','Atlanta Hawks',32,'PF',27,'6-8',237,'Virginia',3333330),
(321,'Thabo Sefolosha','Atlanta Hawks',25,'SF',32,'6-7',220,'',4000000),
(322,'Tiago Splitter','Atlanta Hawks',11,'C',31,'6-11',245,'',9756250),
(323,'Walter Tavares','Atlanta Hawks',22,'C',24,'7-3',260,'',1000000),
(324,'Jeff Teague','Atlanta Hawks',0,'PG',27,'6-2',186,'Wake Forest',8000000),
(325,'Nicolas Batum','Charlotte Hornets',5,'SG',27,'6-8',200,'',13125300),
(326,'Troy Daniels','Charlotte Hornets',30,'SG',24,'6-4',205,'Virginia Commonwealth',947276),
(327,'Jorge Gutierrez','Charlotte Hornets',12,'PG',27,'6-3',189,'California',189455),
(328,'Tyler Hansbrough','Charlotte Hornets',50,'PF',30,'6-9',250,'North Carolina',947276),
(329,'Aaron Harrison','Charlotte Hornets',9,'SG',21,'6-6',210,'Kentucky',525093),
(330,'Spencer Hawes','Charlotte Hornets',0,'PF',28,'7-1',245,'Washington',6110030),
(331,'Al Jefferson','Charlotte Hornets',25,'C',31,'6-10',289,'',13500000),
(332,'Frank Kaminsky III','Charlotte Hornets',44,'C',23,'7-0',240,'Wisconsin',2612520),
(333,'Michael Kidd-Gilchrist','Charlotte Hornets',14,'SF',22,'6-7',232,'Kentucky',6331400),
(334,'Jeremy Lamb','Charlotte Hornets',3,'SG',24,'6-5',185,'Connecticut',3034360),
(335,'Courtney Lee','Charlotte Hornets',1,'SG',30,'6-5',200,'Western Kentucky',5675000),
(336,'Jeremy Lin','Charlotte Hornets',7,'PG',27,'6-3',200,'Harvard',2139000),
(337,'Kemba Walker','Charlotte Hornets',15,'PG',26,'6-1',184,'Connecticut',12000000),
(338,'Marvin Williams','Charlotte Hornets',2,'PF',29,'6-9',237,'North Carolina',7000000),
(339,'Cody Zeller','Charlotte Hornets',40,'C',23,'7-0',240,'Indiana',4204200),
(340,'Chris Bosh','Miami Heat',1,'PF',32,'6-11',235,'Georgia Tech',22192700),
(341,'Luol Deng','Miami Heat',9,'SF',31,'6-9',220,'Duke',10151600),
(342,'Goran Dragic','Miami Heat',7,'PG',30,'6-3',190,'',14783000),
(343,'Gerald Green','Miami Heat',14,'SF',30,'6-7',205,'',947276),
(344,'Udonis Haslem','Miami Heat',40,'PF',36,'6-8',235,'Florida',2854940),
(345,'Joe Johnson','Miami Heat',2,'SF',34,'6-7',240,'Arkansas',261894),
(346,'Tyler Johnson','Miami Heat',8,'SG',24,'6-4',186,'Fresno State',845059),
(347,'Josh McRoberts','Miami Heat',4,'PF',29,'6-10',240,'Duke',5543720),
(348,'Josh Richardson','Miami Heat',0,'SG',22,'6-6',200,'Tennessee',525093),
(349,'Amar\'e Stoudemire','Miami Heat',5,'PF',33,'6-10',245,'',947276),
(350,'Dwyane Wade','Miami Heat',3,'SG',34,'6-4',220,'Marquette',20000000),
(351,'Briante Weber','Miami Heat',12,'PG',23,'6-2',165,'Virginia Commonwealth',NULL),
(352,'Hassan Whiteside','Miami Heat',21,'C',26,'7-0',265,'Marshall',981348),
(353,'Justise Winslow','Miami Heat',20,'SF',20,'6-7',225,'Duke',2481720),
(354,'Dorell Wright','Miami Heat',11,'SF',30,'6-9',205,'',NULL),
(355,'Dewayne Dedmon','Orlando Magic',3,'C',26,'7-0',245,'USC',947276),
(356,'Evan Fournier','Orlando Magic',10,'SG',23,'6-7',205,'',2288200),
(357,'Aaron Gordon','Orlando Magic',0,'PF',20,'6-9',220,'Arizona',4171680),
(358,'Mario Hezonja','Orlando Magic',23,'SG',21,'6-8',218,'',3741480),
(359,'Ersan Ilyasova','Orlando Magic',7,'PF',29,'6-10',235,'',7900000),
(360,'Brandon Jennings','Orlando Magic',55,'PG',26,'6-1',169,'',8344500),
(361,'Devyn Marble','Orlando Magic',11,'SF',23,'6-6',200,'Iowa',845059),
(362,'Shabazz Napier','Orlando Magic',13,'PG',24,'6-1',175,'Connecticut',1294440),
(363,'Andrew Nicholson','Orlando Magic',44,'PF',26,'6-9',250,'St. Bonaventure',2380590),
(364,'Victor Oladipo','Orlando Magic',5,'SG',24,'6-4',210,'Indiana',5192520),
(365,'Elfrid Payton','Orlando Magic',4,'PG',22,'6-4',185,'Louisiana-Lafayette',2505720),
(366,'Jason Smith','Orlando Magic',14,'PF',30,'7-0',240,'Colorado State',4300000),
(367,'Nikola Vucevic','Orlando Magic',9,'C',25,'7-0',260,'USC',11250000),
(368,'C.J. Watson','Orlando Magic',32,'PG',32,'6-2',175,'Tennessee',5000000),
(369,'Alan Anderson','Washington Wizards',6,'SG',33,'6-6',220,'Michigan State',4000000),
(370,'Bradley Beal','Washington Wizards',3,'SG',22,'6-5',207,'Florida',5694670),
(371,'Jared Dudley','Washington Wizards',1,'SF',30,'6-7',225,'Boston College',4375000),
(372,'Jarell Eddie','Washington Wizards',8,'SG',24,'6-7',218,'Virginia Tech',561716),
(373,'Drew Gooden','Washington Wizards',90,'PF',34,'6-10',250,'Kansas',3300000),
(374,'Marcin Gortat','Washington Wizards',13,'C',32,'6-11',240,'',11217400),
(375,'JJ Hickson','Washington Wizards',21,'C',27,'6-9',242,'North Carolina State',273038),
(376,'Nene Hilario','Washington Wizards',42,'C',33,'6-11',250,'',13000000),
(377,'Markieff Morris','Washington Wizards',5,'PF',26,'6-10',245,'Kansas',8000000),
(378,'Kelly Oubre Jr.','Washington Wizards',12,'SF',20,'6-7',205,'Kansas',1920240),
(379,'Otto Porter Jr.','Washington Wizards',22,'SF',23,'6-8',198,'Georgetown',4662960),
(380,'Ramon Sessions','Washington Wizards',7,'PG',30,'6-3',190,'Nevada',2170460),
(381,'Garrett Temple','Washington Wizards',17,'SG',30,'6-6',195,'LSU',1100600),
(382,'Marcus Thornton','Washington Wizards',15,'SF',29,'6-4',205,'LSU',200600),
(383,'John Wall','Washington Wizards',2,'PG',25,'6-4',195,'Kentucky',15852000),
(384,'Darrell Arthur','Denver Nuggets',0,'PF',28,'6-9',235,'Kansas',2814000),
(385,'D.J. Augustin','Denver Nuggets',12,'PG',28,'6-0',183,'Texas',3000000),
(386,'Will Barton','Denver Nuggets',5,'SF',25,'6-6',175,'Memphis',3533330),
(387,'Wilson Chandler','Denver Nuggets',21,'SF',29,'6-8',225,'DePaul',10449400),
(388,'Kenneth Faried','Denver Nuggets',35,'PF',26,'6-8',228,'Morehead State',11236000),
(389,'Danilo Gallinari','Denver Nuggets',8,'SF',27,'6-10',225,'',14000000),
(390,'Gary Harris','Denver Nuggets',14,'SG',21,'6-4',210,'Michigan State',1584480),
(391,'Nikola Jokic','Denver Nuggets',15,'C',21,'6-10',250,'',1300000),
(392,'Joffrey Lauvergne','Denver Nuggets',77,'C',24,'6-11',220,'',1709720),
(393,'Mike Miller','Denver Nuggets',3,'SG',36,'6-8',218,'Florida',947276),
(394,'Emmanuel Mudiay','Denver Nuggets',0,'PG',20,'6-5',200,'',3102240),
(395,'Jameer Nelson','Denver Nuggets',1,'PG',34,'6-0',190,'Saint Joseph\'s',4345000),
(396,'Jusuf Nurkic','Denver Nuggets',23,'C',21,'7-0',280,'',1842000),
(397,'JaKarr Sampson','Denver Nuggets',9,'SG',23,'6-9',214,'St. John\'s',258489),
(398,'Axel Toupane','Denver Nuggets',6,'SG',23,'6-7',210,'',NULL),
(399,'Nemanja Bjelica','Minnesota Timberwolves',88,'PF',28,'6-10',240,'',3950000),
(400,'Gorgui Dieng','Minnesota Timberwolves',5,'C',26,'6-11',241,'Louisville',1474440),
(401,'Kevin Garnett','Minnesota Timberwolves',21,'PF',40,'6-11',240,'',8500000),
(402,'Tyus Jones','Minnesota Timberwolves',1,'PG',20,'6-2',195,'Duke',1282080),
(403,'Zach LaVine','Minnesota Timberwolves',8,'PG',21,'6-5',189,'UCLA',2148360),
(404,'Shabazz Muhammad','Minnesota Timberwolves',15,'SF',23,'6-6',223,'UCLA',2056920),
(405,'Adreian Payne','Minnesota Timberwolves',33,'PF',25,'6-10',237,'Michigan State',1938840),
(406,'Nikola Pekovic','Minnesota Timberwolves',14,'C',30,'6-11',307,'',12100000),
(407,'Tayshaun Prince','Minnesota Timberwolves',12,'SF',36,'6-9',212,'Kentucky',947276),
(408,'Ricky Rubio','Minnesota Timberwolves',9,'PG',25,'6-4',194,'',12700000),
(409,'Damjan Rudez','Minnesota Timberwolves',10,'SF',29,'6-9',230,'',1149500),
(410,'Greg Smith','Minnesota Timberwolves',4,'PF',25,'6-10',250,'Fresno State',NULL),
(411,'Karl-Anthony Towns','Minnesota Timberwolves',32,'C',20,'7-0',244,'Kentucky',5703600),
(412,'Andrew Wiggins','Minnesota Timberwolves',22,'SG',21,'6-8',199,'Kansas',5758680),
(413,'Steven Adams','Oklahoma City Thunder',12,'C',22,'7-0',255,'Pittsburgh',2279040),
(414,'Nick Collison','Oklahoma City Thunder',4,'PF',35,'6-10',255,'Kansas',3750000),
(415,'Kevin Durant','Oklahoma City Thunder',35,'SF',27,'6-9',240,'Texas',20158600),
(416,'Randy Foye','Oklahoma City Thunder',6,'SG',32,'6-4',213,'Villanova',3135000),
(417,'Josh Huestis','Oklahoma City Thunder',34,'SF',24,'6-7',230,'Stanford',1140240),
(418,'Serge Ibaka','Oklahoma City Thunder',9,'PF',26,'6-10',245,'',12250000),
(419,'Enes Kanter','Oklahoma City Thunder',11,'C',24,'6-11',245,'Kentucky',16407500),
(420,'Mitch McGary','Oklahoma City Thunder',33,'PF',24,'6-10',255,'Michigan',1463040),
(421,'Nazr Mohammed','Oklahoma City Thunder',13,'C',38,'6-10',250,'Kentucky',222888),
(422,'Anthony Morrow','Oklahoma City Thunder',2,'SG',30,'6-5',210,'Georgia Tech',3344000),
(423,'Cameron Payne','Oklahoma City Thunder',22,'PG',21,'6-3',185,'Murray State',2021520),
(424,'Andre Roberson','Oklahoma City Thunder',21,'SG',24,'6-7',210,'Colorado',1210800),
(425,'Kyle Singler','Oklahoma City Thunder',5,'SF',28,'6-8',228,'Duke',4500000),
(426,'Dion Waiters','Oklahoma City Thunder',3,'SG',24,'6-4',220,'Syracuse',5138430),
(427,'Russell Westbrook','Oklahoma City Thunder',0,'PG',27,'6-3',200,'UCLA',16744200),
(428,'Cliff Alexander','Portland Trail Blazers',34,'PF',20,'6-8',240,'Kansas',525093),
(429,'Al-Farouq Aminu','Portland Trail Blazers',8,'SF',25,'6-9',215,'Wake Forest',8042900),
(430,'Pat Connaughton','Portland Trail Blazers',5,'SG',23,'6-5',206,'Notre Dame',625093),
(431,'Allen Crabbe','Portland Trail Blazers',23,'SG',24,'6-6',210,'California',947276),
(432,'Ed Davis','Portland Trail Blazers',17,'C',27,'6-10',240,'North Carolina',6980800),
(433,'Maurice Harkless','Portland Trail Blazers',4,'SF',23,'6-9',215,'St. John\'s',2894060),
(434,'Gerald Henderson','Portland Trail Blazers',9,'SG',28,'6-5',215,'Duke',6000000),
(435,'Chris Kaman','Portland Trail Blazers',35,'C',34,'7-0',265,'Central Michigan',5016000),
(436,'Meyers Leonard','Portland Trail Blazers',11,'PF',24,'7-1',245,'Illinois',3075880),
(437,'Damian Lillard','Portland Trail Blazers',0,'PG',25,'6-3',195,'Weber State',4236290),
(438,'C.J. McCollum','Portland Trail Blazers',3,'SG',24,'6-4',200,'Lehigh',2525160),
(439,'Luis Montero','Portland Trail Blazers',44,'SG',23,'6-7',185,'Westchester CC',525093),
(440,'Mason Plumlee','Portland Trail Blazers',24,'C',26,'6-11',235,'Duke',1415520),
(441,'Brian Roberts','Portland Trail Blazers',2,'PG',30,'6-1',173,'Dayton',2854940),
(442,'Noah Vonleh','Portland Trail Blazers',21,'PF',20,'6-9',240,'Indiana',2637720),
(443,'Trevor Booker','Utah Jazz',33,'PF',28,'6-8',228,'Clemson',4775000),
(444,'Trey Burke','Utah Jazz',3,'PG',23,'6-1',191,'Michigan',2658240),
(445,'Alec Burks','Utah Jazz',10,'SG',24,'6-6',214,'Colorado',9463480),
(446,'Dante Exum','Utah Jazz',11,'PG',20,'6-6',190,'',3777720),
(447,'Derrick Favors','Utah Jazz',15,'PF',24,'6-10',265,'Georgia Tech',12000000),
(448,'Rudy Gobert','Utah Jazz',27,'C',23,'7-1',245,'',1175880),
(449,'Gordon Hayward','Utah Jazz',20,'SF',26,'6-8',226,'Butler',15409600),
(450,'Rodney Hood','Utah Jazz',5,'SG',23,'6-8',206,'Duke',1348440),
(451,'Joe Ingles','Utah Jazz',2,'SF',28,'6-8',226,'',2050000),
(452,'Chris Johnson','Utah Jazz',23,'SF',26,'6-6',206,'Dayton',981348),
(453,'Trey Lyles','Utah Jazz',41,'PF',20,'6-10',234,'Kentucky',2239800),
(454,'Shelvin Mack','Utah Jazz',8,'PG',26,'6-3',203,'Butler',2433330),
(455,'Raul Neto','Utah Jazz',25,'PG',24,'6-1',179,'',900000),
(456,'Tibor Pleiss','Utah Jazz',21,'C',26,'7-3',256,'',2900000),
(457,'Jeff Withey','Utah Jazz',24,'C',26,'7-0',231,'Kansas',947276);
/*!40000 ALTER TABLE `players` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2025-03-28  6:27:04

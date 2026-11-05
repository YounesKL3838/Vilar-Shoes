-- =====================================================================
-- Vilar - 05_seed.sql
-- Données de structure (pas de faux produits ni de fausses commandes).
-- Nouveautés et Promotions sont des filtres calculés (is_new / sale_price),
-- pas des catégories de stockage.
-- =====================================================================

insert into public.categories (slug, name_ar, name_fr, sort_order) values
  ('talons',   'أحذية بكعب',   'Chaussures à talons',   1),
  ('baskets',  'أحذية رياضية', 'Baskets Femme',         2),
  ('sandales', 'صنادل',        'Sandales',              3),
  ('mocassins','موكاسان',      'Mocassins',             4),
  ('ballerines','باليرين',     'Ballerines',            5),
  ('bottines', 'بوتينات',      'Bottines',              6),
  ('soiree',   'أحذية السهرة', 'Chaussures de soirée',  7);

-- Zones de livraison : désactivées et à 0 DA tant que vous n'avez pas fixé
-- les tarifs dans l'admin (page Livraison). Une wilaya inactive n'apparaît
-- pas dans le formulaire de commande.
insert into public.delivery_zones (wilaya_code, name_fr) values
  (1,'Adrar'),(2,'Chlef'),(3,'Laghouat'),(4,'Oum El Bouaghi'),(5,'Batna'),
  (6,'Béjaïa'),(7,'Biskra'),(8,'Béchar'),(9,'Blida'),(10,'Bouira'),
  (11,'Tamanrasset'),(12,'Tébessa'),(13,'Tlemcen'),(14,'Tiaret'),(15,'Tizi Ouzou'),
  (16,'Alger'),(17,'Djelfa'),(18,'Jijel'),(19,'Sétif'),(20,'Saïda'),
  (21,'Skikda'),(22,'Sidi Bel Abbès'),(23,'Annaba'),(24,'Guelma'),(25,'Constantine'),
  (26,'Médéa'),(27,'Mostaganem'),(28,'M''Sila'),(29,'Mascara'),(30,'Ouargla'),
  (31,'Oran'),(32,'El Bayadh'),(33,'Illizi'),(34,'Bordj Bou Arréridj'),(35,'Boumerdès'),
  (36,'El Tarf'),(37,'Tindouf'),(38,'Tissemsilt'),(39,'El Oued'),(40,'Khenchela'),
  (41,'Souk Ahras'),(42,'Tipaza'),(43,'Mila'),(44,'Aïn Defla'),(45,'Naâma'),
  (46,'Aïn Témouchent'),(47,'Ghardaïa'),(48,'Relizane'),(49,'Timimoun'),
  (50,'Bordj Badji Mokhtar'),(51,'Ouled Djellal'),(52,'Béni Abbès'),(53,'In Salah'),
  (54,'In Guezzam'),(55,'Touggourt'),(56,'Djanet'),(57,'El M''Ghair'),(58,'El Meniaa');

insert into public.site_settings (key, value) values
  ('store',   '{"name":"Vilar","currency":"DA","default_lang":"ar"}'),
  ('theme',   '{"bg":"#FAF7F2","text":"#1A1A1A","accent":"#E8C4C4","beige":"#D9C7B0"}'),
  ('contact', '{"phone":"","whatsapp":"","email":"","instagram":"","facebook":"","tiktok":""}'),
  ('tracking','{"meta_pixel_id":"","tiktok_pixel_id":""}'),
  ('announcement','{"ar":"","fr":"","enabled":false}');

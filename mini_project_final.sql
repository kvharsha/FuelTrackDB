-- ============================================================
-- Create database and use it
-- ============================================================
CREATE DATABASE IF NOT EXISTS fuel_locator_db;
USE `fuel_locator_db`;

-- ============================================================
-- Drop tables if they exist (reverse order of dependencies)
-- ============================================================
DROP TABLE IF EXISTS `favorites`;
DROP TABLE IF EXISTS `station_fuels`;
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `offline_packages`;
DROP TABLE IF EXISTS `stations`;
DROP TABLE IF EXISTS `fuel_types`;
DROP TABLE IF EXISTS `operators`;
DROP TABLE IF EXISTS `users`;

-- ============================================================
-- Create users
-- ============================================================
CREATE TABLE `users` (
  `user_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `full_name` VARCHAR(200) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(30) DEFAULT NULL,
  `role` ENUM('user','admin') NOT NULL DEFAULT 'user',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uq_users_email` (`email`)
);

-- ============================================================
-- Create operators
-- ============================================================
CREATE TABLE `operators` (
  `operator_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(200) NOT NULL,
  `contact_name` VARCHAR(200) DEFAULT NULL,
  `phone` VARCHAR(30) DEFAULT NULL,
  `email` VARCHAR(255) DEFAULT NULL,
  `address` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`operator_id`)
) ;

-- ============================================================
-- Create fuel_types
-- ============================================================
CREATE TABLE `fuel_types` (
  `fuel_type_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`fuel_type_id`),
  UNIQUE KEY `uq_fuel_types_name` (`name`)
) ;

-- ============================================================
-- Create stations
-- ============================================================
CREATE TABLE `stations` (
  `station_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(200) NOT NULL,
  `operator_id` INT UNSIGNED NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `state` VARCHAR(100) NOT NULL,
  `pincode` VARCHAR(20) DEFAULT NULL,
  `latitude` DECIMAL(9,6) NOT NULL,
  `longitude` DECIMAL(9,6) NOT NULL,
  `opening_hours` VARCHAR(100) DEFAULT NULL,
  `phone` VARCHAR(30) DEFAULT NULL,
  `status` ENUM('Operational','Under Construction','Closed') NOT NULL DEFAULT 'Operational',
  `eta_date` DATE DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`station_id`),
  KEY `idx_station_lat_lon` (`latitude`,`longitude`),
  KEY `idx_station_city_state` (`city`,`state`),
  CONSTRAINT `fk_stations_operator`
    FOREIGN KEY (`operator_id`)
    REFERENCES `operators` (`operator_id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ;

-- ============================================================
-- Create station_fuels (junction: station <-> fuel_type)
-- ============================================================
CREATE TABLE `station_fuels` (
  `station_id` INT UNSIGNED NOT NULL,
  `fuel_type_id` INT UNSIGNED NOT NULL,
  `price_per_unit` DECIMAL(10,2) DEFAULT NULL, -- e.g., price per litre or per kWh
  `is_available` INT(1) NOT NULL DEFAULT 1,
  `last_price_update` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`station_id`,`fuel_type_id`),
  CONSTRAINT `fk_station_fuels_station`
    FOREIGN KEY (`station_id`)
    REFERENCES `stations` (`station_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_station_fuels_fueltype`
    FOREIGN KEY (`fuel_type_id`)
    REFERENCES `fuel_types` (`fuel_type_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ;

-- ============================================================
-- Create reviews
-- ============================================================
CREATE TABLE `reviews` (
  `review_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `station_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `rating` TINYINT UNSIGNED NOT NULL,
  `comment` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`review_id`),
  CONSTRAINT `chk_reviews_rating` CHECK (`rating` BETWEEN 1 AND 5),
  CONSTRAINT `fk_reviews_station`
    FOREIGN KEY (`station_id`)
    REFERENCES `stations` (`station_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_reviews_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ;

-- ============================================================
-- Create offline_packages (user-created bounding boxes for offline download)
-- ============================================================
CREATE TABLE `offline_packages` (
  `package_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `package_name` VARCHAR(150) NOT NULL,
  `lat_min` DECIMAL(9,6) NOT NULL,
  `lat_max` DECIMAL(9,6) NOT NULL,
  `lon_min` DECIMAL(9,6) NOT NULL,
  `lon_max` DECIMAL(9,6) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` DATE DEFAULT NULL,
  `size_bytes` INT DEFAULT NULL,
  PRIMARY KEY (`package_id`),
  CONSTRAINT `fk_offpkg_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ;

-- ============================================================
-- Create favorites (user bookmarks)
-- ============================================================
CREATE TABLE `favorites` (
  `user_id` INT UNSIGNED NOT NULL,
  `station_id` INT UNSIGNED NOT NULL,
  `added_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`station_id`),
  CONSTRAINT `fk_favorites_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`user_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_favorites_station`
    FOREIGN KEY (`station_id`)
    REFERENCES `stations` (`station_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ;

-- ============================================================
-- End of DDL
-- ============================================================
 
 
 -- ------------------------------------------------------------
-- Insert sample users
-- (Using SHA2 for demo; replace with strong hash at application time)
-- ------------------------------------------------------------
INSERT INTO `users` (user_id, full_name, email, password_hash, phone, role)
VALUES
  (1, 'Admin User', 'admin@pesu.edu', SHA2('admin_pass_2025', 256), '+919876543210', 'admin'),
  (2, 'Student User', 'student@pesu.edu', SHA2('student_pass_2025', 256), '+919812345678', 'user');

-- ------------------------------------------------------------
-- Insert sample operators
-- ------------------------------------------------------------
INSERT INTO `operators` (operator_id, name, contact_name, phone, email, address)
VALUES
  (1, 'PESU Fuel Co', 'Mr. Manager', '+919800000001', 'ops@pesufuel.com', 'PESU Road, Bengaluru'),
  (2, 'GreenCharge Pvt Ltd', 'Ms. Charge', '+919800000002', 'contact@greencharge.in', 'Tech Park, Bengaluru');

-- ------------------------------------------------------------
-- Insert fuel types (canonical list)
-- ------------------------------------------------------------
INSERT INTO `fuel_types` (fuel_type_id, name, description)
VALUES
  (1, 'Petrol', 'Regular petrol (gasoline)'),
  (2, 'Diesel', 'Diesel fuel'),
  (3, 'CNG', 'Compressed Natural Gas'),
  (4, 'EV', 'Electric vehicle charging (kWh)');

-- ------------------------------------------------------------
-- Insert sample stations
-- NOTE: latitude/longitude are example coordinates (DECIMAL(9,6))
-- ------------------------------------------------------------
INSERT INTO `stations` (station_id, name, operator_id, address, city, state, pincode, latitude, longitude, opening_hours, phone, status, eta_date)
VALUES
  (1, 'PESU Central Station', 1, 'PESU Campus Gate, PESU Road', 'Bengaluru', 'Karnataka', '560078', 12.934056, 77.614375, '24x7', '+919900000001', 'Operational', NULL),
  (2, 'GreenCharge Mall EV Hub', 2, 'Electronics City Road', 'Bengaluru', 'Karnataka', '560100', 12.839700, 77.677000, '06:00-22:00', '+919900000002', 'Operational', NULL),
  (3, 'PESU North CNG & Fuel', 1, 'PESU North Road', 'Bengaluru', 'Karnataka', '560102', 13.035000, 77.569000, NULL, NULL, 'Under Construction', '2025-12-31'),
  (4, 'Closed Demo Station', 2, 'Old Road', 'Bengaluru', 'Karnataka', '560200', 12.900000, 77.600000, NULL, NULL, 'Closed', NULL);

-- ------------------------------------------------------------
-- Insert station_fuels (many-to-many mapping)
-- ------------------------------------------------------------
-- Station 1: Petrol + Diesel
INSERT INTO `station_fuels` (station_id, fuel_type_id, price_per_unit, is_available, last_price_update)
VALUES
  (1, 1, 95.50, 1, NOW()),
  (1, 2, 86.20, 1, NOW());

-- Station 2: EV only
INSERT INTO `station_fuels` (station_id, fuel_type_id, price_per_unit, is_available, last_price_update)
VALUES
  (2, 4, 12.50, 1, NOW());

-- Station 3: Under construction, planned fuels (set is_available=0)
INSERT INTO `station_fuels` (station_id, fuel_type_id, price_per_unit, is_available, last_price_update)
VALUES
  (3, 3, NULL, 0, NULL),
  (3, 4, NULL, 0, NULL);

-- Station 4: Closed demo station (not available)
INSERT INTO `station_fuels` (station_id, fuel_type_id, price_per_unit, is_available, last_price_update)
VALUES
  (4, 1, 92.00, 0, NULL);

-- ------------------------------------------------------------
-- Insert sample reviews
-- ------------------------------------------------------------
INSERT INTO `reviews` (review_id, station_id, user_id, rating, comment)
VALUES
  (1, 1, 2, 4, 'Good service and quick turnaround');
-- ------------------------------------------------------------
-- Insert sample offline packages
-- ------------------------------------------------------------
-- Example: a package bounding box that includes station 1 & 3 (example coords)
INSERT INTO `offline_packages` (package_id, user_id, package_name, lat_min, lat_max, lon_min, lon_max, expires_at, size_bytes)
VALUES
  (1, 2, 'Bengaluru North - PESU', 12.900000, 13.050000, 77.560000, 77.690000, '2026-01-01', 512000);

-- ------------------------------------------------------------
-- Insert sample favorites (user bookmarks)
-- ------------------------------------------------------------
INSERT INTO `favorites` (user_id, station_id)
VALUES
  (2, 1);

-- ============================================================
-- Done: sample dataset inserted
-- ============================================================

-- ============================================================
-- SAFE RE-RUN: drop triggers, functions, procedures if exist
-- ============================================================
DROP TRIGGER IF EXISTS trg_before_insert_review;
DROP TRIGGER IF EXISTS trg_before_update_station_fuels;
DROP FUNCTION IF EXISTS fn_distance_km;
DROP FUNCTION IF EXISTS fn_avg_rating;
DROP PROCEDURE IF EXISTS sp_update_price;
DROP PROCEDURE IF EXISTS sp_find_nearby_stations;

DELIMITER $$

-- ============================================================
-- TRIGGER 1 - Prevent duplicate reviews by same user for same station
-- (Keeps reviews meaningful - each user only one review per station)
-- ============================================================
CREATE TRIGGER trg_before_insert_review
BEFORE INSERT ON reviews
FOR EACH ROW
BEGIN
  DECLARE cnt INT DEFAULT 0;
  SELECT COUNT(*) INTO cnt
    FROM reviews
   WHERE station_id = NEW.station_id
     AND user_id = NEW.user_id;
  IF cnt > 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User has already reviewed this station (one review per user per station allowed).';
  END IF;
  -- validate rating
  IF NEW.rating < 1 OR NEW.rating > 5 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Rating must be between 1 and 5.';
  END IF;
END$$

-- ============================================================
-- TRIGGER 2 - Maintain last_price_update and clear price when unavailable
-- - On INSERT/UPDATE of station_fuels:
--    * If price changes or inserted with price, set last_price_update = NOW()
--    * If is_available = 0 then price_per_unit -> NULL (to avoid stale prices)
-- ============================================================
CREATE TRIGGER trg_before_update_station_fuels
BEFORE UPDATE ON station_fuels
FOR EACH ROW
BEGIN
  -- If availability turned off, set price to NULL
  IF NEW.is_available = 0 THEN
    SET NEW.price_per_unit = NULL;
    SET NEW.last_price_update = NULL;
  ELSE
    -- if price has changed (and availability is on), refresh last_price_update
    IF (OLD.price_per_unit IS NULL AND NEW.price_per_unit IS NOT NULL)
       OR (OLD.price_per_unit IS NOT NULL AND NEW.price_per_unit IS NOT NULL AND OLD.price_per_unit <> NEW.price_per_unit) THEN
      SET NEW.last_price_update = NOW();
    END IF;
  END IF;
END$$

-- Also handle INSERT so initial price sets last_price_update
CREATE TRIGGER trg_before_insert_station_fuels
BEFORE INSERT ON station_fuels
FOR EACH ROW
BEGIN
  IF NEW.is_available = 0 THEN
    SET NEW.price_per_unit = NULL;
    SET NEW.last_price_update = NULL;
  ELSE
    IF NEW.price_per_unit IS NOT NULL THEN
      SET NEW.last_price_update = NOW();
    ELSE
      SET NEW.last_price_update = NULL;
    END IF;
  END IF;
END$$

-- ============================================================
-- FUNCTION 1 - Distance (Haversine) in kilometers
-- Usage: SELECT fn_distance_km(lat1, lon1, lat2, lon2);
-- ============================================================
CREATE FUNCTION fn_distance_km(
  lat1 DOUBLE, lon1 DOUBLE, lat2 DOUBLE, lon2 DOUBLE
) RETURNS DOUBLE
DETERMINISTIC
RETURN
  (
    6371.0 * 2 * ASIN(
      SQRT(
        POW(SIN(RADIANS((lat2 - lat1) / 2)), 2)
        + COS(RADIANS(lat1)) * COS(RADIANS(lat2))
          * POW(SIN(RADIANS((lon2 - lon1) / 2)), 2)
      )
    )
  );

-- ============================================================
-- FUNCTION 2 - Average rating for a station (returns 0 if none)
-- Usage: SELECT fn_avg_rating(station_id);
-- ============================================================
CREATE FUNCTION fn_avg_rating(in_station_id INT) RETURNS DECIMAL(3,2)
DETERMINISTIC
BEGIN
  DECLARE avg_r DECIMAL(5,2);
  SELECT AVG(rating) INTO avg_r
    FROM reviews
   WHERE station_id = in_station_id;
  IF avg_r IS NULL THEN
    RETURN 0.00;
  ELSE
    RETURN ROUND(avg_r,2);
  END IF;
END$$

-- ============================================================
-- PROCEDURE 1 - Update price safely and set availabilit
-- - If new_price is NULL -> set is_available=0 and price NULL
-- - If new_price provided -> set price and is_available=1 and update last_price_update
-- ============================================================
CREATE PROCEDURE sp_update_price(
  IN in_station_id INT,
  IN in_fuel_type_id INT,
  IN in_new_price DECIMAL(10,2)
)
BEGIN
  -- Basic validations (station & fuel existence)
  IF (SELECT COUNT(*) FROM stations WHERE station_id = in_station_id) = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Station does not exist.';
  END IF;
  IF (SELECT COUNT(*) FROM fuel_types WHERE fuel_type_id = in_fuel_type_id) = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Fuel type does not exist.';
  END IF;

  IF in_new_price IS NULL THEN
    -- mark unavailable
    UPDATE station_fuels
       SET price_per_unit = NULL,
           is_available = 0,
           last_price_update = NULL
     WHERE station_id = in_station_id AND fuel_type_id = in_fuel_type_id;
  ELSE
    -- update price and mark available; 
    UPDATE station_fuels
       SET price_per_unit = in_new_price,
           is_available = 1,
           last_price_update = NOW()
     WHERE station_id = in_station_id AND fuel_type_id = in_fuel_type_id;
    -- If no row exists yet, insert one
    IF ROW_COUNT() = 0 THEN
      INSERT INTO station_fuels (station_id, fuel_type_id, price_per_unit, is_available, last_price_update)
      VALUES (in_station_id, in_fuel_type_id, in_new_price, 1, NOW());
    END IF;
  END IF;
END$$

-- ============================================================
-- PROCEDURE 2 - Find nearby stations with given fuel within radius_km
-- Returns station rows with distance and avg rating
-- =============================================================
CREATE PROCEDURE sp_find_nearby_stations(
  IN in_lat DOUBLE,
  IN in_lon DOUBLE,
  IN in_radius_km DOUBLE,
  IN in_fuel_type_id INT
)
BEGIN
  -- returns station list ordered by distance ascending
  SELECT
    s.station_id,
    s.name,
    s.address,
    s.city,
    s.state,
    s.latitude,
    s.longitude,
    sf.price_per_unit,
    sf.is_available,
    fn_distance_km(in_lat, in_lon, s.latitude, s.longitude) AS distance_km,
    fn_avg_rating(s.station_id) AS avg_rating
  FROM stations s
  JOIN station_fuels sf ON sf.station_id = s.station_id AND sf.fuel_type_id = in_fuel_type_id
  WHERE sf.is_available = 1
    AND fn_distance_km(in_lat, in_lon, s.latitude, s.longitude) <= in_radius_km
    AND s.status = 'Operational'
  ORDER BY distance_km ASC;
END$$

DELIMITER ;

-- ============================================================
-- ----------------- Useful DML queries (SELECT / INSERT / UPDATE / DELETE)
-- Run these to exercise the DB and typical app flows.
-- ============================================================

-- -- 1) Find cheapest station for Petrol in Bengaluru
-- SELECT s.station_id, s.name, s.address, sf.price_per_unit
-- FROM stations s
-- JOIN station_fuels sf ON sf.station_id = s.station_id
-- JOIN fuel_types f ON f.fuel_type_id = sf.fuel_type_id
-- WHERE f.name = 'Petrol' AND s.city = 'Bengaluru' AND sf.is_available = 1
-- ORDER BY sf.price_per_unit ASC
-- LIMIT 1;

-- -- 2) Get average rating and number of reviews for each station (descending)
-- SELECT s.station_id, s.name,
--        fn_avg_rating(s.station_id) AS avg_rating,
--        COUNT(r.review_id) AS review_count
-- FROM stations s
-- LEFT JOIN reviews r ON r.station_id = s.station_id
-- GROUP BY s.station_id, s.name
-- ORDER BY avg_rating DESC, review_count DESC;

-- -- 3) Find nearest EV stations within 3 km of a user (example lat/lon)
-- CALL sp_find_nearby_stations(12.934056, 77.614375, 3, (SELECT fuel_type_id FROM fuel_types WHERE name = 'EV' LIMIT 1));

-- -- 4) Search stations offering CNG in a certain pincode / city
-- SELECT s.station_id, s.name, sf.price_per_unit, sf.is_available
-- FROM stations s
-- JOIN station_fuels sf ON s.station_id = sf.station_id
-- JOIN fuel_types ft ON ft.fuel_type_id = sf.fuel_type_id
-- WHERE ft.name = 'CNG' AND s.city = 'Bengaluru';

-- -- 5) Add a new favorite (bookmark) for a user (idempotent insert)
-- INSERT IGNORE INTO favorites (user_id, station_id) VALUES (2, 2);

-- -- 6) Remove a favorite
-- DELETE FROM favorites WHERE user_id = 2 AND station_id = 1;

-- -- 7) Update station status (example: station under construction becomes Operational)
-- CALL sp_find_nearby_stations(12.94,77.61,10,(SELECT fuel_type_id FROM fuel_types WHERE name='Petrol' LIMIT 1)); -- sample usage
-- UPDATE stations SET status = 'Operational', updated_at = NOW() WHERE station_id = 3;

-- -- 8) Use the price-update procedure (set price or mark unavailable)
-- CALL sp_update_price(3, (SELECT fuel_type_id FROM fuel_types WHERE name = 'CNG' LIMIT 1), 78.75); -- sets price and available
-- CALL sp_update_price(4, (SELECT fuel_type_id FROM fuel_types WHERE name = 'Petrol' LIMIT 1), NULL); -- mark as unavailable, price cleared

-- -- 9) Insert a new review (will fail if same user already reviewed same station due to trigger)
-- INSERT INTO reviews (station_id, user_id, rating, comment) VALUES (2, 2, 5, 'Fast charging and friendly staff.');

-- -- 10) Get stations inside an offline package bounding box (for client offline download)
-- SELECT s.*
-- FROM stations s
-- JOIN offline_packages p ON p.user_id = 2
-- WHERE s.latitude BETWEEN p.lat_min AND p.lat_max
--   AND s.longitude BETWEEN p.lon_min AND p.lon_max
--   AND p.package_id = 1;

-- -- 11) Expire old offline packages (delete expired)
-- DELETE FROM offline_packages WHERE expires_at IS NOT NULL AND expires_at < CURDATE();

-- -- 12) List operators with count of stations they manage
-- SELECT o.operator_id, o.name, COUNT(s.station_id) AS station_count
-- FROM operators o
-- LEFT JOIN stations s ON s.operator_id = o.operator_id
-- GROUP BY o.operator_id, o.name
-- ORDER BY station_count DESC;

-- -- 13) Find stations with low-rated average (< 3.0) to flag for operator attention
-- SELECT s.station_id, s.name, fn_avg_rating(s.station_id) AS avg_rating
-- FROM stations s
-- HAVING avg_rating > 0 AND avg_rating < 3.0;

-- -- 14) Bulk update: apply a 1.5% price increase to all Petrol stations in a city
-- UPDATE station_fuels sf
-- JOIN fuel_types ft ON ft.fuel_type_id = sf.fuel_type_id
-- JOIN stations s ON s.station_id = sf.station_id
-- SET sf.price_per_unit = ROUND(sf.price_per_unit * 1.015, 2),
--     sf.last_price_update = NOW()
-- WHERE ft.name = 'Petrol' AND s.city = 'Bengaluru' AND sf.is_available = 1;

-- -- 15) Insert a new offline package for a user
-- INSERT INTO offline_packages (user_id, package_name, lat_min, lat_max, lon_min, lon_max, expires_at, size_bytes)
-- VALUES (2, 'South Bengaluru Snapshot', 12.80, 13.00, 77.55, 77.70, DATE_ADD(CURDATE(), INTERVAL 30 DAY), 256000);

-- -- 16) Create a new station fuel row (if you add new fuel service to station)
-- INSERT INTO station_fuels (station_id, fuel_type_id, price_per_unit, is_available)
-- VALUES (1, (SELECT fuel_type_id FROM fuel_types WHERE name = 'EV' LIMIT 1), 11.00, 1)
-- ON DUPLICATE KEY UPDATE price_per_unit = VALUES(price_per_unit), is_available = VALUES(is_available), last_price_update = NOW();

-- -- 17) Get count of available fuel types per station
-- SELECT s.station_id, s.name, SUM(CASE WHEN sf.is_available = 1 THEN 1 ELSE 0 END) AS available_fuel_types
-- FROM stations s
-- LEFT JOIN station_fuels sf ON s.station_id = sf.station_id
-- GROUP BY s.station_id, s.name;

-- -- 18) Admin: deactivate a user (example: remove all favorites and offline packages when deleting)
-- -- If you want to delete a user and cascade, FK constraints will handle children. Example delete:
-- DELETE FROM users WHERE user_id = 999; -- (only if exists)

-- -- 19) Quick check: distance example (fn_distance_km)
-- SELECT fn_distance_km(12.934056,77.614375, 12.839700,77.677000) AS kms_between_pesu_and_greencharge;

-- -- 20) Find top 5 cheapest stations for EV charging (by price per kWh) within city
-- SELECT s.station_id, s.name, sf.price_per_unit
-- FROM stations s
-- JOIN station_fuels sf ON s.station_id = sf.station_id
-- JOIN fuel_types ft ON ft.fuel_type_id = sf.fuel_type_id
-- WHERE ft.name = 'EV' AND sf.is_available = 1
-- ORDER BY sf.price_per_unit ASC
-- LIMIT 5;

-- -- 21) Find stations that are Operational but have no available fuels (possible data problem)
-- SELECT s.station_id, s.name
-- FROM stations s
-- LEFT JOIN station_fuels sf ON s.station_id = sf.station_id AND sf.is_available = 1
-- WHERE s.status = 'Operational'
-- GROUP BY s.station_id, s.name
-- HAVING COUNT(sf.fuel_type_id) = 0;

-- -- 22) Example: admin updating operator contact details
-- UPDATE operators SET contact_name = 'Mr. New Manager', phone = '+919811111111' WHERE operator_id = 1;

-- -- 23) Recalculate or display avg rating via function for station_id = 1
-- SELECT fn_avg_rating(1) AS avg_rating_for_station_1;

-- -- 24) Demonstration: call price update procedure for a non-existing station/fuel combination (procedure inserts if not exist)
-- CALL sp_update_price(10, 1, 101.25); -- will insert station_fuels row only if station 10 exists; otherwise fails with signal

-- -- 25) Cleanup demo: remove demo station 4 if you want to prune samples (be careful)
-- -- DELETE FROM stations WHERE station_id = 4;

-- -- ============================================================
-- -- End of additions
-- -- ============================================================

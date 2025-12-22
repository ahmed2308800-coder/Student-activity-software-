-- Backup generated without mysqldump
-- Database: sams_db

CREATE DATABASE IF NOT EXISTS `sams_db`;
USE `sams_db`;

DROP TABLE IF EXISTS `attendances`;
CREATE TABLE `attendances` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `status` enum('present','absent') NOT NULL DEFAULT 'present',
  `marked_by` int(11) NOT NULL,
  `marked_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_event` (`user_id`,`event_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_event_id` (`event_id`),
  KEY `idx_status` (`status`),
  KEY `marked_by` (`marked_by`),
  CONSTRAINT `attendances_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `attendances_ibfk_2` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  CONSTRAINT `attendances_ibfk_3` FOREIGN KEY (`marked_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `events`;
CREATE TABLE `events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `date` datetime NOT NULL,
  `location_name` varchar(255) NOT NULL,
  `location_address` varchar(500) DEFAULT '',
  `max_seats` int(11) NOT NULL DEFAULT 0,
  `status` enum('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
  `category` varchar(100) DEFAULT 'general',
  `created_by` int(11) NOT NULL,
  `rejection_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_title` (`title`),
  KEY `idx_status` (`status`),
  KEY `idx_created_by` (`created_by`),
  KEY `idx_date` (`date`),
  KEY `idx_location_name` (`location_name`),
  CONSTRAINT `events_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `events` (`id`, `title`, `description`, `date`, `location_name`, `location_address`, `max_seats`, `status`, `category`, `created_by`, `rejection_reason`, `created_at`, `updated_at`) VALUES
(1, 'Updated Test Event 1766419175057', 'This is an updated test event description', '2025-12-23 17:59:34.000', 'Test Venue', '123 Test Street', 50, 'approved', 'workshop', 2, NULL, '2025-12-22 17:59:34.000', '2025-12-22 17:59:35.000'),
(2, 'Past Test Event 1766419174839', 'This is a past test event for feedback', '2025-12-21 17:59:35.000', 'Test Venue', '123 Test Street', 50, 'approved', 'workshop', 2, NULL, '2025-12-22 17:59:35.000', '2025-12-22 17:59:35.000'),
(3, 'nadjkncn', 'akmkmfwaemeklel', '2025-12-31 18:31:00.000', '10101', '', 199, 'approved', 'dlldwe', 4, NULL, '2025-12-22 18:32:11.000', '2025-12-22 18:32:22.000');

DROP TABLE IF EXISTS `feedbacks`;
CREATE TABLE `feedbacks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `rating` tinyint(4) DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_event` (`user_id`,`event_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_event_id` (`event_id`),
  KEY `idx_rating` (`rating`),
  CONSTRAINT `feedbacks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `feedbacks_ibfk_2` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  CONSTRAINT `CONSTRAINT_1` CHECK (`rating` is null or `rating` >= 1 and `rating` <= 5)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `guests`;
CREATE TABLE `guests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL DEFAULT '',
  `email` varchar(255) NOT NULL,
  `event_id` int(11) NOT NULL,
  `invited_by` int(11) NOT NULL,
  `status` enum('invited','confirmed','cancelled') NOT NULL DEFAULT 'invited',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_email_event` (`email`,`event_id`),
  KEY `idx_event_id` (`event_id`),
  KEY `idx_email` (`email`),
  KEY `idx_status` (`status`),
  KEY `invited_by` (`invited_by`),
  CONSTRAINT `guests_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  CONSTRAINT `guests_ibfk_2` FOREIGN KEY (`invited_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `logs`;
CREATE TABLE `logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `resource` varchar(100) DEFAULT NULL,
  `resource_id` int(11) DEFAULT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_action` (`action`),
  KEY `idx_timestamp` (`timestamp`),
  CONSTRAINT `logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `logs` (`id`, `user_id`, `action`, `resource`, `resource_id`, `details`, `ip_address`, `user_agent`, `timestamp`) VALUES
(1, NULL, 'login', NULL, NULL, NULL, '::1', 'axios/1.13.2', '2025-12-22 17:59:34.000'),
(2, 2, 'login', NULL, NULL, NULL, '::1', 'axios/1.13.2', '2025-12-22 17:59:34.000'),
(3, NULL, 'login', NULL, NULL, NULL, '::1', 'axios/1.13.2', '2025-12-22 17:59:34.000'),
(4, 2, 'event_created', 'event', 1, NULL, '::1', 'axios/1.13.2', '2025-12-22 17:59:34.000'),
(5, 2, 'event_updated', 'event', 1, NULL, '::1', 'axios/1.13.2', '2025-12-22 17:59:35.000'),
(6, NULL, 'event_approved', 'event', 1, NULL, '::1', 'axios/1.13.2', '2025-12-22 17:59:35.000'),
(7, 2, 'event_created', 'event', 2, NULL, '::1', 'axios/1.13.2', '2025-12-22 17:59:35.000'),
(8, NULL, 'event_approved', 'event', 2, NULL, '::1', 'axios/1.13.2', '2025-12-22 17:59:35.000'),
(9, NULL, 'registration_created', 'registration', 1, NULL, '::1', 'axios/1.13.2', '2025-12-22 17:59:35.000'),
(10, NULL, 'registration_created', 'registration', 2, NULL, '::1', 'axios/1.13.2', '2025-12-22 17:59:35.000'),
(11, NULL, 'registration_cancelled', 'registration', 2, NULL, '::1', 'axios/1.13.2', '2025-12-22 17:59:35.000'),
(12, NULL, 'registration_created', 'registration', 3, NULL, '::1', 'axios/1.13.2', '2025-12-22 17:59:35.000'),
(13, 2, 'attendance_marked', 'attendance', 1, '{\"eventId\":1,\"userId\":1,\"status\":\"present\"}', '::1', 'axios/1.13.2', '2025-12-22 17:59:35.000'),
(14, NULL, 'feedback_submitted', 'feedback', 1, NULL, '::1', 'axios/1.13.2', '2025-12-22 17:59:35.000'),
(15, 4, 'login', NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-22 18:00:42.000'),
(16, 4, 'login', NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-22 18:02:21.000'),
(17, 4, 'login', NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-22 18:05:33.000'),
(18, 4, 'login', NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-22 18:09:06.000'),
(19, 4, 'login', NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-22 18:09:34.000'),
(20, 4, 'login', NULL, NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-22 18:10:07.000'),
(21, 4, 'event_created', 'event', 3, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-22 18:32:11.000'),
(22, 4, 'event_approved', 'event', 3, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-22 18:32:22.000');

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `related_event_id` int(11) DEFAULT NULL,
  `read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_read` (`read`),
  KEY `related_event_id` (`related_event_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`related_event_id`) REFERENCES `events` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `related_event_id`, `read`, `created_at`) VALUES
(1, 2, 'event_submitted', 'Event Submitted', 'Your event \"Test Event 1766419174839\" has been submitted for approval.', 1, 0, '2025-12-22 17:59:34.000'),
(2, 2, 'event_updated', 'Event Updated', 'Your event \"Updated Test Event 1766419175057\" has been updated.', 1, 0, '2025-12-22 17:59:35.000'),
(3, 2, 'event_approved', 'Event Approved', 'Your event \"Updated Test Event 1766419175057\" has been approved and is now live.', 1, 0, '2025-12-22 17:59:35.000'),
(4, 2, 'event_submitted', 'Event Submitted', 'Your event \"Past Test Event 1766419174839\" has been submitted for approval.', 2, 0, '2025-12-22 17:59:35.000'),
(5, 2, 'event_approved', 'Event Approved', 'Your event \"Past Test Event 1766419174839\" has been approved and is now live.', 2, 0, '2025-12-22 17:59:35.000'),
(6, 2, 'new_registration', 'New Registration', 'A new student has registered for your event.', 2, 0, '2025-12-22 17:59:35.000'),
(8, 2, 'new_registration', 'New Registration', 'A new student has registered for your event.', 1, 0, '2025-12-22 17:59:35.000'),
(11, 2, 'new_registration', 'New Registration', 'A new student has registered for your event.', 1, 0, '2025-12-22 17:59:35.000'),
(13, 2, 'event_updated', 'hi guyes', 'hiiiiiiiiiiiiiiiiiiiiiii', NULL, 0, '2025-12-22 18:11:19.000'),
(14, 4, 'event_updated', 'hi guyes', 'hiiiiiiiiiiiiiiiiiiiiiii', NULL, 1, '2025-12-22 18:11:19.000'),
(15, 4, 'event_submitted', 'Event Submitted', 'Your event \"nadjkncn\" has been submitted for approval.', 3, 0, '2025-12-22 18:32:11.000'),
(16, 4, 'event_approved', 'Event Approved', 'Your event \"nadjkncn\" has been approved and is now live.', 3, 0, '2025-12-22 18:32:22.000');

DROP TABLE IF EXISTS `registrations`;
CREATE TABLE `registrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `registered_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_event` (`user_id`,`event_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_event_id` (`event_id`),
  CONSTRAINT `registrations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `registrations_ibfk_2` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL DEFAULT '',
  `role` enum('student','club_representative','admin','guest') NOT NULL DEFAULT 'student',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_role` (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`, `created_at`, `updated_at`) VALUES
(2, 'test.clubrep.1766419173570@test.com', '$2b$10$4WA1SmTaztbvKMpBdaho1.r/66an37GpsAqpENSlnm3sdJqr4FW7K', 'Test Club Rep', 'club_representative', '2025-12-22 17:59:33.000', '2025-12-22 17:59:33.000'),
(4, 'amaged1686@gmail.com', '$2b$10$9SMBauO7eRd12xcEHebrMei7vDTR6iv0zETBX/JywptEHSBkh98aa', 'ahmed', 'admin', '2025-12-22 18:00:24.000', '2025-12-22 18:00:24.000');

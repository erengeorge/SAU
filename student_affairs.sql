-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 10, 2026 at 08:32 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `student_affairs`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_requirements`
--

CREATE TABLE `activity_requirements` (
  `id` int(11) NOT NULL,
  `activity_id` int(11) NOT NULL,
  `requirement_name` varchar(255) NOT NULL,
  `submitted` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activity_requirements`
--

INSERT INTO `activity_requirements` (`id`, `activity_id`, `requirement_name`, `submitted`) VALUES
(1, 1, 'Proposal', 0),
(2, 1, 'Liquidation', 0),
(3, 1, 'Invitation', 0),
(4, 1, 'Form 137', 0);

-- --------------------------------------------------------

--
-- Table structure for table `complaints`
--

CREATE TABLE `complaints` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `course` varchar(255) DEFAULT NULL,
  `type` enum('Complaint','Request') NOT NULL DEFAULT 'Complaint',
  `description` text NOT NULL,
  `status` enum('open','progress','done') NOT NULL DEFAULT 'open',
  `date_added` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `complaints`
--

INSERT INTO `complaints` (`id`, `name`, `course`, `type`, `description`, `status`, `date_added`, `created_at`) VALUES
(1, 'Erine George Lumbad', 'BSIT', 'Request', 'NO ID', 'open', '2026-09-10', '2026-09-10 06:04:00');

-- --------------------------------------------------------

--
-- Table structure for table `confiscated_ids`
--

CREATE TABLE `confiscated_ids` (
  `id` int(11) NOT NULL,
  `student_name` varchar(255) NOT NULL,
  `student_id_no` varchar(50) DEFAULT NULL,
  `reason` varchar(255) NOT NULL,
  `date_confiscated` date NOT NULL,
  `status` enum('held','released') NOT NULL DEFAULT 'held',
  `date_released` date DEFAULT NULL,
  `released_by` varchar(255) DEFAULT NULL,
  `release_reason` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `confiscated_ids`
--

INSERT INTO `confiscated_ids` (`id`, `student_name`, `student_id_no`, `reason`, `date_confiscated`, `status`, `date_released`, `released_by`, `release_reason`, `created_at`) VALUES
(1, 'Erine George', '2022-32373', 'Uniform', '2026-09-10', 'released', '2026-09-10', 'Asha', 'Forgot', '2026-09-10 06:31:46');

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `color` varchar(7) NOT NULL DEFAULT '#1f6f5c',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `name`, `color`, `created_at`) VALUES
(1, 'CAMT', '#ffe047', '2026-09-10 06:19:35'),
(2, 'NURSING', '#fb7eda', '2026-09-10 06:19:47'),
(3, 'Medical Technology', '#35a78c', '2026-09-10 06:20:02'),
(4, 'CELAS', '#2969ff', '2026-09-10 06:20:22'),
(5, 'Pharmacy', '#99ffe7', '2026-09-10 06:20:35');

-- --------------------------------------------------------

--
-- Table structure for table `department_activities`
--

CREATE TABLE `department_activities` (
  `id` int(11) NOT NULL,
  `department` varchar(255) NOT NULL,
  `activity_name` varchar(255) NOT NULL,
  `activity_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `department_activities`
--

INSERT INTO `department_activities` (`id`, `department`, `activity_name`, `activity_date`, `notes`, `created_at`) VALUES
(1, 'CAMT', 'General Assembly', '2026-09-30', '', '2026-09-10 06:01:56'),
(3, 'NURSING', 'General Assembly', '2026-09-10', '', '2026-09-10 06:20:59');

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `id` int(11) NOT NULL,
  `direction` enum('incoming','outgoing') NOT NULL,
  `tracking_no` varchar(100) DEFAULT NULL,
  `subject` varchar(255) NOT NULL,
  `party` varchar(255) DEFAULT NULL,
  `date_logged` date NOT NULL,
  `status` enum('pending','completed') NOT NULL DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `documents`
--

INSERT INTO `documents` (`id`, `direction`, `tracking_no`, `subject`, `party`, `date_logged`, `status`, `notes`, `created_at`) VALUES
(2, 'incoming', 'For Signature', 'VP Complaint', 'VP', '2026-09-10', 'pending', '', '2026-09-10 06:13:28');

-- --------------------------------------------------------

--
-- Table structure for table `student_records`
--

CREATE TABLE `student_records` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `student_id` varchar(50) DEFAULT NULL,
  `course` varchar(255) DEFAULT NULL,
  `contact` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `student_records`
--

INSERT INTO `student_records` (`id`, `name`, `student_id`, `course`, `contact`, `notes`, `created_at`) VALUES
(1, 'Erine George C. Lumbad', '2022-32373', 'BSIT', '09281248185', '', '2026-09-10 06:03:27');

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `due_date` date DEFAULT NULL,
  `done` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`id`, `title`, `due_date`, `done`, `created_at`) VALUES
(1, 'Testing 1', '2026-09-10', 0, '2026-09-10 06:14:08');

-- --------------------------------------------------------

--
-- Table structure for table `visitors`
--

CREATE TABLE `visitors` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `purpose` varchar(255) NOT NULL,
  `visit_time` time DEFAULT NULL,
  `visit_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_requirements`
--
ALTER TABLE `activity_requirements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `activity_id` (`activity_id`);

--
-- Indexes for table `complaints`
--
ALTER TABLE `complaints`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `confiscated_ids`
--
ALTER TABLE `confiscated_ids`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `department_activities`
--
ALTER TABLE `department_activities`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `student_records`
--
ALTER TABLE `student_records`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `visitors`
--
ALTER TABLE `visitors`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_requirements`
--
ALTER TABLE `activity_requirements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `complaints`
--
ALTER TABLE `complaints`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `confiscated_ids`
--
ALTER TABLE `confiscated_ids`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `department_activities`
--
ALTER TABLE `department_activities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `documents`
--
ALTER TABLE `documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `student_records`
--
ALTER TABLE `student_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `visitors`
--
ALTER TABLE `visitors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_requirements`
--
ALTER TABLE `activity_requirements`
  ADD CONSTRAINT `activity_requirements_ibfk_1` FOREIGN KEY (`activity_id`) REFERENCES `department_activities` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

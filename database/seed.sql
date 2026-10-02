-- Online Complaint Management System
-- Seed Data for PostgreSQL

-- Clear existing data
TRUNCATE TABLE complaints, statuses, departments, users RESTART IDENTITY CASCADE;

-- Insert Sample Users
INSERT INTO users (first_name, last_name, email, phone_number) VALUES
('Arun', 'Kumar', 'arun.kumar@college.edu', '9876543210'),
('Priya', 'Sharma', 'priya.sharma@college.edu', '9876543211'),
('Rahul', 'Raj', 'rahul.raj@college.edu', '9876543212'),
('Divya', 'S', 'divya.s@college.edu', '9876543213'),
('Karthik', 'M', 'karthik.m@college.edu', '9876543214');

-- Insert Sample Departments
INSERT INTO departments (department_name, location, service_area) VALUES
('Computer Science', 'Academic Block A, 2nd Floor', 'Lab Infrastructure & Software Systems'),
('Administration', 'Main Building, Ground Floor', 'Student Records & Fee Verification'),
('Library', 'Central Library Building', 'Book Issue, Digital Library & Quiet Zones'),
('Hostel', 'Hostel Block 3, Office', 'Student Accommodation & Mess Facilities'),
('Maintenance', 'Utility Wing, Gate 2', 'Electrical, Plumbing & Civil Repairs'),
('Transport', 'Bus Parking Bay, Gate 1', 'College Bus Routes & Fleet Management');

-- Insert Sample Statuses
INSERT INTO statuses (status) VALUES
('Pending'),
('In Progress'),
('Resolved'),
('Rejected');

-- Insert Sample Complaints
INSERT INTO complaints (user_id, department_id, status_id, category, description, complaint_date, resolved_date, remarks) VALUES
-- 1. Pending Hostel complaint
(1, 4, 1, 'Hostel', 'Water supply interruption in Hostel Block A 3rd floor washrooms during morning hours.', CURRENT_TIMESTAMP - INTERVAL '2 days', NULL, NULL),

-- 2. In Progress Maintenance complaint
(2, 5, 2, 'Electrical', 'Projector overhead display flickers continuously in Seminar Hall 102 during lectures.', CURRENT_TIMESTAMP - INTERVAL '4 days', NULL, 'Technician dispatched to replace HDMI display cable.'),

-- 3. Resolved CS complaint
(3, 1, 3, 'Lab Equipment', 'Computer CS-LAB-24 operating system crashes on boot with blue screen error.', CURRENT_TIMESTAMP - INTERVAL '6 days', CURRENT_TIMESTAMP - INTERVAL '1 day', 'Re-installed Windows image and upgraded RAM stick. Verified working.'),

-- 4. Pending Administration complaint
(4, 2, 1, 'Fee Certificate', 'Delay in issuing tuition fee breakdown certificate required for scholarship application.', CURRENT_TIMESTAMP - INTERVAL '1 day', NULL, NULL),

-- 5. In Progress Library complaint
(5, 3, 2, 'Digital Library', 'Wi-Fi connectivity drops frequently in the 2nd floor research journal reading section.', CURRENT_TIMESTAMP - INTERVAL '3 days', NULL, 'IT department investigating router access point load balancer.'),

-- 6. Resolved Transport complaint
(1, 6, 3, 'Transport', 'College Bus Route No. 12 arrived 25 minutes late at City Junction pickup point.', CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP - INTERVAL '5 days', 'Bus driver counseled; alternate backup bus assigned for Route 12.'),

-- 7. Rejected Maintenance complaint
(2, 5, 4, 'Infrastructure', 'Requesting air conditioner installation in open cafeteria seating area.', CURRENT_TIMESTAMP - INTERVAL '10 days', CURRENT_TIMESTAMP - INTERVAL '9 days', 'Rejected: Open cafeteria is non-air-conditioned by institutional architectural policy.'),

-- 8. Resolved Hostel complaint
(3, 4, 3, 'Mess Food', 'Quality of evening tea and snacks served at Boys Hostel Mess on Tuesday was sub-par.', CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '2 days', 'Mess warden inspected food inventory; vendor reprimanded.'),

-- 9. In Progress CS complaint
(4, 1, 2, 'Software', 'Compiler license key expired on Matlab installation in Data Science Laboratory.', CURRENT_TIMESTAMP - INTERVAL '2 days', NULL, 'License renewal request submitted to Dean of Academics.'),

-- 10. Pending Transport complaint
(5, 6, 1, 'Transport Pass', 'Smart card RFID tag reader failing on Bus No. 4 entrance gate.', CURRENT_TIMESTAMP - INTERVAL '12 hours', NULL, NULL);

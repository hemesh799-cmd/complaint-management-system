-- =========================================================
-- Database Schema for Complaint Management System
-- Database: PostgreSQL
-- =========================================================

-- Drop tables if they already exist (in reverse order of dependencies)
DROP TABLE IF EXISTS statuses CASCADE;
DROP TABLE IF EXISTS complaints CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone_number VARCHAR(20)
);

-- 2. Departments Table
CREATE TABLE departments (
    department_id SERIAL PRIMARY KEY,
    department_name VARCHAR(150) NOT NULL,
    location VARCHAR(150),
    service_area VARCHAR(200)
);

-- 3. Complaints Table
CREATE TABLE complaints (
    complaint_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    department_id INT,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    complaint_state VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    FOREIGN KEY (department_id)
        REFERENCES departments(department_id)
        ON DELETE SET NULL
);

-- 4. Statuses Table
CREATE TABLE statuses (
    status_id SERIAL PRIMARY KEY,
    complaint_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    resolved_date DATE,
    remarks TEXT,
    resolution_time VARCHAR(100),

    FOREIGN KEY (complaint_id)
        REFERENCES complaints(complaint_id)
        ON DELETE CASCADE
);

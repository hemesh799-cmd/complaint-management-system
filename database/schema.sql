-- Online Complaint Management System
-- Database Schema for PostgreSQL

-- Drop existing tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS complaints CASCADE;
DROP TABLE IF EXISTS statuses CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. users Table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(20) NOT NULL
);

-- 2. departments Table
CREATE TABLE departments (
    department_id SERIAL PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    service_area VARCHAR(150) NOT NULL
);

-- 3. statuses Table
CREATE TABLE statuses (
    status_id SERIAL PRIMARY KEY,
    status VARCHAR(50) NOT NULL UNIQUE
);

-- 4. complaints Table
CREATE TABLE complaints (
    complaint_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    department_id INT NOT NULL REFERENCES departments(department_id) ON DELETE CASCADE,
    status_id INT NOT NULL REFERENCES statuses(status_id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    complaint_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_date TIMESTAMP NULL,
    remarks TEXT NULL
);

-- Index for performance optimization on Foreign Keys and Common Searches
CREATE INDEX idx_complaints_user ON complaints(user_id);
CREATE INDEX idx_complaints_department ON complaints(department_id);
CREATE INDEX idx_complaints_status ON complaints(status_id);

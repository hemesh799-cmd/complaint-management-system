# Online Complaint Management System

A full-stack college DBMS project for managing, assigning, tracking, and resolving student & faculty complaints in an educational institution.

Every single change made in the **React Frontend** actually performs an `INSERT`, `UPDATE`, or `DELETE` query in the **PostgreSQL Database** through the **Express REST API**.

---

## 🌟 Key Features

* **Dashboard & Analytics**: Live system statistics calculated directly from PostgreSQL queries (Total Users, Total Complaints, Pending, In Progress, Resolved, Rejected, Department breakdown).
* **File New Complaints**: Interactive form with dropdowns populated dynamically from PostgreSQL database (`users` and `departments` tables).
* **Complaint Status Tracking**: Real-time lifecycle state transitions (Pending → In Progress → Resolved / Rejected).
* **Automatic Resolution Time**: Derived calculation computed via SQL (`resolved_date - complaint_date`).
* **SQL JOIN Integration**: Comprehensive complaint details combining complainant details, handling department location/scope, and status remarks.
* **User Management**: View registered students/faculty and inspect their complaint filing history.
* **Department Assignment**: View service divisions, locations, and assigned complaint queues.
* **Search & Filters**: Multi-criteria search by ID, user, category, or description, with status & department dropdown filters.

---

## 🛠️ Technology Stack

* **Frontend**: React (Vite), JavaScript, React Router, Axios, Lucide Icons, Vanilla CSS
* **Backend**: Node.js, Express.js, REST API, `pg` (PostgreSQL Client Pool), `dotenv`, `cors`
* **Database**: PostgreSQL (Relational Database)

---

## 🗄️ Database Schema & Design

The database schema follows the institution's ER Diagram:

```text
users (user_id PK, first_name, last_name, email UNIQUE, phone_number)
   │
   │ 1:N (Reports)
   ▼
complaints (complaint_id PK, user_id FK, department_id FK, status_id FK, category, description, complaint_date, resolved_date, remarks)
   ▲                     ▲
   │ N:1 (Assigned To)    │ N:1 (Has Status)
   │                     │
departments            statuses (status_id PK, status UNIQUE)
(department_id PK, 
 department_name, 
 location, service_area)
```

### Relational Tables

1. `users`: Stores user identity split into `first_name` and `last_name`.
2. `departments`: Institutional departments (e.g., Computer Science, Hostel, Library, Transport, Maintenance, Administration).
3. `statuses`: Master lookup table (`Pending`, `In Progress`, `Resolved`, `Rejected`).
4. `complaints`: Core transaction table linking user, department, and status via Foreign Keys.

---

## 🚀 API Endpoints

### Complaints API

* `GET /api/complaints`: Fetch all complaints using SQL JOINs (`users`, `departments`, `statuses`). Supports `?status=`, `?department_id=`, `?category=`, `?search=`.
* `GET /api/complaints/:id`: Fetch single complaint with complete JOIN details.
* `POST /api/complaints`: Create a new complaint (PostgreSQL `INSERT INTO complaints ... RETURNING *`).
* `PUT /api/complaints/:id`: Update category, description, department, status, or remarks (PostgreSQL `UPDATE complaints ... RETURNING *`). Updates `resolved_date` when status becomes `Resolved`.
* `DELETE /api/complaints/:id`: Delete a complaint (PostgreSQL `DELETE FROM complaints WHERE complaint_id = $1`).

### Users API

* `GET /api/users`: Fetch all users with aggregated complaint count (`LEFT JOIN complaints`).
* `GET /api/users/:id`: Fetch user details and their complaint history array.
* `POST /api/users`: Create a new user (PostgreSQL `INSERT INTO users ... RETURNING *`).

### Department API

* `GET /api/departments`: Fetch all departments with assigned complaint count.
* `GET /api/departments/:id`: Fetch department details and assigned complaints array.
* `POST /api/departments`: Create a new department.

### Status API

* `GET /api/statuses`: Fetch master statuses from `statuses` table.

### Dashboard API

* `GET /api/dashboard/stats`: Compute real-time aggregated metrics via SQL queries (`COUNT`, `GROUP BY`).

---

## 💻 Setup & Installation

### 1. Database Setup (PostgreSQL)

If using a local PostgreSQL installation:

1. Create PostgreSQL database:
   ```sql
   CREATE DATABASE complaint_management;
   ```
2. Run schema and seed scripts:
   ```bash
   psql -U postgres -d complaint_management -f database/schema.sql
   psql -U postgres -d complaint_management -f database/seed.sql
   ```

3. Configure Environment Variables in `backend/.env`:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=complaint_management
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   ```

*(Note: The Express backend also includes a WASM PostgreSQL engine fallback so the app will start and run out of the box even if PostgreSQL service is offline during demonstration).*

---

### 2. Backend Server Setup

```bash
cd backend
npm install
npm start
```

Backend REST API will run at: `http://localhost:5000`

---

### 3. Frontend React Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend application will run at: `http://localhost:3000`

---

## 🧪 DBMS Project Demonstration Workflow

Perform this live test to demonstrate full-stack database synchronization:

1. **Add Complaint**:
   * Open React UI at `http://localhost:3000/complaints`
   * Click **"+ Add Complaint"**
   * Fill out details and submit.
   * **Result**: React issues `POST /api/complaints` → Express runs `INSERT INTO complaints` in PostgreSQL → Table refreshes from database.
2. **Update Status**:
   * Click **Edit (Pencil icon)** on any pending complaint.
   * Change Status to **"In Progress"** or **"Resolved"** and add remarks.
   * **Result**: React issues `PUT /api/complaints/:id` → Express executes `UPDATE complaints` → Refreshing browser retains updated status from PostgreSQL.
3. **Delete Record**:
   * Click **Delete (Trash icon)** and confirm.
   * **Result**: React issues `DELETE /api/complaints/:id` → Express executes `DELETE FROM complaints` → Record is permanently removed from PostgreSQL.

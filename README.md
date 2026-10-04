# Complaint Management System — College DBMS & Full-Stack Project

A complete, full-stack, database-driven **Complaint Management System** built with **React (Vite)**, **Express REST API**, and **PostgreSQL**.

Every change made through the React frontend (Creating, Updating, Deleting users, complaints, departments, or statuses) is directly stored in or retrieved from the **PostgreSQL database** through the Express REST API. There is **zero fake frontend data**.

---

## 🌟 Key Project Highlights

- **Complete Stack**: React → Axios → Express REST API → PostgreSQL (`pg` driver)
- **Real Database Persistence**: PostgreSQL is the single source of truth.
- **Mandatory SQL Database Viewer (`/database`)**: Dedicated visual database explorer page in React showing live PostgreSQL records, table row counts, and schema definitions.
- **DBMS Concepts**: Demonstrates Primary Keys, Foreign Keys (`ON DELETE CASCADE`, `ON DELETE SET NULL`), Check Constraints, SQL Aggregate queries (`COUNT`), and SQL `JOIN` queries.
- **Status Progression & History**: Tracks complaint progress (`Pending` → `In Progress` → `Resolved` / `Rejected`) with timeline logs, remarks, resolved date, and resolution time.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React (Vite)
- **Language**: JavaScript (ES6+)
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Styling**: Vanilla CSS (Custom design system, glassmorphism, responsive dashboard layout)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js (REST API)
- **Database Driver**: `pg` (PostgreSQL client pool)
- **Utilities**: `dotenv`, `cors`

### Database
- **DBMS**: PostgreSQL (Relational Database)
- **Tables**: `users`, `departments`, `complaints`, `statuses`

---

## 📁 Project Structure

```text
complaint-management-system/
│
├── database/
│   ├── schema.sql           # PostgreSQL table definitions & constraints
│   └── seed.sql             # Realistic sample seed data (5 users, 6 departments, 8 complaints, statuses)
│
├── backend/
│   ├── controllers/
│   │   ├── userController.js        # Users CRUD logic
│   │   ├── departmentController.js  # Departments CRUD logic
│   │   ├── complaintController.js   # Complaints CRUD & SQL JOINs logic
│   │   ├── statusController.js      # Status history & complaint state sync logic
│   │   ├── dashboardController.js   # Aggregate SQL metrics logic
│   │   └── databaseController.js    # Live SQL table explorer & schema logic
│   │
│   ├── routes/
│   │   ├── userRoutes.js
│   │   ├── departmentRoutes.js
│   │   ├── complaintRoutes.js
│   │   ├── statusRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── databaseRoutes.js
│   │
│   ├── db/
│   │   └── connection.js    # PostgreSQL pg.Pool connection & error handling
│   │
│   ├── middleware/
│   │   └── errorHandler.js  # Express global error handler
│   │
│   ├── scripts/
│   │   └── setup-db.js      # Utility script to run schema.sql & seed.sql automatically
│   │
│   ├── .env                 # Environment variables (Database credentials)
│   ├── .env.example         # Template environment variables
│   ├── package.json
│   └── server.js            # Express server entry point (Port 5000)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx           # Main navigation sidebar
│   │   │   ├── Navbar.jsx            # Top bar with PostgreSQL connection badge
│   │   │   ├── StatCard.jsx          # Reusable dashboard metric card
│   │   │   ├── ComplaintTable.jsx    # Complaints list with status badges & actions
│   │   │   ├── ComplaintForm.jsx     # Register / Edit complaint modal
│   │   │   ├── UserForm.jsx          # Add / Edit user modal
│   │   │   ├── DepartmentForm.jsx    # Add / Edit department modal
│   │   │   └── StatusModal.jsx       # Update status modal
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx         # System dashboard with 6 stat cards & recent complaints
│   │   │   ├── Users.jsx             # Users table & CRUD management
│   │   │   ├── Complaints.jsx        # Complaints list with search & state/category/dept filters
│   │   │   ├── ComplaintDetails.jsx  # Detailed view with User/Dept info & Status history timeline
│   │   │   ├── Departments.jsx       # Departments list & CRUD management
│   │   │   └── Database.jsx          # Live PostgreSQL SQL Tables Explorer & Schema viewer
│   │   │
│   │   ├── services/
│   │   │   └── api.js                # Axios configuration and backend API calls
│   │   │
│   │   ├── App.jsx                   # React Router layout & page routing
│   │   ├── main.jsx                  # React application entry point
│   │   └── index.css                 # Custom CSS stylesheet & design tokens
│   │
│   ├── package.json
│   └── vite.config.js                # Vite dev server configuration (Port 3000)
│
├── .gitignore
└── README.md
```

---

## 📊 Database Schema & Relationships

### Entity Relationship Structure
```text
users (1) ───────────── (N) complaints (1) ───────────── (N) statuses
                             │
                             │ (N)
                             ▼
                        departments (1)
```

1. **`users` Table**:
   - `user_id`: `SERIAL PRIMARY KEY`
   - `first_name`: `VARCHAR(100) NOT NULL`
   - `last_name`: `VARCHAR(100) NOT NULL`
   - `email`: `VARCHAR(150) UNIQUE NOT NULL`
   - `phone_number`: `VARCHAR(20)`

2. **`departments` Table**:
   - `department_id`: `SERIAL PRIMARY KEY`
   - `department_name`: `VARCHAR(150) NOT NULL`
   - `location`: `VARCHAR(150)`
   - `service_area`: `VARCHAR(200)`

3. **`complaints` Table**:
   - `complaint_id`: `SERIAL PRIMARY KEY`
   - `user_id`: `INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE`
   - `department_id`: `INT REFERENCES departments(department_id) ON DELETE SET NULL`
   - `category`: `VARCHAR(100) NOT NULL`
   - `description`: `TEXT NOT NULL`
   - `complaint_state`: `VARCHAR(50) DEFAULT 'Pending'`
   - `created_at`: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`

4. **`statuses` Table**:
   - `status_id`: `SERIAL PRIMARY KEY`
   - `complaint_id`: `INT NOT NULL REFERENCES complaints(complaint_id) ON DELETE CASCADE`
   - `status`: `VARCHAR(50) NOT NULL`
   - `resolved_date`: `DATE`
   - `remarks`: `TEXT`
   - `resolution_time`: `VARCHAR(100)`

---

## 🚀 Step-by-Step Setup & Running Guide

### Step 1: Clone or Download Repository
```bash
git clone https://github.com/your-username/complaint-management-system.git
cd complaint-management-system
```

### Step 2: Configure PostgreSQL Database
1. Make sure **PostgreSQL** service is installed and running on your system.
2. Open `backend/.env` and configure your database credentials:
   ```env
   PORT=5000
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=complaint_management
   DB_PASSWORD=your_postgres_password
   DB_PORT=5432
   ```

### Step 3: Run Database Setup & Seeding
Navigate to the `backend` directory and run the automated database setup script:
```bash
cd backend
npm install
npm run db:setup
```
*Note: `npm run db:setup` connects to PostgreSQL, creates the `complaint_management` database if missing, and executes both `schema.sql` and `seed.sql`.*

Alternatively, execute `schema.sql` and `seed.sql` via `psql` CLI:
```bash
psql -U postgres -d complaint_management -f database/schema.sql
psql -U postgres -d complaint_management -f database/seed.sql
```

### Step 4: Start Backend Express REST API Server
Inside the `backend` directory:
```bash
npm start
```
*The Express server will start on `http://localhost:5000`.*

### Step 5: Start Frontend React App
Open a new terminal window, navigate to `frontend`, install dependencies, and start Vite dev server:
```bash
cd frontend
npm install
npm run dev
```
*The React app will start on `http://localhost:3000`.*

---

## 🔗 Key REST API Endpoints

### 👤 Users APIs
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/users` | Fetch all users |
| `GET` | `/api/users/:id` | Fetch single user by ID |
| `POST` | `/api/users` | Create new user record |
| `PUT` | `/api/users/:id` | Update user details |
| `DELETE` | `/api/users/:id` | Delete user record |

### 🏢 Department APIs
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/departments` | Fetch all departments |
| `GET` | `/api/departments/:id` | Fetch single department by ID |
| `POST` | `/api/departments` | Create new department |
| `PUT` | `/api/departments/:id` | Update department details |
| `DELETE` | `/api/departments/:id` | Delete department record |

### 📝 Complaint APIs
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/complaints` | Fetch complaints with SQL JOINs (User Name, Dept Name) |
| `GET` | `/api/complaints/:id` | Fetch complaint with User info, Dept info & Status history |
| `POST` | `/api/complaints` | Register new complaint |
| `PUT` | `/api/complaints/:id` | Update complaint details & state |
| `DELETE` | `/api/complaints/:id` | Delete complaint record |

### ⏱️ Status APIs
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/complaints/:id/statuses` | Get status history for complaint |
| `POST` | `/api/complaints/:id/statuses` | Add status update log & sync main state |
| `PUT` | `/api/statuses/:id` | Update status log record |

### 📊 Dashboard & SQL Database Explorer APIs
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard` | Fetch aggregate SQL counts & recent complaints |
| `GET` | `/api/database/tables` | Fetch overview & record counts of all SQL tables |
| `GET` | `/api/database/users` | Fetch raw `users` SQL table records |
| `GET` | `/api/database/departments` | Fetch raw `departments` SQL table records |
| `GET` | `/api/database/complaints` | Fetch raw `complaints` SQL table records |
| `GET` | `/api/database/statuses` | Fetch raw `statuses` SQL table records |
| `GET` | `/api/database/schema/:table` | Fetch column metadata from `information_schema.columns` |

---

## 📤 How to Push to GitHub

To upload this project to your GitHub account:

1. **Initialize Git repository**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Complete Complaint Management System (React + Express + PostgreSQL)"
   ```

2. **Create a repository on GitHub**:
   Go to [GitHub](https://github.com/new) and create a repository named `complaint-management-system`.

3. **Link remote and push**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/complaint-management-system.git
   git branch -M main
   git push -u origin main
   ```

---

## 📜 License & College Demonstration Note

This project is created for demonstration as a **DBMS & Full-Stack Web Application Project**. It highlights foundational software engineering principles, clean RESTful API design, database normalization, relational constraints, and React component modularity.

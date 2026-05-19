# 🐬 MySQL 8.0 Command Line Cheatsheet for DialysisTrack

This guide provides useful commands to check and manage project-related data directly from the MySQL 8.0 Command Line tool.

---

## 1️⃣ Connect to MySQL

Open your terminal or command prompt and run:
```bash
mysql -u root -p
```
*Enter your MySQL root password when prompted.*

---

## 2️⃣ Select the Project Database

Before running queries, select the DialysisTrack database:
```sql
USE dialysistrack_db;
```

---

## 3️⃣ View Database Structure

### List all tables in the database:
```sql
SHOW TABLES;
```

### View the structure (columns) of a specific table:
```sql
DESCRIBE users_user;
DESCRIBE patients_patient;
DESCRIBE machines_machine;
DESCRIBE dialysis_queue_queueentry;
```

---

## 4️⃣ Essential Queries for DialysisTrack

Here are some common queries to check your project's data:

### 👥 Check Users and Roles
View all registered users and their roles:
```sql
SELECT id, email, role, is_active FROM users_user;
```

### 👨‍⚕️ Check Patients
List all patients with their basic details:
```sql
SELECT id, first_name, last_name, phone_number, blood_group FROM patients_patient;
```
*(Note: adjust column names like `phone_number` if they differ slightly in your model)*

### 🛏️ Check Machine Status
View the status of all dialysis machines:
```sql
SELECT id, name, status, next_maintenance_date FROM machines_machine;
```

### 📋 Check Dialysis Queue
View the current queue and patient status:
```sql
SELECT id, patient_id, priority, status FROM dialysis_queue_queueentry;
```

### 💰 Check Total Records (Quick Summary)
Count how many records exist in key tables:
```sql
SELECT 'Users' as Table_Name, COUNT(*) as Total_Rows FROM users_user
UNION
SELECT 'Patients', COUNT(*) FROM patients_patient
UNION
SELECT 'Machines', COUNT(*) FROM machines_machine
UNION
SELECT 'Queue Entries', COUNT(*) FROM dialysis_queue_queueentry;
```

---

## 5️⃣ Useful Admin & Troubleshooting Commands

### Check MySQL Version:
```sql
SELECT VERSION();
```

### Show which database is currently selected:
```sql
SELECT DATABASE();
```

### Delete ALL data from a specific table (Use with caution ⚠️):
```sql
TRUNCATE TABLE dialysis_queue_queueentry;
```

### Drop the entire database (Use with HIGH caution ⚠️):
```sql
DROP DATABASE dialysistrack_db;
```

---

## 6️⃣ Single-line Terminal Commands

You don't even need to stay inside the MySQL prompt to run commands. You can execute them directly from your normal terminal:

### Quick Table View from Terminal:
```bash
mysql -u root -p dialysistrack_db -e "SHOW TABLES;"
```

### Run a specific query from Terminal:
```bash
mysql -u root -p dialysistrack_db -e "SELECT email, role FROM users_user;"
```

---

## 7️⃣ Exit MySQL

When you're done, you can exit the MySQL command line tool:
```sql
EXIT; 
-- or
QUIT;
```

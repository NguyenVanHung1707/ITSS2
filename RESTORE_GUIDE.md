# HUST Study Document Sharing System - Database Restore & Server Reinstallation Guide

This guide describes how to reinstall the HUST Study Document Sharing System on a new server and restore all data using the local backup file `backup_hust_db.sql`.

---

## Prerequisites

Before starting, make sure you have:
1. A fresh Linux VPS (Ubuntu 22.04 LTS recommended) with Docker and Docker Compose installed.
2. The domain DNS pointed to the new VPS public IP.
3. The local repository codebase (`ITSS2`) and your database backup file `backup_hust_db.sql`.

---

## Step 1: Copy Codebase and Backup to New VPS

On your local machine, use `scp` to transfer the codebase and the backup file to your new VPS:

```bash
# 1. Transfer codebase to /root/ITSS2
scp -r -i ~/.ssh/your_vps_key ./ITSS2 root@NEW_VPS_IP:/root/

# 2. Transfer backup file to /tmp/backup_hust_db.sql
scp -i ~/.ssh/your_vps_key ./ITSS2/backup_hust_db.sql root@NEW_VPS_IP:/tmp/backup_hust_db.sql
```

---

## Step 2: Configure Environment and Launch Containers

SSH into your new VPS:
```bash
ssh -i ~/.ssh/your_vps_key root@NEW_VPS_IP
```

Navigate to the project root directory and configure the environment variables:
```bash
cd /root/ITSS2
```

Create or update the `.env` file (`nano .env`) to set the production environment credentials:
```env
DB_USER=postgres
DB_PASS=your_strong_secure_password_here
DB_NAME=CNWEB
JWT_SECRET=your_long_random_jwt_secret_key_here
PORT=5000
DB_SYNC=alter
```

> [!IMPORTANT]
> Make sure `DB_PASS` matches the password you want to use for the database container.

Start the Docker containers in the background:
```bash
docker compose -f docker-compose.vps.yml up --build -d
```

Verify that all containers (`cnweb_db`, `cnweb_backend`, `cnweb_frontend`) are active and running:
```bash
docker ps
```

---

## Step 3: Restore Database from Backup File

Now that the PostgreSQL database container `cnweb_db` is running, we can import the backup data.

### 1. Copy backup file into DB container
Copy the uploaded `/tmp/backup_hust_db.sql` from the host VPS into the running PostgreSQL container:
```bash
docker cp /tmp/backup_hust_db.sql cnweb_db:/tmp/backup_hust_db.sql
```

### 2. Drop and Recreate the Database (Clean Slate)
If the database has been initialized with default tables by the backend connection, we should recreate a clean database schema to prevent any conflicts during the SQL import:

```bash
# Enter database bash to drop & create database
docker exec -it cnweb_db psql -U postgres -c "DROP DATABASE \"CNWEB\" WITH (FORCE);"
docker exec -it cnweb_db psql -U postgres -c "CREATE DATABASE \"CNWEB\";"
```

### 3. Restore the SQL Dump
Execute the backup file inside the container to rebuild the entire schema and populate all data:
```bash
docker exec -it cnweb_db psql -U postgres -d CNWEB -f /tmp/backup_hust_db.sql
```

> [!TIP]
> You will see several output lines like `CREATE TABLE`, `CREATE TYPE`, `COPY`, and `ALTER TABLE`. These are standard logs indicating that your database structure and data are being successfully restored.

### 4. Cleanup temporary backup files
Remove the temporary backup files inside the container and on the host server:
```bash
docker exec cnweb_db rm /tmp/backup_hust_db.sql
rm /tmp/backup_hust_db.sql
```

---

## Step 4: Restart Services & Verify

After restoring the database, restart the backend container so that Sequelize reconnects and synchronizes with the updated schema and database state:

```bash
docker restart cnweb_backend
```

### Verification Checks

1. **Check Database contents**:
   Ensure all tables are populated:
   ```bash
   docker exec -it cnweb_db psql -U postgres -d CNWEB -c "SELECT COUNT(*) FROM documents;"
   ```
   *Expected output: should return a count of `82` (representing the documents count).*

2. **Verify Public UI**:
   Open `https://thuvienso.io.vn/` (or your new domain/IP address) in your browser.
   - Search results should populate correctly.
   - 10 documents should show up on each page.
   - Clicking document cards should display all file links under their respective tabs without issues.

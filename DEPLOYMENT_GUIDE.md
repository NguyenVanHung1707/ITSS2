# HUST Study Document Sharing System - VPS Deployment Guide

This guide walks you through deploying the dockerized HUST Study Document Sharing System onto your VPS under the domain `https://thuvienso.io.vn/` with automatic SSL certificates handled by **Caddy**.

---

## Prerequisites

Before starting, ensure you have:
1. A VPS running a Linux distribution (Ubuntu 22.04 LTS is highly recommended).
2. Root access or a user with `sudo` permissions on the VPS.
3. Access to your domain registrar's DNS panel for `thuvienso.io.vn`.

---

## Step 1: Point Your DNS Records
Go to your domain registrar (where you registered `thuvienso.io.vn`) and set up the following **A Records**:

| Type | Host | Value / Target | TTL |
| :--- | :--- | :--- | :--- |
| A | `@` (or leave blank) | `YOUR_VPS_PUBLIC_IP` | 3600 (or default) |
| A | `www` | `YOUR_VPS_PUBLIC_IP` | 3600 (or default) |

> [!NOTE]
> DNS propagation can take anywhere from a few minutes to a couple of hours. You can verify if it's updated using:
> `ping thuvienso.io.vn` or `dig thuvienso.io.vn`

---

## Step 2: Prepare Your VPS Server
Connect to your VPS via SSH (`ssh root@YOUR_VPS_PUBLIC_IP`) and execute the following:

### 1. Update package registry
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Docker & Docker Compose
If you do not have Docker installed, use the official quick script:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```
Verify the installation:
```bash
docker --version
docker compose version
```

### 3. Open Ports in Firewall
Ensure ports 80 and 443 are open to allow Let's Encrypt to issue certificates and handle public traffic:
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp  # CRITICAL: Keep SSH open!
sudo ufw enable
```

---

## Step 3: Upload Project Files to VPS
Compress your project directory (excluding `.git`, `node_modules` folders) and upload it to your VPS. You can use SFTP, SCP, or Git.

For example, using SCP from your local machine:
```bash
scp -r ./ITSS2 root@YOUR_VPS_PUBLIC_IP:/root/
```

---

## Step 4: Configure Production Environment (`.env`)
Navigate to the project root directory on your VPS:
```bash
cd /root/ITSS2
```
Edit or create the `.env` file (`nano .env`) to match your production environment variables:
```env
DB_USER=postgres
DB_PASS=your_strong_secure_password_here
DB_NAME=CNWEB
JWT_SECRET=your_long_random_jwt_secret_key_here
PORT=5000
DB_SYNC=alter
```

---

## Step 5: Launch Production Containers
To build and launch all services securely under Caddy on your VPS, run:
```bash
docker compose -f docker-compose.prod.yml up --build -d
```

This command will:
1. Pull the official images for PostgreSQL and Caddy.
2. Compile and build the Express API container privately.
3. Compile the Vite/React static assets and host them inside Nginx (frontend container).
4. Launch Caddy, which automatically contacts Let's Encrypt, generates SSL/TLS certificates, configures HTTPS redirects, and proxies external requests to your frontend container.

---

## Step 6: Verify and Monitor

### 1. Check container health
```bash
docker ps
```
You should see 4 active containers: `cnweb_caddy`, `cnweb_frontend`, `cnweb_backend`, and `cnweb_db`.

### 2. Monitor Caddy SSL Issuance
If you want to make sure Let's Encrypt certificates were fetched successfully:
```bash
docker logs -f cnweb_caddy
```
Look for lines like `certificate obtained successfully` or `renewing certificate`.

### 3. Access your secure domain!
Open your web browser and navigate to:
👉 **`https://thuvienso.io.vn/`**

Verify that:
- The connection is encrypted (shows a padlock 🔒 icon in the URL bar).
- Static assets and HUST branding render correctly.
- Searching for course codes, viewing files, and reviews operate normally.

---

## Useful Command Cheat Sheet

- **Stop the application**:
  `docker compose -f docker-compose.prod.yml down`
- **Restart the application**:
  `docker compose -f docker-compose.prod.yml restart`
- **View backend logs**:
  `docker logs -f cnweb_backend`
- **Check Postgres DB backup**:
  `docker exec -t cnweb_db pg_dumpall -c -U postgres > backup.sql`

---

## Step 7: Configure GitHub Actions CI/CD Pipeline (Automated Deployments)

To make every push to your `main` or `master` branch automatically deploy updates to `https://thuvienso.io.vn/`, set up GitHub Actions:

### 1. Generate SSH Keys on VPS
If you do not have SSH keys configured on your VPS, generate a keypair as root:
```bash
ssh-keygen -t ed25519 -C "github-actions"
```
Press enter to accept all defaults (no passphrase).

Add the public key to authorized keys so GitHub can log in:
```bash
cat ~/.ssh/id_ed25519.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

Get your **Private Key** (this is what you will provide to GitHub):
```bash
cat ~/.ssh/id_ed25519
```
*Copy the entire output, including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`.*

### 2. Configure GitHub Secrets
Navigate to your repository page on GitHub. Go to **Settings > Secrets and variables > Actions > New repository secret** and add the following 3 secrets:

1. **`VPS_HOST`**: Your VPS public IP address (e.g., `123.45.67.89`).
2. **`VPS_USER`**: Your login username, which is `root`.
3. **`VPS_SSH_KEY`**: The private key you copied in the previous step.

### 3. Verification
Commit and push `.github/workflows/deploy.yml` and `docker-compose.prod.yml` to your repository:
```bash
git add .
git commit -m "Configure GitHub Actions CI/CD and production Caddy settings"
git push origin main
```
Navigate to the **Actions** tab in GitHub. You will see your deployment workflow run:
- **CI Job**: Will verify your backend and build the React frontend successfully to catch compile errors.
- **CD Job**: Will securely SSH into your VPS, pull the latest code, and execute the production container rebuild!


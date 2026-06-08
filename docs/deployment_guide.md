# CDSS Deployment & Setup Guide

This guide details the step-by-step instructions for running the Clinical Decision Support System (CDSS) locally for development, and deploying it in production using Docker Compose.

---

## 1. Prerequisites

Ensure you have the following installed on your machine:
* **Python** 3.12+
* **Node.js** v20+ and **npm** v10+
* **Docker** & **Docker Compose** (for production deployments)

---

## 2. Local Development Setup (Quickstart)

This method uses **SQLite** as the database and an **in-memory cache fallback**, making it self-contained and runnable out-of-the-box.

### Step A: Clone & Set Up Backend

1. Navigate to the root directory `clinical_decision_support/`.
2. Create a Python virtual environment:
   ```bash
   python -m venv .venv
   ```
3. Activate the virtual environment:
   * **Windows (PowerShell):** `.venv\Scripts\Activate.ps1`
   * **Windows (CMD):** `.venv\Scripts\activate.bat`
   * **Linux/macOS:** `source .venv/bin/activate`
4. Install python dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
5. Copy configuration templates:
   ```bash
   cp .env.example .env
   ```
6. Run validation checks to verify your ML pipeline and database logic are operational:
   ```bash
   python backend/tests/run_tests.py
   ```
7. Start the FastAPI backend server:
   ```bash
   python -m uvicorn backend.api.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   The backend API docs will be active at: `http://127.0.0.1:8000/docs`

### Step B: Set Up Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
4. Access the web app in your browser at: `http://localhost:5173/`

### Default Logins:
Use these accounts to test Role-Based Access Control (RBAC):
* **Doctor Profile:** User `doctor` / Password `doctor`
* **Admin Profile:** User `admin` / Password `admin`
* **Analyst Profile:** User `analyst` / Password `analyst`
* **Nurse Profile:** User `nurse` / Password `nurse`

---

## 3. Production Deployment with Docker Compose

This orchestrates the entire application (Frontend, Backend, PostgreSQL Database, Redis Caching, and MLflow tracking).

### Step A: Configure environment variables
Ensure the values inside the `.env` file are set up. Note that `docker-compose.yml` automatically passes standard DB credentials between services.

### Step B: Launch Containers
Run the build and startup command from the root directory:
```bash
docker-compose up --build -d
```

### Services Checklist:
Once started, the services will occupy the following ports:
* **Frontend Web App (Nginx):** `http://localhost:80`
* **Backend Gateway (FastAPI):** `http://localhost:8000`
* **MLflow Registry Server:** `http://localhost:5000`
* **PostgreSQL Database:** Port `5432`
* **Redis Cache:** Port `6379`

### Stopping the Services:
To shut down and clean container volumes:
```bash
docker-compose down -v
```

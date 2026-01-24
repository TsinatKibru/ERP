# Development Guide

## Getting Started

### 1. Requirements
- Node.js (v20+)
- Docker and Docker Compose

### 2. Infrastructure Setup
Start the required services using Docker:
```bash
docker-compose up -d
```

### 3. Backend Setup
```bash
cd backend
npm install
npm run start:dev
```
The backend will be available at `http://localhost:3000`.

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend will be available at `http://localhost:5173`.

## Health Check
You can verify the connectivity between the backend and infrastructure services via the health check endpoint:
`GET http://localhost:3000/health`

Expected response:
```json
{
  "status": "OK",
  "database": "OK",
  "redis": "OK",
  "rabbitmq": "OK"
}
```

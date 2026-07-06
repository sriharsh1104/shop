# Shop — E-Commerce Platform

A full-stack e-commerce application with a React frontend and Node.js microservices backend.

## Project Structure

```
shop/
├── frontend/          # React + Vite + TypeScript SPA
├── backend/
│   ├── services/
│   │   ├── user-service/     # Authentication & user management
│   │   ├── email-service/    # OTP verification & notifications
│   │   └── product-service/  # Product catalog
│   └── docker-compose.yml
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+

### Backend Services

```bash
# Terminal 1 — User Service (port 3001)
cd backend/services/user-service && npm install && npm run dev

# Terminal 2 — Email Service (port 3002)
cd backend/services/email-service && npm install && npm run dev

# Terminal 3 — Product Service (port 3003)
cd backend/services/product-service && npm install && npm run dev
```

### Frontend

```bash
cd frontend && npm install && npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Architecture

| Service        | Port | Responsibility                          |
|----------------|------|-----------------------------------------|
| user-service   | 3001 | Signup, login, JWT auth, user profiles  |
| email-service  | 3002 | OTP generation, email notifications     |
| product-service| 3003 | Product listing and management          |

## Auth Flow

1. User signs up with email, username, phone, and password
2. Email service sends a 6-digit OTP
3. User verifies OTP on the verification page
4. Account is activated and user is redirected to the dashboard

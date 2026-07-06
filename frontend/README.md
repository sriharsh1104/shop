# Frontend — React SPA

React + Vite + TypeScript single-page application for the Shop e-commerce platform.

## Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── common/      # Buttons, inputs, layout
│   │   └── products/    # Product cards, grid
│   ├── context/         # React context (auth state)
│   ├── hooks/           # Custom hooks
│   ├── pages/           # Route-level page components
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── OtpPage.tsx
│   │   └── DashboardPage.tsx
│   ├── services/        # API client modules
│   ├── types/           # TypeScript interfaces
│   ├── utils/           # Helpers
│   ├── App.tsx          # Root component & routing
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── index.html
├── vite.config.ts
└── tsconfig.json
```

## Pages

| Route        | Page       | Description                              |
|--------------|------------|------------------------------------------|
| `/login`     | Login      | Email + password login                   |
| `/signup`    | Signup     | Register with email, username, phone     |
| `/verify-otp`| OTP        | 6-digit email verification               |
| `/dashboard` | Dashboard  | Product catalog (protected route)        |

## Setup

```bash
npm install
npm run dev
```

Runs at [http://localhost:5173](http://localhost:5173)

## Environment

Copy `.env.example` to `.env`:

```
VITE_USER_SERVICE_URL=http://localhost:3001
VITE_PRODUCT_SERVICE_URL=http://localhost:3003
```

## Build

```bash
npm run build
npm run preview
```

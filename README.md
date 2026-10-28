# Arsalan Portfolio

A full-stack MERN portfolio and services platform for **Arsalan Akhtar**, featuring a public portfolio site, a complete admin dashboard, blog/gallery management, orders, Stripe payments, and an AI chatbot.

## Live Site

- **Frontend:** _coming soon_
- **API:** _coming soon_

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | Next.js 16 (App Router), React 19, Bootstrap 5, Redux Toolkit, i18next |
| Backend | Node.js, Express 5, Mongoose, JWT, bcrypt, Helmet, express-rate-limit |
| Database | MongoDB Atlas |
| Storage | Cloudinary |
| Payments | Stripe |
| Email | Nodemailer (SMTP) |
| Deployment | Vercel (frontend + serverless API) |

## Features

- Public portfolio: home, about, projects, services, blogs, gallery, contact
- Project/service filtering, search, reviews and related items
- User accounts: signup, email verification, OTP/2FA, password reset, wishlist, cart, checkout, orders
- Admin dashboard: projects, services, categories, technologies, skills, slugs, banners, gallery, blogs, users, orders, promo codes, contact queries, resume, chatbot settings
- Stripe payment flow
- Cloudinary image/video uploads
- AI chatbot powered by Gemini

## Project Structure

```text
arsalan-portfolio/
├── frontend/          # Next.js 16 application
├── backend/           # Express API
│   ├── api/           # Vercel serverless entry point
│   └── src/           # controllers, models, routes, services
├── services/          # Service poster images
├── portfolio-document/# Design references
└── resume-and-mockup-images/
```

## Local Development

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in your values
npm run dev
```

The API runs on `http://localhost:5000`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # fill in your values
npm run dev
```

The frontend runs on `http://localhost:3000`.

### Environment Variables

Backend:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/arsalan-portfolio
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_FOLDER=...
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
FROM_EMAIL=...
FROM_NAME=...
STRIPE_SECRET_KEY=...
STRIPE_PUBLISHABLE_KEY=...
GEMINI_API_KEY=...
GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai
FRONTEND_URL=http://localhost:3000
CLIENT_URL=http://localhost:3000
ADMIN_NAME=...
ADMIN_EMAIL=...
ADMIN_PASSWORD=...
```

Frontend:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
NEXT_PUBLIC_APP_NAME=Arsalan Portfolio
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> Never commit `.env` files. They are ignored by Git.

## Deployment

The repository is set up as two Vercel projects:

1. **API** — root directory `backend`, serverless entry `backend/api/index.js`
2. **Frontend** — root directory `frontend`

The frontend proxies `/api/*` and `/services-images/*` to the API through `BACKEND_URL`, keeping auth cookies first-party.

### Seed / migrate data

```bash
cd backend
npm run seed          # categories, technologies, slugs, skills
node src/seedProjects.js
```

## Scripts

Backend:

- `npm run dev` — nodemon development server
- `npm start` — production server
- `npm run seed` — seed core taxonomy data

Frontend:

- `npm run dev` — Next.js development server
- `npm run build` — production build
- `npm start` — production server
- `npm run lint` — ESLint

## License

Private project. All rights reserved.

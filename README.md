# Expense Manager

A full-stack expense tracker built with Next.js, MongoDB, Redux Toolkit, SWR, and Tailwind CSS.

## Features

- Email/password registration and login with HTTP-only JWT sessions
- Protected dashboard and expense management pages
- Create, edit, delete, search, filter, and paginate expenses
- Category totals and page-level summary cards
- Protected, personalized insight cards for trends and top categories
- Responsive desktop and mobile layouts
- MongoDB persistence for users, expenses, and insight data

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example`, set a `JWT_SECRET` with at least 32 characters, and configure MongoDB:

```bash
MONGODB_URI="mongodb://127.0.0.1:27017"
MONGODB_DB="expense-manager"
```

3. Start the development server:

```bash
npm run dev
```

Open `http://127.0.0.1:3000` in your browser.

If you have existing local JSON data, migrate it into MongoDB once:

```bash
npm run migrate:json
```

## Useful Scripts

```bash
npm run lint
npm run build
npm run migrate:json
```

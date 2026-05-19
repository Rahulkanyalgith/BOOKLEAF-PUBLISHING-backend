
# Backend setup (BookLeaf)

This guide shows how to run the backend without errors and how to create a valid `DATABASE_URL`.

## 1) Prerequisites

- Node.js 18+ installed
- A PostgreSQL database (local or Supabase)

## 2) Create and configure .env

Copy the example file and edit it:

```bash
copy .env.example .env
```

Required values:

- `DATABASE_URL`
- `JWT_SECRET` (at least 32 chars)

### How to generate DATABASE_URL (Supabase)

1. Open your Supabase project.
2. Go to **Project Settings -> Database**.
3. Copy the **Connection string (URI)**.
4. Paste it into `.env` as `DATABASE_URL`.

Example format:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public&sslmode=require"
```

### If your password has special characters

Special characters like `@` or `#` must be URL-encoded. Use PowerShell to encode the password:

```powershell
[uri]::EscapeDataString("YOUR_PASSWORD_HERE")
```

Then use the encoded password in `DATABASE_URL`.

## 3) Install dependencies

```bash
cd backend
npm install
```

## 4) Prisma migrate and generate

```bash
npm run prisma:migrate
npm run prisma:generate
```

If Prisma complains about schema datasource `url`, this project is already configured for Prisma 7 using `prisma.config.ts`, so the schema should NOT contain `url`.

## 5) Seed sample data

```bash
npm run seed
```

This loads data from `bookleaf_sample_data.json` and creates sample users/books.

## 6) Run the backend

```bash
npm run dev
```

Server will run at `http://localhost:5000` and Swagger docs at `http://localhost:5000/api/docs`.

## Common errors

### P1013: empty host in database URL

Cause: special characters in the password are not URL-encoded.

Fix: encode the password and update `DATABASE_URL` as shown above.

### Connection refused / SSL error

Supabase requires SSL. Make sure `sslmode=require` is in `DATABASE_URL`.

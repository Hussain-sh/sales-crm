# Sales CRM

AI-powered sales CRM for managing leads, logging interactions, prioritizing follow-ups, and viewing pipeline health.

## Features

- Create, edit, and delete leads
- Add lead interactions
- Recalculate AI priority scores from lead and interaction history
- Generate AI follow-up messages
- View an AI focus list of priority leads
- View pipeline summary with total value and stage distribution

## Tech Stack

Frontend:
- Next.js
- React
- Material UI
- TanStack Query
- Formik
- Yup
- Axios

Backend:
- Node.js
- Express
- PostgreSQL
- Groq API through the OpenAI-compatible SDK

## Project Structure

```txt
backend/
  config/
  controllers/
  middleware/
  models/
  routes/
  services/
  utils/
  schema.sql

frontend/
  src/app/
  src/app/components/
  src/services/
  src/types/
  src/validations/
```

## Environment Variables

Backend:

```txt
PORT=8000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
DB_SSL=false
GROQ_API_KEY=your_groq_api_key
CLIENT_URL=http://localhost:3000
CLIENT_URLS=
```

Frontend:

```txt
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Use `DB_SSL=true` in production if the hosted PostgreSQL provider requires SSL.

## Local Setup

### Backend

```bash
cd backend
npm install
npm start
```

The backend runs on:

```txt
http://localhost:8000
```

Health check:

```txt
GET /health
```

### Database

Create the database tables by running:

```bash
psql "YOUR_DATABASE_URL" -f backend/schema.sql
```

Or paste the contents of `backend/schema.sql` into your PostgreSQL SQL editor.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on:

```txt
http://localhost:3000
```

## API Endpoints

### Leads

```txt
GET    /leads
POST   /leads
GET    /leads/:id
PATCH  /leads/:id
DELETE /leads/:id
```

### Interactions

```txt
POST /leads/:id/interactions
GET  /leads/:id/interactions
```

### AI Features

```txt
POST /leads/:id/recalculate-score
POST /leads/:id/generate-followup
GET  /leads/focus-list
```

### Pipeline

```txt
GET /leads/pipeline-summary
```

## Deployment

### Backend on Railway

Create a Railway service from the GitHub repo and set the root directory to:

```txt
backend
```

Use:

```txt
Start command: npm start
```

Set backend environment variables:

```txt
DATABASE_URL=${{Postgres.DATABASE_URL}}
DB_SSL=true
GROQ_API_KEY=your_groq_api_key
CLIENT_URL=https://your-vercel-app.vercel.app
```

Run `backend/schema.sql` once against the Railway PostgreSQL database.

### Frontend on Vercel

Create a Vercel project from the GitHub repo and set the root directory to:

```txt
frontend
```

Set frontend environment variables:

```txt
NEXT_PUBLIC_API_URL=https://your-railway-backend-url
```

After Vercel deployment, update the Railway backend `CLIENT_URL` to the Vercel app URL and redeploy the backend so CORS allows the frontend.

## Notes

Authentication and role-based access control are not implemented yet. The pipeline summary page is currently accessible without login and can later be protected for manager or admin users.

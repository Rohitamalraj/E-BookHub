# E-BooksHub

Full-stack e-book marketplace built for OOSE Exercise 7.

**Stack:** Next.js 15 · Django REST Framework · Supabase (PostgreSQL)

## Setup

### Frontend
```bash
cd frontend
pnpm install        # or npm install --legacy-peer-deps
cp .env.local.example .env.local   # fill in NEXT_PUBLIC_API_URL
pnpm dev
```

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate       # Windows
pip install -r requirements.txt
cp .env.example .env        # fill in DB credentials
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## Team
B02_Team_09

## Deployment

### 1. Backend (Render/Railway)

Build/start commands (Render):

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:$PORT
```

Recommended environment variables for backend:

```dotenv
SECRET_KEY=your-strong-secret-key
DEBUG=False
ALLOWED_HOSTS=your-backend-domain.onrender.com

DB_NAME=postgres
DB_USER=postgres.<your-project-ref>
DB_PASSWORD=<your-db-password>
DB_HOST=<session-pooler-host>
DB_PORT=5432

CORS_ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app

SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
SUPABASE_STORAGE_COVER_BUCKET=ebook-covers
SUPABASE_STORAGE_PDF_BUCKET=ebook-pdfs
SUPABASE_SIGNED_URL_EXPIRES_IN=3600
BACKEND_PUBLIC_ORIGIN=https://your-backend-domain.onrender.com
```

### 2. Frontend (Vercel)

Set this env var in Vercel:

```dotenv
NEXT_PUBLIC_API_URL=https://your-backend-domain.onrender.com/api
```

### 3. Post-deploy checks

1. Register/login works.
2. Admin can upload cover + PDF.
3. Customer can buy and see owned books in `My Library`.
4. Reader opens only purchased books.

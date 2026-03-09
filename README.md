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

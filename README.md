# E-BooksHub

E-BooksHub is a full-stack OOSE (Object-Oriented Software Engineering) project developed by B02_Team_09.

The platform allows users to discover, buy, and read e-books securely, while admins manage the catalog.

## Project Goal

Build a role-based digital e-book platform that demonstrates:

- Object-oriented design in backend modules
- Role-based access control (Admin vs Customer)
- Secure digital content access after purchase
- Practical full-stack deployment using modern cloud tools

## Tech Stack

- Frontend: Next.js, TypeScript
- Backend: Django, Django REST Framework
- Database: Supabase PostgreSQL
- File Storage: Supabase Storage
- Deployment: Vercel (frontend), Render (backend)

## Core Features

- User registration and login
- Admin book management (create, update, delete)
- Customer book browsing and cart workflow
- Checkout and ownership-based library access
- Secure reader endpoint for purchased books only
- Role separation enforced in backend APIs and frontend routes

## Project Structure

```text
OOSE/
	backend/     Django API, business logic, auth, secure reader
	frontend/    Next.js client app (UI, auth flow, reader screens)
```

## Local Setup

### 1. Backend setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python manage.py migrate
python manage.py runserver
```

Backend default URL:

```text
http://localhost:8000
```

### 2. Frontend setup

```bash
cd frontend
pnpm install
copy .env.local.example .env.local
pnpm dev
```

Frontend default URL:

```text
http://localhost:3000
```

## Environment Variables

### Backend important values

```dotenv
SECRET_KEY=your-secret
DEBUG=False
ALLOWED_HOSTS=your-backend-domain.onrender.com,localhost,127.0.0.1

DB_NAME=postgres
DB_USER=postgres.<your-project-ref>
DB_PASSWORD=your-db-password
DB_HOST=aws-1-ap-southeast-2.pooler.supabase.com
DB_PORT=5432

CORS_ALLOWED_ORIGINS=http://localhost:3000,https://e-book-hub.vercel.app,https://e-bookhub.vercel.app
CSRF_TRUSTED_ORIGINS=http://localhost:3000,https://e-book-hub.vercel.app,https://e-bookhub.vercel.app

SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_COVER_BUCKET=ebook-covers
SUPABASE_STORAGE_PDF_BUCKET=ebook-pdfs
SUPABASE_SIGNED_URL_EXPIRES_IN=3600
BACKEND_PUBLIC_ORIGIN=https://your-backend-domain.onrender.com
```

### Frontend important value

```dotenv
NEXT_PUBLIC_API_URL=https://your-backend-domain.onrender.com/api
```

## OOSE Design Summary

This project applies OOSE principles by separating responsibilities into clear modules:

- Users module: authentication and role information
- Books module: catalog and content metadata
- Transactions module: cart, checkout, ownership
- Secureview module: controlled reader access

Each module has focused classes and endpoints, reducing coupling and improving maintainability.

## Role-Based Behavior

### Admin

- Can access admin dashboard
- Can add, update, and delete books
- Cannot use customer purchase flow as a normal buyer

### Customer

- Can browse books and purchase
- Can access only owned books in library
- Can read only purchased books

## Testing Checklist

Use this quick checklist for QA/demo:

1. Register and login as customer
2. Browse books and add one to cart
3. Complete checkout
4. Verify purchased title appears in library
5. Open reader and confirm access works
6. Try opening an unpurchased book and confirm access is blocked
7. Login as admin and perform create, update, delete on books
8. Verify no CORS/login failures in deployed environment

## Deployment Notes

### Backend (Render)

```bash
pip install -r requirements.txt
python manage.py migrate
gunicorn ebook_backend.wsgi:application --bind 0.0.0.0:$PORT
```

### Frontend (Vercel)

- Root directory: frontend
- Build command: pnpm run build
- Output: Next.js default
- Set NEXT_PUBLIC_API_URL in Vercel project settings

## Team

B02_Team_09

## License

Academic project for OOSE coursework.

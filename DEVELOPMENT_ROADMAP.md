# OOSE Exercise 7 — System Implementation Roadmap
**Team:** B02_Team_09  
**Stack:** Next.js · Django REST Framework · Supabase (PostgreSQL)

---

## System Architecture

```
Next.js Frontend
      │
      │  REST API (HTTP/JSON)
      ▼
Django Backend (DRF)
      │
      │  ORM (psycopg2)
      ▼
Supabase PostgreSQL
      │
      ▼
Supabase Storage (E-book PDFs + Cover Images)
```

**Flow:** User → Next.js UI → Django API → Supabase DB → Response → UI

---

## Project Folder Structure

### Backend (Django)
```
ebook_backend/
├── manage.py
├── ebook_backend/
│   ├── settings.py
│   └── urls.py
└── apps/
    ├── users/
    ├── books/
    ├── transactions/
    └── secureview/
```

### Frontend (Next.js) — existing workspace
```
frontend/
├── app/
│   ├── login/
│   ├── register/
│   ├── books/
│   ├── cart/
│   ├── reader/
│   └── admin/
├── components/
│   ├── BookCard.tsx
│   ├── Navbar.tsx
│   └── CartItem.tsx
└── lib/
    └── api.ts
```

---

## Database Design (Supabase)

### `users`
| Column | Type |
|---|---|
| id | uuid (PK) |
| email | varchar |
| password | varchar (hashed) |
| role | varchar (`customer` / `admin`) |
| created_at | timestamp |

### `books`
| Column | Type |
|---|---|
| id | uuid (PK) |
| title | varchar |
| author | varchar |
| isbn | varchar |
| genre | varchar |
| price | float |
| description | text |
| cover_image | text (URL) |
| file_url | text (URL) |
| created_at | timestamp |

### `transactions`
| Column | Type |
|---|---|
| id | uuid (PK) |
| user_id | uuid (FK → users) |
| total_amount | float |
| payment_method | varchar |
| status | varchar |
| transaction_date | timestamp |

### `transaction_items`
| Column | Type |
|---|---|
| id | uuid (PK) |
| transaction_id | uuid (FK → transactions) |
| book_id | uuid (FK → books) |

### `user_library`
| Column | Type |
|---|---|
| id | uuid (PK) |
| user_id | uuid (FK → users) |
| book_id | uuid (FK → books) |

---

## Step-by-Step Implementation

---

### Step 1 — Setup Supabase

- [ ] Create a new Supabase project at [supabase.com](https://supabase.com)
- [ ] Create the five tables above using the SQL editor or Table UI
- [ ] Create two storage buckets:
  - `ebook-pdfs` (private)
  - `ebook-covers` (public)
- [ ] Copy the **Project URL** and **anon/service_role API keys** for use in Django settings

---

### Step 2 — Create Django Project

```bash
# Create and activate virtualenv
python -m venv venv
venv\Scripts\activate        # Windows

# Install dependencies
pip install django djangorestframework psycopg2-binary django-cors-headers PyJWT

# Start project
django-admin startproject ebook_backend
cd ebook_backend

# Create apps
python manage.py startapp users
python manage.py startapp books
python manage.py startapp transactions
python manage.py startapp secureview
```

---

### Step 3 — Django Models

**`users/models.py`**
```python
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    role = models.CharField(max_length=20, default='customer')
```

**`books/models.py`**
```python
from django.db import models

class EBook(models.Model):
    title       = models.CharField(max_length=255)
    author      = models.CharField(max_length=255)
    isbn        = models.CharField(max_length=50)
    genre       = models.CharField(max_length=100)
    price       = models.FloatField()
    description = models.TextField()
    cover_image = models.TextField(blank=True)
    file_url    = models.TextField()
    created_at  = models.DateTimeField(auto_now_add=True)
```

**`transactions/models.py`**
```python
from django.db import models
from users.models import User
from books.models import EBook

class Transaction(models.Model):
    user             = models.ForeignKey(User, on_delete=models.CASCADE)
    total_amount     = models.FloatField()
    payment_method   = models.CharField(max_length=50)
    status           = models.CharField(max_length=50, default='pending')
    transaction_date = models.DateTimeField(auto_now_add=True)

class TransactionItem(models.Model):
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE)
    book        = models.ForeignKey(EBook, on_delete=models.CASCADE)

class UserLibrary(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    book = models.ForeignKey(EBook, on_delete=models.CASCADE)
```

---

### Step 4 — Connect Django to Supabase

In `ebook_backend/settings.py`:

```python
AUTH_USER_MODEL = 'users.User'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME':     '<supabase_db_name>',
        'USER':     'postgres',
        'PASSWORD': '<supabase_db_password>',
        'HOST':     '<supabase_host>',
        'PORT':     '5432',
    }
}

INSTALLED_APPS = [
    ...
    'rest_framework',
    'corsheaders',
    'users',
    'books',
    'transactions',
    'secureview',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    ...
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]
```

Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

---

### Step 5 — REST API Endpoints

#### Authentication (`/api/`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/register` | Register new user | Public |
| POST | `/api/login` | Login, returns JWT token | Public |

#### Books (`/api/books/`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/books` | List all books | Public |
| GET | `/api/books/:id` | Get single book | Public |
| POST | `/api/books` | Upload new book | Admin |
| PUT | `/api/books/:id` | Edit book details | Admin |
| DELETE | `/api/books/:id` | Delete book | Admin |

#### Cart (`/api/cart/`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/cart` | View cart | Customer |
| POST | `/api/cart/add` | Add book to cart | Customer |
| POST | `/api/cart/remove` | Remove book from cart | Customer |

#### Purchase (`/api/`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/checkout` | Creates transaction + user_library records | Customer |

#### Secure Reader (`/api/reader/`)
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/reader/:book_id` | Verify ownership, return book URL | Customer |

Secure reader logic:
```python
def get(self, request, book_id):
    owns_book = UserLibrary.objects.filter(
        user=request.user, book_id=book_id
    ).exists()
    if not owns_book:
        return Response({'error': 'Access denied'}, status=403)
    book = EBook.objects.get(id=book_id)
    return Response({'file_url': book.file_url})
```

---

### Step 6 — Next.js Frontend Pages

#### Pages to create
| Route | Page | Features |
|---|---|---|
| `/login` | Login | Auth form, JWT storage |
| `/register` | Register | Sign up form |
| `/books` | Marketplace | Search, filter, add to cart |
| `/cart` | Cart | Item list, total, checkout button |
| `/reader/[bookId]` | PDF Reader | Loads purchased book via `react-pdf` |
| `/admin` | Admin Dashboard | Upload, edit, delete books |

#### API client — `lib/api.ts`
```typescript
const BASE_URL = "http://localhost:8000/api"

function getToken() {
  return localStorage.getItem("token")
}

export async function getBooks() {
  const res = await fetch(`${BASE_URL}/books`)
  return res.json()
}

export async function login(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
  return res.json()
}

export async function checkout(cartItems: number[]) {
  const res = await fetch(`${BASE_URL}/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ items: cartItems }),
  })
  return res.json()
}

export async function getBookForReader(bookId: string) {
  const res = await fetch(`${BASE_URL}/reader/${bookId}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  return res.json()
}
```

---

### Step 7 — Secure View (PDF Reader)

Install PDF viewer in the frontend:
```bash
pnpm add react-pdf
```

Usage in `/reader/[bookId]/page.tsx`:
```tsx
import { Document, Page } from 'react-pdf'

export default function ReaderPage({ params }: { params: { bookId: string } }) {
  const [fileUrl, setFileUrl] = useState<string | null>(null)

  useEffect(() => {
    getBookForReader(params.bookId).then(data => {
      if (data.file_url) setFileUrl(data.file_url)
    })
  }, [params.bookId])

  if (!fileUrl) return <p>Access denied or loading...</p>

  return <Document file={fileUrl}><Page pageNumber={1} /></Document>
}
```

This implements the **SecureView** pattern from your sequence diagram: the backend verifies ownership before handing back the resource URL.

---

## Minimum Demo Checklist (Exercise 7)

These seven flows must work end-to-end for a passing demo:

- [ ] **1. Register** — New user creates an account
- [ ] **2. Login** — User authenticates and receives a JWT
- [ ] **3. Browse Books** — User sees the book catalogue with search/filter
- [ ] **4. Add to Cart** — User adds one or more books to cart
- [ ] **5. Purchase** — Checkout creates a transaction and updates user_library
- [ ] **6. Read Book** — User opens a purchased book in the secure reader
- [ ] **7. Admin Upload** — Admin logs in and uploads a new book with cover + PDF

---

## UML Class → Implementation Mapping

| UML Class | Django Model | Next.js Page/Component |
|---|---|---|
| `Customer` | `User` (role=customer) | `/login`, `/register`, `/books` |
| `Admin` | `User` (role=admin) | `/admin` |
| `EBook` | `EBook` | `BookCard.tsx`, `/books`, `/reader` |
| `Transaction` | `Transaction` + `TransactionItem` | `/cart`, checkout API |
| `SecureView` | `secureview` app endpoint | `/reader/[bookId]` |

---

## Tech Version Reference

| Technology | Version |
|---|---|
| Next.js | 14+ (App Router) |
| Django | 4.x |
| Django REST Framework | 3.x |
| psycopg2-binary | latest |
| django-cors-headers | latest |
| Supabase | cloud-hosted |
| react-pdf | 7.x |
| pnpm | 8+ |

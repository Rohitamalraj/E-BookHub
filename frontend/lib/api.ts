const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token")
}

function authHeaders(): HeadersInit {
  const token = getToken()
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" }
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function register(email: string, password: string, username: string) {
  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, username }),
  })
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

// ── Books ─────────────────────────────────────────────────────────────────────

export async function getBooks() {
  const res = await fetch(`${BASE_URL}/books`)
  return res.json()
}

export async function getBook(id: string) {
  const res = await fetch(`${BASE_URL}/books/${id}`)
  return res.json()
}

export async function createBook(data: FormData) {
  const token = getToken()
  const res = await fetch(`${BASE_URL}/books`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: data,
  })
  return res.json()
}

export async function updateBook(id: string, data: FormData) {
  const token = getToken()
  const res = await fetch(`${BASE_URL}/books/${id}`, {
    method: "PUT",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: data,
  })
  return res.json()
}

export async function deleteBook(id: string) {
  const res = await fetch(`${BASE_URL}/books/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  })
  return res.json()
}

// ── Cart ──────────────────────────────────────────────────────────────────────

export async function getCart() {
  const res = await fetch(`${BASE_URL}/cart`, { headers: authHeaders() })
  return res.json()
}

export async function addToCart(bookId: string) {
  const res = await fetch(`${BASE_URL}/cart/add`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ book_id: bookId }),
  })
  return res.json()
}

export async function removeFromCart(bookId: string) {
  const res = await fetch(`${BASE_URL}/cart/remove`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ book_id: bookId }),
  })
  return res.json()
}

// ── Checkout ──────────────────────────────────────────────────────────────────

export async function checkout(bookIds: string[], paymentMethod: string) {
  const res = await fetch(`${BASE_URL}/checkout`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ book_ids: bookIds, payment_method: paymentMethod }),
  })
  return res.json()
}

// ── Secure Reader ─────────────────────────────────────────────────────────────

export async function getBookForReader(bookId: string) {
  const res = await fetch(`${BASE_URL}/reader/${bookId}`, {
    headers: authHeaders(),
  })
  return res.json()
}

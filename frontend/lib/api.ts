const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"
const API_ORIGIN = BASE_URL.replace(/\/api\/?$/, "")

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token")
}

export function isAuthenticated(): boolean {
  return Boolean(getToken())
}

export function getCurrentUser() {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem("user")
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function logout() {
  if (typeof window === "undefined") return
  localStorage.removeItem("token")
  localStorage.removeItem("user")
}

async function parseJsonSafe(res: Response) {
  try {
    return await res.json()
  } catch {
    return null
  }
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0
  const parsed = Number.parseFloat(String(value ?? ""))
  return Number.isFinite(parsed) ? parsed : 0
}

function resolveMediaUrl(value: unknown): string {
  const raw = String(value ?? "").trim()
  if (!raw) return ""
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw
  if (raw.startsWith("/")) return `${API_ORIGIN}${raw}`
  return `${API_ORIGIN}/${raw}`
}

function normalizeBook<T extends Record<string, any> | null>(book: T): T {
  if (!book || typeof book !== "object") return book
  const mapped: Record<string, any> = { ...book }
  if ("price" in mapped) {
    mapped.price = toNumber(mapped.price)
  }
  if ("cover_image" in mapped) {
    mapped.cover_image = resolveMediaUrl(mapped.cover_image)
  }
  if ("file_url" in mapped) {
    mapped.file_url = resolveMediaUrl(mapped.file_url)
  }
  return mapped as T
}

function normalizeCartItems<T extends any[]>(items: T): T {
  if (!Array.isArray(items)) return items
  return items.map((item) => {
    if (!item || typeof item !== "object" || !item.book) return item
    return { ...item, book: normalizeBook(item.book) }
  }) as T
}

function normalizeLibraryItems<T extends any[]>(items: T): T {
  if (!Array.isArray(items)) return items
  return items.map((item) => {
    if (!item || typeof item !== "object" || !item.book) return item
    return { ...item, book: normalizeBook(item.book) }
  }) as T
}

function firstErrorMessage(data: any, fallback: string): string {
  if (!data) return fallback
  if (typeof data.error === "string") return data.error
  if (typeof data.detail === "string") return data.detail
  const firstKey = Object.keys(data)[0]
  const firstValue = firstKey ? data[firstKey] : null
  if (Array.isArray(firstValue) && firstValue.length > 0) return String(firstValue[0])
  if (typeof firstValue === "string") return firstValue
  return fallback
}

function asApiError(err: unknown, fallback: string): Error {
  if (err instanceof Error) {
    if (err.message === "Failed to fetch") {
      return new Error("Cannot reach server. Please ensure backend is running on http://localhost:8000.")
    }
    return err
  }
  return new Error(fallback)
}

function authHeaders(): HeadersInit {
  const token = getToken()
  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" }
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function register(email: string, password: string, username: string) {
  try {
    const res = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, username }),
    })
    const data = await parseJsonSafe(res)
    if (!res.ok) {
      throw new Error(firstErrorMessage(data, "Registration failed"))
    }
    return data
  } catch (err) {
    throw asApiError(err, "Registration failed")
  }
}

export async function login(email: string, password: string) {
  try {
    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    const data = await parseJsonSafe(res)
    if (!res.ok) {
      throw new Error(firstErrorMessage(data, "Invalid credentials"))
    }
    return data
  } catch (err) {
    throw asApiError(err, "Login failed")
  }
}

// ── Books ─────────────────────────────────────────────────────────────────────

export async function getBooks() {
  const res = await fetch(`${BASE_URL}/books`)
  const data = await parseJsonSafe(res)
  if (Array.isArray(data)) return data.map((book) => normalizeBook(book))
  return data
}

export async function getBook(id: string) {
  const res = await fetch(`${BASE_URL}/books/${id}`)
  const data = await parseJsonSafe(res)
  return normalizeBook(data)
}

export async function createBook(data: FormData) {
  const token = getToken()
  const res = await fetch(`${BASE_URL}/books`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: data,
  })
  const payload = await parseJsonSafe(res)
  if (!res.ok) throw new Error(firstErrorMessage(payload, "Failed to create book"))
  return normalizeBook(payload)
}

export async function updateBook(id: string, data: FormData) {
  const token = getToken()
  const res = await fetch(`${BASE_URL}/books/${id}`, {
    method: "PUT",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: data,
  })
  const payload = await parseJsonSafe(res)
  if (!res.ok) throw new Error(firstErrorMessage(payload, "Failed to update book"))
  return normalizeBook(payload)
}

export async function deleteBook(id: string) {
  const res = await fetch(`${BASE_URL}/books/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  })
  const payload = await parseJsonSafe(res)
  if (!res.ok) throw new Error(firstErrorMessage(payload, "Failed to delete book"))
  return payload
}

// ── Cart ──────────────────────────────────────────────────────────────────────

export async function getCart() {
  const res = await fetch(`${BASE_URL}/cart`, { headers: authHeaders() })
  const data = await parseJsonSafe(res)
  if (!res.ok) throw new Error(firstErrorMessage(data, "Failed to load cart"))
  return normalizeCartItems(data)
}

export async function addToCart(bookId: string) {
  const res = await fetch(`${BASE_URL}/cart/add`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ book_id: bookId }),
  })
  const data = await parseJsonSafe(res)
  if (!res.ok) throw new Error(firstErrorMessage(data, "Failed to add to cart"))
  return data
}

export async function removeFromCart(bookId: string) {
  const res = await fetch(`${BASE_URL}/cart/remove`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ book_id: bookId }),
  })
  const data = await parseJsonSafe(res)
  if (!res.ok) throw new Error(firstErrorMessage(data, "Failed to remove from cart"))
  return data
}

// ── Checkout ──────────────────────────────────────────────────────────────────

export async function checkout(bookIds: string[], paymentMethod: string) {
  const res = await fetch(`${BASE_URL}/checkout`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ book_ids: bookIds, payment_method: paymentMethod }),
  })
  const data = await parseJsonSafe(res)
  if (!res.ok) throw new Error(firstErrorMessage(data, "Checkout failed"))
  return data
}

export async function getLibrary() {
  const res = await fetch(`${BASE_URL}/library`, { headers: authHeaders() })
  const data = await parseJsonSafe(res)
  if (!res.ok) throw new Error(firstErrorMessage(data, "Failed to load library"))
  return normalizeLibraryItems(data)
}

// ── Secure Reader ─────────────────────────────────────────────────────────────

export async function getBookForReader(bookId: string) {
  const res = await fetch(`${BASE_URL}/reader/${bookId}`, {
    headers: authHeaders(),
  })
  const data = await parseJsonSafe(res)
  if (!res.ok) throw new Error(firstErrorMessage(data, "Unable to open reader"))
  if (data && typeof data === "object" && "file_url" in data) {
    return { ...data, file_url: resolveMediaUrl((data as any).file_url) }
  }
  return data
}

export function getReaderStreamUrl(bookId: string) {
  const token = getToken()
  if (!token) return `${BASE_URL}/reader/${bookId}/stream`
  return `${BASE_URL}/reader/${bookId}/stream?token=${encodeURIComponent(token)}`
}

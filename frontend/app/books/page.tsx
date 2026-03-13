"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Search, ShoppingCart, Star, Filter, BookOpen } from "lucide-react"
import { LiquidButton } from "@/components/ui/liquid-glass-button"
import { getBooks, addToCart, getCart, getCurrentUser, logout } from "@/lib/api"

interface Book {
  id: string
  title: string
  author: string
  genre: string
  price: number
  description: string
  cover_image: string
}

const toPrice = (value: unknown): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const GENRES = ["All", "Fiction", "Non-Fiction", "Science", "History", "Self-Help", "Technology", "Romance", "Mystery"]

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [query, setQuery] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("All")
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const [cartCount, setCartCount] = useState(0)
  const [isAuthed, setIsAuthed] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [displayName, setDisplayName] = useState("Guest")

  useEffect(() => {
    getBooks()
      .then((data: Book[]) => { if (Array.isArray(data)) setBooks(data) })
      .catch(() => setBooks([]))
  }, [])

  useEffect(() => {
    const token = localStorage.getItem("token")
    setIsAuthed(Boolean(token))

    const user = getCurrentUser()
    setIsAdmin(user?.role === "admin")
    setDisplayName(user?.username || user?.email || "Guest")

    if (token) {
      getCart()
        .then((data) => {
          if (Array.isArray(data)) {
            setCartCount(data.length)
            setAddedIds(new Set(data.map((item: any) => String(item?.book?.id ?? "")).filter(Boolean)))
          }
        })
        .catch(() => {
          setCartCount(0)
        })
    } else {
      setCartCount(0)
      setAddedIds(new Set())
    }
  }, [])

  const filtered = books.filter((b) => {
    const matchesQuery =
      b.title.toLowerCase().includes(query.toLowerCase()) ||
      b.author.toLowerCase().includes(query.toLowerCase())
    const matchesGenre = selectedGenre === "All" || b.genre === selectedGenre
    return matchesQuery && matchesGenre
  })

  const handleAddToCart = useCallback(async (bookId: string) => {
    const token = localStorage.getItem("token")
    if (!token) {
      window.location.href = "/login"
      return
    }
    if (isAdmin) {
      window.location.href = "/admin"
      return
    }
    try {
      await addToCart(bookId)
      setAddedIds((prev) => new Set(prev).add(bookId))
      setCartCount((c) => c + 1)
    } catch {
      // Keep UI unchanged when API rejects duplicate/already-owned additions
    }
  }, [])

  const handleLogout = useCallback(() => {
    logout()
    window.location.href = "/login"
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="text-xl font-black tracking-wider text-gray-900">E-BOOKSHUB</a>

          <div className="hidden md:flex items-center gap-8">
            <a href="/books" className="font-medium text-gray-900 border-b-2 border-gray-900 pb-0.5">Browse</a>
            {isAuthed && (
              <a href="/library" className="font-medium text-gray-600 hover:text-gray-900 transition-colors">My Library</a>
            )}
          </div>

          <div className="flex items-center gap-4">
            {isAuthed && (
              <span className="hidden lg:inline-flex px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full tracking-wide">
                {displayName}
              </span>
            )}
            {!isAdmin && (
              <a href="/cart" className="relative text-gray-700 hover:text-gray-900 transition-colors" aria-label="Cart">
                <ShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-gray-900 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </a>
            )}
            {isAuthed ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <a href="/admin">
                    <LiquidButton size="sm" className="font-bold tracking-wide">Admin</LiquidButton>
                  </a>
                )}
                <LiquidButton size="sm" className="font-bold tracking-wide" onClick={handleLogout}>Logout</LiquidButton>
              </div>
            ) : (
              <a href="/login">
                <LiquidButton size="sm" className="font-bold tracking-wide">Sign In</LiquidButton>
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Banner */}
      <section className="relative bg-gray-900 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-subtle opacity-10 pointer-events-none" />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1600&q=80')" }}
        />
        <div className="relative z-10 container mx-auto px-6 text-center text-white">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl font-black tracking-wider mb-4"
          >
            BROWSE BOOKS
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-xl text-gray-300 max-w-2xl mx-auto"
          >
            Thousands of titles across every genre. Find your next great read.
          </motion.p>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="sticky top-16 z-20 bg-white border-b border-gray-200 py-4 shadow-sm">
        <div className="container mx-auto px-6 flex flex-col md:flex-row gap-4 items-center">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by title or author…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-md focus:border-gray-900 focus:outline-none text-gray-900 font-medium transition-colors"
            />
          </div>

          {/* Genre Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={16} className="text-gray-500 shrink-0" />
            {GENRES.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={`px-3 py-1.5 rounded-full text-sm font-bold tracking-wide transition-all duration-200 border-2 ${
                  selectedGenre === g
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-300 hover:border-gray-900"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Books Grid */}
      <section className="container mx-auto px-6 py-16">
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-2xl font-black tracking-wider text-gray-400">NO BOOKS FOUND</p>
            <p className="text-gray-500 mt-2">
              {books.length === 0
                ? "No books have been published yet. Add books from the admin panel."
                : "Try a different search or genre filter."}
            </p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {filtered.map((book, idx) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="group flex flex-col bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-gray-900 hover:shadow-lg transition-all duration-300"
              >
                {/* Cover */}
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                  <img
                    src={book.cover_image || "/placeholder.svg"}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-gray-900 text-white text-xs font-bold rounded-full tracking-wide">
                      {book.genre}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex flex-col flex-1 p-5 gap-3">
                  <div className="flex-1">
                    <h3 className="font-black text-gray-900 text-lg leading-tight mb-1 tracking-wide line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-600 font-medium mb-2">{book.author}</p>
                    <p className="text-sm text-gray-500 line-clamp-2">{book.description}</p>
                  </div>

                  <div className="flex items-center gap-1 text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} fill="currentColor" />
                    ))}
                    <span className="text-xs text-gray-500 ml-1 font-medium">5.0</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-2xl font-black text-gray-900">${toPrice(book.price).toFixed(2)}</span>
                    {isAdmin ? (
                      <a href="/admin">
                        <LiquidButton size="sm" className="font-bold tracking-wide text-xs">Manage</LiquidButton>
                      </a>
                    ) : (
                      <LiquidButton
                        size="sm"
                        className="font-bold tracking-wide text-xs"
                        onClick={() => handleAddToCart(book.id)}
                        disabled={addedIds.has(book.id)}
                      >
                        {addedIds.has(book.id) ? "Added ✓" : "Add to Cart"}
                      </LiquidButton>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* Footer strip */}
      <footer className="border-t border-gray-200 py-8 text-center text-gray-500 text-sm font-medium">
        © 2026 E-BooksHub. All rights reserved.
      </footer>
    </div>
  )
}

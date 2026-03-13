"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, BookOpen, Search } from "lucide-react"
import { getCurrentUser, getLibrary } from "@/lib/api"
import { LiquidButton } from "@/components/ui/liquid-glass-button"

interface LibraryBook {
  id: string
  title: string
  author: string
  genre: string
  price: number
  description: string
  cover_image: string
}

interface LibraryItem {
  id: string
  book: LibraryBook
  purchased_at: string
}

const toPrice = (value: unknown): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export default function LibraryPage() {
  const [items, setItems] = useState<LibraryItem[]>([])
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState("Reader")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      window.location.href = "/login"
      return
    }

    const user = getCurrentUser()
    setDisplayName(user?.username || user?.email || "Reader")

    getLibrary()
      .then((data: LibraryItem[]) => {
        if (Array.isArray(data)) setItems(data)
      })
      .catch((err: any) => setError(err?.message ?? "Failed to load your library"))
      .finally(() => setIsLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((item) => {
      const b = item.book
      return b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
    })
  }, [items, query])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 border-4 border-gray-900 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="text-xl font-black tracking-wider text-gray-900">E-BOOKSHUB</a>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full tracking-wide">
              {displayName}
            </span>
            <a href="/books" className="text-gray-700 hover:text-gray-900 font-medium text-sm">Browse</a>
          </div>
        </div>
      </nav>

      <section className="container mx-auto px-6 py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-5xl md:text-6xl font-black tracking-wider text-gray-900">MY LIBRARY</h1>
            <p className="text-gray-600 font-medium mt-2">{items.length} owned book{items.length !== 1 ? "s" : ""}</p>
          </div>
          <a href="/books" className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium">
            <ArrowLeft size={16} /> Back to Browse
          </a>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search in your library..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-md focus:border-gray-900 focus:outline-none text-gray-900 font-medium"
          />
        </div>

        {error && (
          <div className="mb-8 px-4 py-3 border-2 border-red-200 bg-red-50 text-red-700 rounded-md font-medium text-sm">
            {error}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-24 border-2 border-dashed border-gray-300 rounded-2xl">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-2xl font-black tracking-wider text-gray-400 mb-2">NO OWNED BOOKS</p>
            <p className="text-gray-500 mb-8">Buy a book to see it here and start reading instantly.</p>
            <a href="/books">
              <LiquidButton size="lg" className="font-bold tracking-wide">BROWSE BOOKS</LiquidButton>
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filtered.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.04 }}
                className="group flex flex-col bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-gray-900 hover:shadow-lg transition-all"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                  <img
                    src={item.book.cover_image || "/placeholder.svg"}
                    alt={item.book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="p-5 flex flex-col gap-3 flex-1">
                  <div className="flex-1">
                    <h3 className="font-black text-gray-900 text-lg leading-tight line-clamp-2">{item.book.title}</h3>
                    <p className="text-sm text-gray-600 font-medium mt-1">{item.book.author}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Purchased on {new Date(item.purchased_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-xl font-black text-gray-900">${toPrice(item.book.price).toFixed(2)}</span>
                    <a href={`/reader/${item.book.id}`}>
                      <LiquidButton size="sm" className="font-bold tracking-wide text-xs">READ NOW</LiquidButton>
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Trash2, ShoppingBag, BookOpen, ArrowLeft } from "lucide-react"
import { LiquidButton } from "@/components/ui/liquid-glass-button"
import { getCart, removeFromCart, checkout } from "@/lib/api"

interface CartBook {
  id: string
  title: string
  author: string
  price: number
  cover_image: string
}

export default function CartPage() {
  const [items, setItems] = useState<CartBook[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { window.location.href = "/login"; return }

    getCart()
      .then((data) => { if (Array.isArray(data)) setItems(data) })
      .catch(() => {/* show empty cart */})
      .finally(() => setIsLoading(false))
  }, [])

  const handleRemove = async (bookId: string) => {
    await removeFromCart(bookId)
    setItems((prev) => prev.filter((b) => b.id !== bookId))
  }

  const total = items.reduce((sum, b) => sum + b.price, 0)

  const handleCheckout = async () => {
    setIsCheckingOut(true)
    await checkout(items.map((b) => b.id), "card")
    setSuccess(true)
    setItems([])
    setIsCheckingOut(false)
  }

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
      {/* Navbar */}
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="text-xl font-black tracking-wider text-gray-900">E-BOOKSHUB</a>
          <a href="/books" className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium transition-colors">
            <ArrowLeft size={16} /> Back to Browse
          </a>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-16 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-5xl md:text-6xl font-black tracking-wider text-gray-900 mb-12">MY CART</h1>

          {/* Success Banner */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-8 px-6 py-4 bg-gray-900 text-white rounded-md font-bold tracking-wide text-center"
              >
                🎉 Purchase successful! Your books are now in your library.{" "}
                <a href="/books" className="underline underline-offset-4">Keep browsing</a>
              </motion.div>
            )}
          </AnimatePresence>

          {items.length === 0 && !success ? (
            <div className="text-center py-32">
              <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <p className="text-3xl font-black tracking-wider text-gray-400 mb-4">YOUR CART IS EMPTY</p>
              <p className="text-gray-500 mb-8">Discover thousands of books and add them to your cart.</p>
              <a href="/books">
                <LiquidButton size="lg" className="font-bold tracking-wide">BROWSE BOOKS</LiquidButton>
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                <AnimatePresence>
                  {items.map((book) => (
                    <motion.div
                      key={book.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex gap-5 p-5 border-2 border-gray-200 rounded-xl hover:border-gray-400 transition-colors"
                    >
                      <div className="relative w-20 h-28 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        <img
                          src={book.cover_image || "/placeholder.svg"}
                          alt={book.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <h3 className="font-black text-gray-900 text-lg tracking-wide leading-tight">{book.title}</h3>
                          <p className="text-gray-600 font-medium text-sm mt-1">{book.author}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-black text-gray-900">${book.price.toFixed(2)}</span>
                          <button
                            onClick={() => handleRemove(book.id)}
                            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 font-medium transition-colors"
                            aria-label={`Remove ${book.title}`}
                          >
                            <Trash2 size={16} /> Remove
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="border-2 border-gray-200 rounded-xl p-6 sticky top-28"
                >
                  <h2 className="text-xl font-black tracking-wider text-gray-900 mb-6">ORDER SUMMARY</h2>

                  <div className="space-y-3 mb-6">
                    {items.map((b) => (
                      <div key={b.id} className="flex justify-between text-sm">
                        <span className="text-gray-600 font-medium line-clamp-1 flex-1 mr-4">{b.title}</span>
                        <span className="font-bold text-gray-900 shrink-0">${b.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t-2 border-gray-200 pt-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-gray-900 tracking-wide">TOTAL</span>
                      <span className="text-2xl font-black text-gray-900">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <LiquidButton
                    size="lg"
                    className="w-full font-bold tracking-wide"
                    onClick={handleCheckout}
                    disabled={isCheckingOut || items.length === 0}
                  >
                    {isCheckingOut ? "Processing…" : "CHECKOUT"}
                  </LiquidButton>

                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500 font-medium">
                    <BookOpen size={14} /> Instant access after purchase
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <footer className="border-t border-gray-200 py-8 text-center text-gray-500 text-sm font-medium">
        © 2026 E-BooksHub. All rights reserved.
      </footer>
    </div>
  )
}

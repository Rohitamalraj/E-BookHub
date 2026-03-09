"use client"

import { useState, useEffect, type FormEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Pencil, Trash2, X, BookOpen, LogOut, Upload } from "lucide-react"
import { LiquidButton } from "@/components/ui/liquid-glass-button"
import { getBooks, createBook, updateBook, deleteBook } from "@/lib/api"

interface Book {
  id: string
  title: string
  author: string
  isbn: string
  genre: string
  price: number
  description: string
  cover_image: string
  file_url: string
}

const emptyForm = { title: "", author: "", isbn: "", genre: "", price: "", description: "" }

export default function AdminPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) { window.location.href = "/login"; return }
    const parsed = JSON.parse(user)
    if (parsed.role !== "admin") { window.location.href = "/books"; return }

    getBooks()
      .then((data: Book[]) => { if (Array.isArray(data)) setBooks(data) })
      .catch(() => {/* stay with empty list */})
      .finally(() => setIsLoading(false))
  }, [])

  const openCreate = () => {
    setEditingBook(null)
    setForm(emptyForm)
    setCoverFile(null)
    setPdfFile(null)
    setShowModal(true)
  }

  const openEdit = (book: Book) => {
    setEditingBook(book)
    setForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      genre: book.genre,
      price: String(book.price),
      description: book.description,
    })
    setCoverFile(null)
    setPdfFile(null)
    setShowModal(true)
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    if (coverFile) fd.append("cover_image", coverFile)
    if (pdfFile) fd.append("file_url", pdfFile)

    try {
      if (editingBook) {
        const updated = await updateBook(editingBook.id, fd)
        setBooks((prev) => prev.map((b) => (b.id === editingBook.id ? updated : b)))
      } else {
        const created = await createBook(fd)
        setBooks((prev) => [created, ...prev])
      }
      setShowModal(false)
    } catch {
      /* handle silently - backend not connected yet */
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this book?")) return
    setDeletingId(id)
    await deleteBook(id)
    setBooks((prev) => prev.filter((b) => b.id !== id))
    setDeletingId(null)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    window.location.href = "/login"
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
      {/* Top bar */}
      <nav className="sticky top-0 z-30 bg-white border-b-2 border-gray-200">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="text-xl font-black tracking-wider text-gray-900">E-BOOKSHUB</a>
            <span className="px-3 py-1 bg-gray-900 text-white text-xs font-bold rounded-full tracking-wider">ADMIN</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-6xl font-black tracking-wider text-gray-900"
            >
              BOOK CATALOG
            </motion.h1>
            <p className="text-gray-600 font-medium mt-2">{books.length} book{books.length !== 1 ? "s" : ""} in catalog</p>
          </div>
          <LiquidButton
            size="lg"
            className="font-bold tracking-wide flex items-center gap-2"
            onClick={openCreate}
          >
            <Plus size={18} /> ADD BOOK
          </LiquidButton>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {[
            { label: "Total Books", value: books.length },
            { label: "Genres", value: new Set(books.map((b) => b.genre)).size },
            { label: "Avg Price", value: books.length ? `$${(books.reduce((s, b) => s + b.price, 0) / books.length).toFixed(2)}` : "—" },
            { label: "Status", value: "Live" },
          ].map((stat) => (
            <div key={stat.label} className="border-2 border-gray-200 rounded-xl p-5">
              <p className="text-sm text-gray-500 font-bold tracking-wide mb-1">{stat.label.toUpperCase()}</p>
              <p className="text-3xl font-black text-gray-900">{stat.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Books Table */}
        {books.length === 0 ? (
          <div className="text-center py-24 border-2 border-dashed border-gray-300 rounded-2xl">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-2xl font-black tracking-wider text-gray-400 mb-2">NO BOOKS YET</p>
            <p className="text-gray-500 mb-8">Click "Add Book" to publish your first title.</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="border-2 border-gray-200 rounded-2xl overflow-hidden"
          >
            <table className="w-full">
              <thead className="bg-gray-900 text-white">
                <tr>
                  {["Cover", "Title", "Author", "Genre", "Price", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-4 text-left text-xs font-bold tracking-wider">{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <AnimatePresence>
                  {books.map((book) => (
                    <motion.tr
                      key={book.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="w-10 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          <img
                            src={book.cover_image || "/placeholder.svg"}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-5 py-4 font-black text-gray-900 max-w-[200px] line-clamp-2">{book.title}</td>
                      <td className="px-5 py-4 text-gray-700 font-medium">{book.author}</td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">{book.genre}</span>
                      </td>
                      <td className="px-5 py-4 font-black text-gray-900">${book.price.toFixed(2)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(book)}
                            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                            aria-label="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(book.id)}
                            disabled={deletingId === book.id}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-40"
                            aria-label="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </motion.div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b-2 border-gray-200">
                <h2 className="text-2xl font-black tracking-wider text-gray-900">
                  {editingBook ? "EDIT BOOK" : "ADD BOOK"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[
                    { label: "TITLE", key: "title", type: "text", placeholder: "Book title" },
                    { label: "AUTHOR", key: "author", type: "text", placeholder: "Author name" },
                    { label: "ISBN", key: "isbn", type: "text", placeholder: "978-0-000-00000-0" },
                    { label: "GENRE", key: "genre", type: "text", placeholder: "Fiction, Science…" },
                    { label: "PRICE (USD)", key: "price", type: "number", placeholder: "9.99" },
                  ].map(({ label, key, type, placeholder }) => (
                    <div key={key}>
                      <label className="block text-xs font-bold text-gray-900 mb-2 tracking-wider">{label}</label>
                      <input
                        type={type}
                        step={key === "price" ? "0.01" : undefined}
                        min={key === "price" ? "0" : undefined}
                        required
                        value={form[key as keyof typeof form]}
                        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-md focus:border-gray-900 focus:outline-none text-gray-900 font-medium transition-colors text-sm"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-2 tracking-wider">DESCRIPTION</label>
                  <textarea
                    required
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Short description of the book…"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-md focus:border-gray-900 focus:outline-none text-gray-900 font-medium transition-colors text-sm resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[
                    { label: "COVER IMAGE", accept: "image/*", setter: setCoverFile, file: coverFile },
                    { label: "E-BOOK FILE (PDF)", accept: ".pdf,application/pdf", setter: setPdfFile, file: pdfFile },
                  ].map(({ label, accept, setter, file }) => (
                    <div key={label}>
                      <label className="block text-xs font-bold text-gray-900 mb-2 tracking-wider">{label}</label>
                      <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-300 rounded-md hover:border-gray-900 cursor-pointer transition-colors">
                        <Upload size={16} className="text-gray-500 shrink-0" />
                        <span className="text-sm text-gray-600 font-medium truncate">
                          {file ? file.name : (editingBook ? "Replace file…" : "Upload file…")}
                        </span>
                        <input
                          type="file"
                          accept={accept}
                          className="sr-only"
                          onChange={(e) => setter(e.target.files?.[0] ?? null)}
                        />
                      </label>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 pt-2">
                  <LiquidButton
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 font-bold tracking-wide"
                  >
                    {isSaving ? "Saving…" : editingBook ? "SAVE CHANGES" : "PUBLISH BOOK"}
                  </LiquidButton>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-md hover:border-gray-900 transition-colors tracking-wide text-sm"
                  >
                    CANCEL
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="border-t border-gray-200 py-8 text-center text-gray-500 text-sm font-medium">
        © 2026 E-BooksHub Admin Panel. All rights reserved.
      </footer>
    </div>
  )
}

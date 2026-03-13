"use client"

import { use, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Lock, ChevronLeft, ChevronRight, BookOpen } from "lucide-react"
import { getBookForReader, getCurrentUser, getReaderStreamUrl } from "@/lib/api"

interface ReaderData {
  file_url?: string
  title?: string
  author?: string
  page_count?: number
  error?: string
}

export default function ReaderPage({ params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = use(params)
  const [data, setData] = useState<ReaderData | null>(null)
  const [streamUrl, setStreamUrl] = useState("")
  const [watermarkText, setWatermarkText] = useState("Protected")
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  const pageCount = Math.max(1, Number(data?.page_count || 1))
  const title = data?.title ?? "Your Book"
  const author = data?.author ?? ""
  const baseReaderSrc = streamUrl || data?.file_url || ""

  const blockNativePdfScroll: React.WheelEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
  }

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) { window.location.href = "/login"; return }

    const user = getCurrentUser()
    const idText = user?.email || user?.username || "Authorized User"
    setWatermarkText(`${idText} • ${new Date().toLocaleString()}`)
    setStreamUrl(getReaderStreamUrl(bookId))

    getBookForReader(bookId)
      .then((res: ReaderData) => setData(res))
      .catch(() => setData({ error: "Failed to load book. Please try again." }))
      .finally(() => setIsLoading(false))
  }, [bookId])

  useEffect(() => {
    const onContextMenu = (e: MouseEvent) => e.preventDefault()
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      if ((e.ctrlKey || e.metaKey) && (key === "s" || key === "p")) {
        e.preventDefault()
      }
    }

    window.addEventListener("contextmenu", onContextMenu)
    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("contextmenu", onContextMenu)
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 border-4 border-white border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (data?.error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center px-6 max-w-md"
        >
          <Lock className="w-20 h-20 mx-auto mb-6 text-gray-500" />
          <h2 className="text-3xl font-black tracking-wider mb-4">ACCESS DENIED</h2>
          <p className="text-gray-400 mb-8">
            {data?.error ?? "You don't own this book. Purchase it to start reading."}
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/books"
              className="px-6 py-3 bg-white text-gray-900 font-bold rounded-md hover:bg-gray-100 transition-colors tracking-wide"
            >
              BROWSE BOOKS
            </a>
            <a
              href={`/books`}
              className="px-6 py-3 border-2 border-gray-600 text-gray-300 font-bold rounded-md hover:border-gray-400 transition-colors tracking-wide"
            >
              MY LIBRARY
            </a>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col select-none">
      {/* Reader Toolbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center justify-between shrink-0">
        <a
          href="/books"
          className="flex items-center gap-2 text-gray-400 hover:text-white font-medium transition-colors text-sm"
        >
          <ArrowLeft size={16} /> Back to Library
        </a>

        <div className="flex items-center gap-3">
          <BookOpen size={18} className="text-gray-400" />
          <div className="text-center">
            <p className="text-white font-bold text-sm leading-none">
              {title}
            </p>
            {author && (
              <p className="text-gray-400 text-xs mt-0.5">{author}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <a href="/library" className="text-gray-400 hover:text-white font-medium text-xs tracking-wide">
            MY LIBRARY
          </a>
          <Lock size={14} className="text-green-500" />
          <span className="text-green-500 text-xs font-bold tracking-wide">SECURE VIEW</span>
        </div>
      </nav>

      {/* PDF Embed */}
      <div className="flex-1 flex flex-col">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex-1 relative"
        >
          {/* Watermark overlay deters redistribution screenshots */}
          <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden opacity-25">
            {Array.from({ length: 18 }).map((_, i) => (
              <span
                key={i}
                className="absolute text-white/30 text-xs font-semibold tracking-wide"
                style={{
                  left: `${(i % 6) * 18 + 4}%`,
                  top: `${Math.floor(i / 6) * 30 + 8}%`,
                  transform: "rotate(-24deg)",
                }}
              >
                {watermarkText}
              </span>
            ))}
          </div>
          <iframe
            key={`reader-${bookId}-page-${currentPage}`}
            src={`${baseReaderSrc}#page=${currentPage}&view=Fit&toolbar=0&navpanes=0&scrollbar=0&pagemode=none`}
            title={title}
            className="w-full h-full min-h-[calc(100vh-120px)]"
            style={{ background: "#020617" }}
          />
          {/* Capture wheel/touch interactions so only Prev/Next changes pages */}
          <div
            className="absolute inset-0 z-20"
            onWheel={blockNativePdfScroll}
            onTouchMove={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
          />
        </motion.div>

        {/* Page Controls */}
        <div className="bg-gray-900 border-t border-gray-800 px-6 py-3 flex items-center justify-center gap-6 shrink-0">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 text-gray-400 hover:text-white disabled:opacity-30 font-medium transition-colors text-sm"
          >
            <ChevronLeft size={18} /> Previous
          </button>

          <span className="text-gray-400 font-medium text-sm">Page {currentPage} / {pageCount}</span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
            disabled={currentPage >= pageCount}
            className="flex items-center gap-1 text-gray-400 hover:text-white disabled:opacity-30 font-medium transition-colors text-sm"
          >
            Next <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

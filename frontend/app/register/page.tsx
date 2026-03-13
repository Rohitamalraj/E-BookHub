"use client"

import { useEffect, useState, type FormEvent } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff, BookOpen } from "lucide-react"
import { LiquidButton } from "@/components/ui/liquid-glass-button"
import { register, isAuthenticated } from "@/lib/api"

export default function RegisterPage() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated()) {
      window.location.href = "/books"
    }
  }, [])

  const getErrorMessage = (data: any): string => {
    if (!data) return "Registration failed. Please try again."
    if (typeof data.error === "string") return data.error
    if (typeof data.detail === "string") return data.detail

    const firstField = Object.keys(data)[0]
    const firstValue = firstField ? data[firstField] : null

    if (Array.isArray(firstValue) && firstValue.length > 0) {
      return String(firstValue[0])
    }
    if (typeof firstValue === "string") {
      return firstValue
    }

    return "Registration failed. Please try again."
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const data = await register(email, password, username)
      if (data.token) {
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        window.location.href = "/books"
      } else {
        setError(getErrorMessage(data))
      }
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Panel — decorative */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="hidden lg:flex lg:w-1/2 relative bg-gray-900 items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 bg-grid-subtle opacity-10 pointer-events-none" />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&q=80')",
          }}
        />
        <div className="relative z-10 text-center text-white px-12 max-w-md">
          <BookOpen className="w-16 h-16 mx-auto mb-8 text-white/80" />
          <h2 className="text-4xl md:text-5xl font-black tracking-wider mb-6 leading-tight">
            JOIN THE
            <br />
            LIBRARY
          </h2>
          <p className="text-lg text-gray-300 leading-relaxed">
            Create your free account today and start building your personal digital library in seconds.
          </p>
        </div>
      </motion.div>

      {/* Right Panel — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <a href="/" className="block text-2xl font-black tracking-wider text-gray-900 mb-12">
            E-BOOKSHUB
          </a>

          <h1 className="text-4xl font-black tracking-wider text-gray-900 mb-2">CREATE ACCOUNT</h1>
          <p className="text-gray-600 mb-10">
            Already have an account?{" "}
            <a href="/login" className="font-bold text-gray-900 hover:underline underline-offset-4">
              Sign in
            </a>
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 px-4 py-3 border-2 border-red-200 bg-red-50 text-red-700 rounded-md font-medium text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 tracking-wide">USERNAME</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="bookworm42"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-md focus:border-gray-900 focus:outline-none text-gray-900 font-medium transition-colors duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 tracking-wide">EMAIL</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-md focus:border-gray-900 focus:outline-none text-gray-900 font-medium transition-colors duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 tracking-wide">PASSWORD</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-md focus:border-gray-900 focus:outline-none text-gray-900 font-medium transition-colors duration-200 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 tracking-wide">CONFIRM PASSWORD</label>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-md focus:border-gray-900 focus:outline-none text-gray-900 font-medium transition-colors duration-200"
              />
            </div>

            <LiquidButton
              type="submit"
              size="lg"
              disabled={isLoading}
              className="w-full font-bold tracking-wide text-base"
            >
              {isLoading ? "Creating account…" : "CREATE ACCOUNT"}
            </LiquidButton>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            By registering you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

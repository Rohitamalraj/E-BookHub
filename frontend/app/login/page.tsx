"use client"

import { useEffect, useState, type FormEvent } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff, BookOpen } from "lucide-react"
import { LiquidButton } from "@/components/ui/liquid-glass-button"
import { login, isAuthenticated } from "@/lib/api"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated()) {
      window.location.href = "/books"
    }
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      const data = await login(email, password)
      if (data.token) {
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        window.location.href = "/books"
      } else {
        setError(data.error ?? "Invalid credentials. Please try again.")
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
              "url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&q=80')",
          }}
        />
        <div className="relative z-10 text-center text-white px-12 max-w-md">
          <BookOpen className="w-16 h-16 mx-auto mb-8 text-white/80" />
          <h2 className="text-4xl md:text-5xl font-black tracking-wider mb-6 leading-tight">
            WELCOME
            <br />
            BACK
          </h2>
          <p className="text-lg text-gray-300 leading-relaxed">
            Your library is waiting. Thousands of books, one seamless reading experience.
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

          <h1 className="text-4xl font-black tracking-wider text-gray-900 mb-2">SIGN IN</h1>
          <p className="text-gray-600 mb-10">
            Don&apos;t have an account?{" "}
            <a href="/register" className="font-bold text-gray-900 hover:underline underline-offset-4">
              Register
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

          <form onSubmit={handleSubmit} className="space-y-6">
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

            <LiquidButton
              type="submit"
              size="lg"
              disabled={isLoading}
              className="w-full font-bold tracking-wide text-base"
            >
              {isLoading ? "Signing in…" : "SIGN IN"}
            </LiquidButton>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            By signing in you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

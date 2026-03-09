"use client"

import { motion } from "framer-motion"
import { Instagram, Twitter, Facebook, MapPin, Mail, Phone } from "lucide-react"

export default function Footer() {
  return (
    <footer className="relative bg-white border-t border-gray-200">
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 bg-grid-subtle opacity-20 pointer-events-none" />

      <div className="container mx-auto px-6 py-16 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <h3 className="text-3xl md:text-4xl font-black tracking-wider text-gray-900 mb-4">E-BOOKSHUB</h3>
            <p className="text-lg text-gray-600 leading-relaxed mb-6 max-w-md">
              Knowledge shouldn't have borders. Discover, purchase, and read thousands of e-books across every genre —
              securely, instantly, on any device.
            </p>

            {/* Social Links */}
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-12 h-12 bg-gray-900 hover:bg-gray-700 text-white rounded-full flex items-center justify-center transition-colors duration-300"
                aria-label="Follow us on Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="w-12 h-12 bg-gray-900 hover:bg-gray-700 text-white rounded-full flex items-center justify-center transition-colors duration-300"
                aria-label="Follow us on Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="w-12 h-12 bg-gray-900 hover:bg-gray-700 text-white rounded-full flex items-center justify-center transition-colors duration-300"
                aria-label="Follow us on Facebook"
              >
                <Facebook size={20} />
              </a>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4 className="text-xl font-bold text-gray-900 mb-6 tracking-wide">QUICK LINKS</h4>
            <ul className="space-y-3">
              <li>
                <a href="/books" className="text-gray-600 hover:text-gray-900 transition-colors duration-300 font-medium">
                  Browse Books
                </a>
              </li>
              <li>
                <a href="/login" className="text-gray-600 hover:text-gray-900 transition-colors duration-300 font-medium">
                  Login
                </a>
              </li>
              <li>
                <a href="/register" className="text-gray-600 hover:text-gray-900 transition-colors duration-300 font-medium">
                  Register
                </a>
              </li>
              <li>
                <a href="/cart" className="text-gray-600 hover:text-gray-900 transition-colors duration-300 font-medium">
                  My Cart
                </a>
              </li>
              <li>
                <a href="#mission" className="text-gray-600 hover:text-gray-900 transition-colors duration-300 font-medium">
                  About Us
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="text-xl font-bold text-gray-900 mb-6 tracking-wide">GET IN TOUCH</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <MapPin size={18} className="text-gray-600" />
                <span className="text-gray-600 font-medium">Colombo, Sri Lanka</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={18} className="text-gray-600" />
                <a
                  href="mailto:hello@ebookshub.com"
                  className="text-gray-600 hover:text-gray-900 transition-colors duration-300 font-medium"
                >
                  hello@ebookshub.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={18} className="text-gray-600" />
                <a
                  href="tel:+94115555000"
                  className="text-gray-600 hover:text-gray-900 transition-colors duration-300 font-medium"
                >
                  +94 11 555 5000
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Newsletter Signup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="border-t border-gray-200 pt-12 mb-12"
        >
          <div className="max-w-2xl mx-auto text-center">
            <h4 className="text-2xl md:text-3xl font-black text-gray-900 mb-4 tracking-wide">STAY IN THE LOOP</h4>
            <p className="text-lg text-gray-600 mb-8">
              Get notified about new arrivals, exclusive deals, and curated reading lists delivered to your inbox.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-md focus:border-gray-900 focus:outline-none text-gray-900 font-medium"
              />
              <button className="px-8 py-3 bg-gray-900 hover:bg-gray-700 text-white font-bold rounded-md transition-colors duration-300 tracking-wide">
                SUBSCRIBE
              </button>
            </div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"
        >
          <p className="text-gray-600 font-medium">© 2026 E-BooksHub. All rights reserved.</p>

          <div className="flex space-x-6">
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors duration-300 font-medium">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors duration-300 font-medium">
              Terms of Service
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}

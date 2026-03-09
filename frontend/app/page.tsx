"use client"

import HeroSection from "../hero-section"
import { TextGradientScroll } from "@/components/ui/text-gradient-scroll"
import { Timeline } from "@/components/ui/timeline"
import "./globals.css"
import { StaggerTestimonials } from "@/components/ui/stagger-testimonials"
import { motion } from "framer-motion"
import SmoothScrollHero from "@/components/ui/smooth-scroll-hero"

export default function Page() {
  const missionStatement =
    "At E-BooksHub, we believe knowledge shouldn't have borders. We built a platform where every reader — whether you're a student, a professional, or someone who simply loves a great story — can discover, purchase, and read thousands of e-books instantly. From timeless classics to the latest releases, from technical guides to gripping fiction, our secure digital library puts the world's literature at your fingertips. Read on any device, anytime, anywhere."

  const timelineEntries = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80",
      alt: "Open books on a library table",
      title: "Discover Your Next Great Read",
      description:
        "Browse thousands of titles across every genre — fiction, non-fiction, science, history, self-help, and more. Our smart search and genre filters make finding your perfect book effortless. Your next favourite read is just a click away.",
      layout: "left" as const,
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80",
      alt: "Person reading comfortably",
      title: "Own It Instantly",
      description:
        "No waiting, no shipping. The moment you complete your purchase, your book is added to your personal library and ready to read. Our secure checkout process is fast and frictionless, supporting multiple payment methods.",
      layout: "right" as const,
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1550399105-c4db5fb85c18?w=800&q=80",
      alt: "E-reader and digital books",
      title: "Read Securely, Anywhere",
      description:
        "Your library, your rules. Our SecureView reader verifies your ownership and delivers a beautiful, distraction-free reading experience on any device. Whether it's your laptop at the office or your phone on the commute, your books are always with you.",
      layout: "left" as const,
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection />

      {/* Mission Statement Section with Grid Background */}
      <section id="mission" className="relative min-h-screen flex items-center justify-center py-20 bg-white">
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-grid-subtle opacity-30 pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-black tracking-wider mb-12 text-gray-900">OUR MISSION</h2>
            <TextGradientScroll
              text={missionStatement}
              className="text-2xl md:text-3xl lg:text-4xl font-medium leading-relaxed text-gray-800"
              type="word"
              textOpacity="soft"
            />
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section id="community" className="relative py-20 bg-white">
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-grid-subtle opacity-30 pointer-events-none" />

        <div className="relative z-10">
          <div className="container mx-auto px-6 mb-16">
            <div className="text-center">
              <h2 className="text-4xl md:text-6xl font-black tracking-wider mb-6 text-gray-900">BUILT FOR EVERY READER</h2>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
                From casual readers to avid bookworms, E-BooksHub is designed to fit seamlessly into your reading life.
              </p>
            </div>
          </div>

          <Timeline entries={timelineEntries} />
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative py-20 bg-white">
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-grid-subtle opacity-30 pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-black tracking-wider text-gray-900 mb-6">
              See what our{" "}
              <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">READERS</span>{" "}
              say.
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
              Real stories from real readers who found their next great book on E-BooksHub.
            </p>
          </motion.div>

          <StaggerTestimonials />
        </div>
      </section>

      {/* Smooth Scroll Hero with CTA Overlay */}
      <section id="join" className="relative">
        <SmoothScrollHero
          scrollHeight={2500}
          desktopImage="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1600&q=80"
          mobileImage="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1600&q=80"
          initialClipPercentage={30}
          finalClipPercentage={70}
        />
      </section>
    </div>
  )
}


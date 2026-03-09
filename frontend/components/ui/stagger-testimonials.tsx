"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const SQRT_5000 = Math.sqrt(5000)

// Running club testimonials data with randomly generated icons
const testimonials = [
  {
    tempId: 0,
    testimonial:
      "E-BooksHub completely changed how I read. I used to carry heavy textbooks everywhere. Now my entire study library is on my phone, instantly accessible.",
    by: "Sarah Chen, Medical Student",
    imgSrc: "https://api.dicebear.com/7.x/initials/svg?seed=SarahChen&backgroundColor=3b82f6&textColor=ffffff",
  },
  {
    tempId: 1,
    testimonial:
      "The SecureView reader is genuinely beautiful. No distractions, perfect typography, and it remembers exactly where I left off across all my devices.",
    by: "Marcus Johnson, Software Engineer",
    imgSrc: "https://api.dicebear.com/7.x/initials/svg?seed=MarcusJohnson&backgroundColor=10b981&textColor=ffffff",
  },
  {
    tempId: 2,
    testimonial:
      "I bought three books during my lunch break and started reading the first one on the train home. That instant access is something I'll never go back from.",
    by: "Priya Patel, Marketing Manager",
    imgSrc: "https://api.dicebear.com/7.x/initials/svg?seed=PriyaPatel&backgroundColor=8b5cf6&textColor=ffffff",
  },
  {
    tempId: 3,
    testimonial:
      "As a freelance writer I consume books voraciously. E-BooksHub's genre filters and search are so accurate I rarely browse for more than 60 seconds before finding something I love.",
    by: "David Rodriguez, Freelance Writer",
    imgSrc: "https://api.dicebear.com/7.x/initials/svg?seed=DavidRodriguez&backgroundColor=ef4444&textColor=ffffff",
  },
  {
    tempId: 4,
    testimonial:
      "The checkout process is the fastest I've ever used. One click, payment confirmed, book in my library. Zero friction. Brilliant design.",
    by: "Emma Thompson, UX Designer",
    imgSrc: "https://api.dicebear.com/7.x/initials/svg?seed=EmmaThompson&backgroundColor=f59e0b&textColor=ffffff",
  },
  {
    tempId: 5,
    testimonial:
      "I was sceptical about e-books but E-BooksHub converted me. The reader is so clean and the prices are very fair compared to physical copies.",
    by: "James Wilson, High School Teacher",
    imgSrc: "https://api.dicebear.com/7.x/initials/svg?seed=JamesWilson&backgroundColor=6366f1&textColor=ffffff",
  },
  {
    tempId: 6,
    testimonial:
      "My admin account lets me upload new titles in minutes. The dashboard is intuitive and the file management is rock-solid. Perfect for indie publishers.",
    by: "Aisha Mohammed, Independent Publisher",
    imgSrc: "https://api.dicebear.com/7.x/initials/svg?seed=AishaMohammed&backgroundColor=ec4899&textColor=ffffff",
  },
  {
    tempId: 7,
    testimonial:
      "I relocated abroad and all my purchased books came with me in the cloud. E-BooksHub is truly device- and country-agnostic. Incredible.",
    by: "Alex Kim, Digital Nomad",
    imgSrc: "https://api.dicebear.com/7.x/initials/svg?seed=AlexKim&backgroundColor=06b6d4&textColor=ffffff",
  },
  {
    tempId: 8,
    testimonial:
      "The recommendations based on my purchase history are surprisingly accurate. I've discovered five authors I'd never have found otherwise.",
    by: "Lisa Garcia, Book Club Organiser",
    imgSrc: "https://api.dicebear.com/7.x/initials/svg?seed=LisaGarcia&backgroundColor=f97316&textColor=ffffff",
  },
  {
    tempId: 9,
    testimonial:
      "Security is my top concern with digital purchases. Knowing E-BooksHub verifies my ownership before every reading session gives me genuine peace of mind.",
    by: "Michael Chen, Cybersecurity Analyst",
    imgSrc: "https://api.dicebear.com/7.x/initials/svg?seed=MichaelChen&backgroundColor=84cc16&textColor=ffffff",
  },
  {
    tempId: 10,
    testimonial:
      "I run a small book club and we all use E-BooksHub now. Everyone has the same edition, we can discuss specific pages without confusion. It's transformed our meetings.",
    by: "Sofia Rodriguez, Book Club Host",
    imgSrc: "https://api.dicebear.com/7.x/initials/svg?seed=SofiaRodriguez&backgroundColor=a855f7&textColor=ffffff",
  },
  {
    tempId: 11,
    testimonial:
      "The cart lets me save books for later without losing them. I build up a wishlist and treat myself monthly. Such a thoughtful little feature.",
    by: "Tyler Brooks, Avid Reader",
    imgSrc: "https://api.dicebear.com/7.x/initials/svg?seed=TylerBrooks&backgroundColor=059669&textColor=ffffff",
  },
  {
    tempId: 12,
    testimonial:
      "I completed my entire MBA reading list through E-BooksHub. Saved a fortune compared to campus bookshop prices and had everything in one organised library.",
    by: "Nina Patel, MBA Graduate",
    imgSrc: "https://api.dicebear.com/7.x/initials/svg?seed=NinaPatel&backgroundColor=0ea5e9&textColor=ffffff",
  },
  {
    tempId: 13,
    testimonial:
      "The DRM protection actually works without frustrating me as a legitimate buyer. It's the right balance between security and a smooth reading experience.",
    by: "Robert Kim, Technology Lawyer",
    imgSrc: "https://api.dicebear.com/7.x/initials/svg?seed=RobertKim&backgroundColor=dc2626&textColor=ffffff",
  },
  {
    tempId: 14,
    testimonial:
      "I never thought I'd prefer reading on a screen until I tried E-BooksHub's reader. The font choices and spacing are so comfortable I read for longer without fatigue.",
    by: "Jessica Martinez, Graphic Novelist",
    imgSrc: "https://api.dicebear.com/7.x/initials/svg?seed=JessicaMartinez&backgroundColor=7c3aed&textColor=ffffff",
  },
  {
    tempId: 15,
    testimonial:
      "Customer support resolved my billing query within the hour. There are real humans behind this platform who genuinely care about their readers.",
    by: "Daniel Park, Retired Educator",
    imgSrc: "https://api.dicebear.com/7.x/initials/svg?seed=DanielPark&backgroundColor=ea580c&textColor=ffffff",
  },
  {
    tempId: 16,
    testimonial:
      "The variety of genres is staggering. From academic papers to graphic novels to poetry collections — everything I've searched for has been available.",
    by: "Rachel Green, Librarian",
    imgSrc: "https://api.dicebear.com/7.x/initials/svg?seed=RachelGreen&backgroundColor=16a34a&textColor=ffffff",
  },
  {
    tempId: 17,
    testimonial:
      "As a developer myself I appreciate how fast the site loads and how well it works on mobile. Clearly built by people who take performance seriously.",
    by: "Kevin Wong, Full-Stack Developer",
    imgSrc: "https://api.dicebear.com/7.x/initials/svg?seed=KevinWong&backgroundColor=2563eb&textColor=ffffff",
  },
  {
    tempId: 18,
    testimonial:
      "I gifted three e-books to my daughter for her birthday. The process was seamless and she had them in her library instantly. Perfect digital gifting solution.",
    by: "Amanda Foster, Parent",
    imgSrc: "https://api.dicebear.com/7.x/initials/svg?seed=AmandaFoster&backgroundColor=be185d&textColor=ffffff",
  },
  {
    tempId: 19,
    testimonial:
      "E-BooksHub is the only platform where I feel my purchases are truly mine. The library view is clean, organised, and makes me excited to start the next book.",
    by: "Carlos Mendez, Philosophy Professor",
    imgSrc: "https://api.dicebear.com/7.x/initials/svg?seed=CarlosMendez&backgroundColor=0891b2&textColor=ffffff",
  },
]

interface TestimonialCardProps {
  position: number
  testimonial: (typeof testimonials)[0]
  handleMove: (steps: number) => void
  cardSize: number
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ position, testimonial, handleMove, cardSize }) => {
  const isCenter = position === 0
  return (
    <div
      onClick={() => handleMove(position)}
      className={cn(
        "absolute left-1/2 top-1/2 cursor-pointer border-2 p-8 transition-all duration-500 ease-in-out",
        isCenter
          ? "z-10 bg-gray-900 text-white border-gray-900"
          : "z-0 bg-white text-gray-900 border-gray-200 hover:border-gray-400",
      )}
      style={{
        width: cardSize,
        height: cardSize,
        clipPath: `polygon(50px 0%, calc(100% - 50px) 0%, 100% 50px, 100% 100%, calc(100% - 50px) 100%, 50px 100%, 0 100%, 0 0)`,
        transform: `
          translate(-50%, -50%) 
          translateX(${(cardSize / 1.5) * position}px)
          translateY(${isCenter ? -65 : position % 2 ? 15 : -15}px)
          rotate(${isCenter ? 0 : position % 2 ? 2.5 : -2.5}deg)
        `,
        boxShadow: isCenter ? "0px 8px 0px 4px hsl(var(--border))" : "0px 0px 0px 0px transparent",
      }}
    >
      <span
        className="absolute block origin-top-right rotate-45 bg-gray-300"
        style={{
          right: -2,
          top: 48,
          width: SQRT_5000,
          height: 2,
        }}
      />
      <img
        src={testimonial.imgSrc || "/placeholder.svg"}
        alt={`${testimonial.by.split(",")[0]}`}
        className="mb-4 h-14 w-12 bg-gray-100 object-cover object-top"
        style={{
          boxShadow: "3px 3px 0px hsl(var(--background))",
        }}
      />
      <h3 className={cn("text-base sm:text-xl font-medium", isCenter ? "text-white" : "text-gray-900")}>
        "{testimonial.testimonial}"
      </h3>
      <p
        className={cn(
          "absolute bottom-8 left-8 right-8 mt-2 text-sm italic",
          isCenter ? "text-gray-300" : "text-gray-600",
        )}
      >
        - {testimonial.by}
      </p>
    </div>
  )
}

export const StaggerTestimonials: React.FC = () => {
  const [cardSize, setCardSize] = useState(365)
  const [testimonialsList, setTestimonialsList] = useState(testimonials)

  const handleMove = (steps: number) => {
    const newList = [...testimonialsList]
    if (steps > 0) {
      for (let i = steps; i > 0; i--) {
        const item = newList.shift()
        if (!item) return
        newList.push({ ...item, tempId: Math.random() })
      }
    } else {
      for (let i = steps; i < 0; i++) {
        const item = newList.pop()
        if (!item) return
        newList.unshift({ ...item, tempId: Math.random() })
      }
    }
    setTestimonialsList(newList)
  }

  useEffect(() => {
    const updateSize = () => {
      const { matches } = window.matchMedia("(min-width: 640px)")
      setCardSize(matches ? 365 : 290)
    }
    updateSize()
    window.addEventListener("resize", updateSize)
    return () => window.removeEventListener("resize", updateSize)
  }, [])

  return (
    <div className="relative w-full overflow-hidden bg-white" style={{ height: 600 }}>
      {testimonialsList.map((testimonial, index) => {
        const position =
          testimonialsList.length % 2 ? index - (testimonialsList.length + 1) / 2 : index - testimonialsList.length / 2
        return (
          <TestimonialCard
            key={testimonial.tempId}
            testimonial={testimonial}
            handleMove={handleMove}
            position={position}
            cardSize={cardSize}
          />
        )
      })}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        <button
          onClick={() => handleMove(-1)}
          className={cn(
            "flex h-14 w-14 items-center justify-center text-2xl transition-colors",
            "bg-white border-2 border-gray-300 hover:bg-gray-900 hover:text-white",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2",
          )}
          aria-label="Previous testimonial"
        >
          <ChevronLeft />
        </button>
        <button
          onClick={() => handleMove(1)}
          className={cn(
            "flex h-14 w-14 items-center justify-center text-2xl transition-colors",
            "bg-white border-2 border-gray-300 hover:bg-gray-900 hover:text-white",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2",
          )}
          aria-label="Next testimonial"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  )
}

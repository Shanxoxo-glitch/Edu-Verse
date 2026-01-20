"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import WalletButton from "@/components/wallet-button"
import EduVerseLogo from "@/components/eduverse-logo"

interface NavigationProps {
  activeSection: string
  setActiveSection: (section: string) => void
}

export default function Navigation({ activeSection, setActiveSection }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false)

  const sections = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "explore", label: "Explore Campus", icon: "🎓" },
    { id: "courses", label: "Courses", icon: "📚" },
    { id: "mentors", label: "Mentors", icon: "🧑‍🏫" },
    { id: "community", label: "Community", icon: "💬" },
    { id: "rewards", label: "Rewards", icon: "🎁" },
    { id: "profile", label: "Profile", icon: "⚙️" },
  ]

  const handleNavigate = (section: string) => {
    setActiveSection(section)
    setIsOpen(false)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <EduVerseLogo />
            </div>
            <span className="text-xl font-heading font-bold text-foreground">EduVerse</span>
          </div>
          <div className="hidden md:block h-8 w-px bg-border"></div>
        </div>

        <button className="md:hidden text-foreground hover:text-primary transition" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div
          className={`${isOpen ? "block" : "hidden"} md:block absolute md:relative top-full left-0 right-0 md:top-0 bg-background/95 md:bg-transparent border-b md:border-0 border-border md:flex items-center gap-2 lg:gap-4 p-4 md:p-0`}
        >
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => handleNavigate(section.id)}
              className={`block w-full md:w-auto text-left py-2 md:py-0 px-2 transition text-sm lg:text-base font-heading ${
                activeSection === section.id
                  ? "text-primary font-bold border-b-2 md:border-b-2 border-primary"
                  : "text-muted-foreground hover:text-primary hover:border-b-2 hover:border-primary"
              }`}
            >
              <span className="hidden lg:inline">{section.icon} </span>
              {section.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-6 ml-6">
          <div className="hidden md:block h-8 w-px bg-border"></div>
          <WalletButton />
        </div>
      </div>
    </nav>
  )
}

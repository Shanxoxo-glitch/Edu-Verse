"use client"

import { useEffect, useState } from "react"
import EduVerseLogo from "./eduverse-logo"

interface LoadingScreenProps {
  isVisible: boolean
}

export default function LoadingScreen({ isVisible }: LoadingScreenProps) {
  const [displayProgress, setDisplayProgress] = useState(0)

  useEffect(() => {
    if (!isVisible) return

    const interval = setInterval(() => {
      setDisplayProgress((prev) => {
        const next = prev + Math.random() * 30
        return next > 95 ? 95 : next
      })
    }, 500)

    return () => clearInterval(interval)
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center gap-8">
      <div className="w-32 h-32">
        <EduVerseLogo loading={true} />
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-heading font-bold text-accent mb-2 glow-cyan">Loading EduVerse</h2>
        <p className="text-foreground/60">Initializing metaverse campus...</p>
      </div>

      <div className="w-64 bg-background border border-border rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-accent to-secondary transition-all duration-300"
          style={{ width: `${displayProgress}%` }}
        ></div>
      </div>

      <p className="text-xs text-foreground/50">{Math.round(displayProgress)}%</p>
    </div>
  )
}

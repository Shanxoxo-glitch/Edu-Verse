"use client"

import { useEffect, useState } from "react"

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isClicking, setIsClicking] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }

    const handleMouseDown = () => setIsClicking(true)
    const handleMouseUp = () => setIsClicking(false)

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mousedown", handleMouseDown)
    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [])

  return (
    <>
      <style>{`
        body {
          cursor: none;
        }
      `}</style>

      <div
        className={`fixed pointer-events-none z-[9999] transition-transform duration-75 ${
          isClicking ? "scale-75" : "scale-100"
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: `translate(-50%, -50%)`,
        }}
      >
        <div
          className={`w-6 h-6 rounded-full border-2 border-accent glow-cyan transition-all ${
            isClicking ? "bg-accent/50" : "bg-transparent"
          }`}
        >
          <div className="absolute inset-0 rounded-full animate-pulse bg-accent/20"></div>
        </div>
      </div>

      <div
        className="fixed pointer-events-none z-[9998] w-2 h-2 rounded-full bg-secondary"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: `translate(-50%, -50%)`,
        }}
      ></div>
    </>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Volume2, VolumeX } from "lucide-react"

export default function AudioSystem() {
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    // Play ambient background music (using Web Audio API simulation)
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

    // Create oscillators for ambient soundscape
    const createAmbientSound = () => {
      const osc1 = audioContext.createOscillator()
      const osc2 = audioContext.createOscillator()
      const gain = audioContext.createGain()

      osc1.frequency.value = 55 // Low bass frequency
      osc2.frequency.value = 110 // Harmonic frequency

      osc1.type = "sine"
      osc2.type = "sine"

      gain.gain.setValueAtTime(0.05, audioContext.currentTime)

      osc1.connect(gain)
      osc2.connect(gain)
      gain.connect(audioContext.destination)

      osc1.start()
      osc2.start()

      return { osc1, osc2 }
    }

    if (!isMuted) {
      try {
        createAmbientSound()
      } catch (err) {
        console.log("[v0] Audio context creation skipped (can only be created on user interaction)")
      }
    }

    return () => {
      // Cleanup handled by garbage collection
    }
  }, [isMuted])

  const playClickSound = () => {
    if (isMuted) return

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = audioContext.createOscillator()
      const gain = audioContext.createGain()

      osc.frequency.setValueAtTime(800, audioContext.currentTime)
      osc.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.1)

      gain.gain.setValueAtTime(0.3, audioContext.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)

      osc.connect(gain)
      gain.connect(audioContext.destination)

      osc.start(audioContext.currentTime)
      osc.stop(audioContext.currentTime + 0.1)
    } catch (err) {
      // Silently handle audio errors
    }
  }

  // Add click sound to all buttons
  useEffect(() => {
    const handleButtonClick = (e: Event) => {
      const target = e.target as HTMLElement
      if (target.tagName === "BUTTON" || target.classList.contains("cursor-pointer")) {
        playClickSound()
      }
    }

    document.addEventListener("click", handleButtonClick)
    return () => document.removeEventListener("click", handleButtonClick)
  }, [isMuted])

  return (
    /* Repositioned audio button to top-right with better visibility and new blue color */
    <button
      onClick={() => setIsMuted(!isMuted)}
      className="fixed top-24 right-4 z-50 p-3 bg-blue-600 text-white border border-blue-500 rounded-full hover:bg-blue-700 hover:shadow-lg transition-all hover:scale-110"
      title={isMuted ? "Enable Audio" : "Mute Audio"}
    >
      {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
    </button>
  )
}

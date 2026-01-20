"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, Send, X } from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Welcome to EduVerse! I'm your AI guide. How can I help you explore the metaverse campus? Feel free to ask about our features, tokenomics, or how to get started.",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()

    // Features responses
    if (lowerMessage.includes("feature") || lowerMessage.includes("what can i do")) {
      return "EduVerse features NFT Classrooms for owning education sessions, a Token Economy with $EDUV rewards, On-Chain Proof for immutable credentials, and AI Tutors available 24/7. What would you like to learn more about?"
    }

    // Tokenomics responses
    if (lowerMessage.includes("token") || lowerMessage.includes("$eduv") || lowerMessage.includes("earn")) {
      return "$EDUV tokens drive the EduVerse ecosystem: 35% goes to community rewards, 25% to DAO treasury, 20% to team & operations, and 20% to ecosystem growth. You can earn by completing courses, teaching peers, and participating in governance!"
    }

    // Getting started responses
    if (lowerMessage.includes("start") || lowerMessage.includes("join") || lowerMessage.includes("beta")) {
      return "Great! To join the EduVerse beta, head to our Contact section and either connect your wallet or join our waitlist. Early members get exclusive benefits and NFT collectibles!"
    }

    // Technology responses
    if (lowerMessage.includes("technology") || lowerMessage.includes("tech") || lowerMessage.includes("built")) {
      return "We're built on cutting-edge technology: React & Three.js for immersive 3D experiences, Polygon for blockchain, GPT models for AI tutoring, and IPFS for decentralized storage. Quite the stack!"
    }

    // Problem responses
    if (lowerMessage.includes("problem") || lowerMessage.includes("why") || lowerMessage.includes("broken")) {
      return "Traditional education faces three major issues: centralization that locks knowledge in institutions, an engagement gap where outdated systems fail digital natives, and credential crisis where degrees lack verifiability. EduVerse solves all three!"
    }

    // Exploration responses
    if (lowerMessage.includes("explore") || lowerMessage.includes("campus") || lowerMessage.includes("navigate")) {
      return "Use WASD keys to move around campus, Q/E to go up/down, and click on buildings to learn more. Each campus building represents a different feature of our platform. Try visiting the NFT Classroom first!"
    }

    // Default responses
    const defaultResponses = [
      "That sounds interesting! Tell me more about what you'd like to know about EduVerse.",
      "Great question! Is there anything specific about our features, tokenomics, or platform you'd like to explore?",
      "I love your curiosity! What aspect of EduVerse interests you most - technology, education features, or tokenomics?",
      "Interesting perspective! Would you like to learn more about how EduVerse is revolutionizing education?",
    ]

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage = input
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    // Simulate response delay
    setTimeout(() => {
      const response = getAIResponse(userMessage)
      setMessages((prev) => [...prev, { role: "assistant", content: response }])
      setIsLoading(false)
    }, 600)
  }

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {isOpen && (
        <div className="mb-4 w-80 bg-card border border-border rounded-lg shadow-2xl flex flex-col h-96">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-heading font-bold text-accent glow-cyan">EduVerse AI Guide</h3>
            <button onClick={() => setIsOpen(false)} className="text-foreground/60 hover:text-foreground transition">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                    msg.role === "user"
                      ? "bg-accent text-background rounded-br-none"
                      : "bg-muted text-foreground rounded-bl-none"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted text-foreground px-4 py-2 rounded-lg rounded-bl-none">
                  <span className="animate-pulse text-sm">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-border p-4 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask me anything..."
              className="flex-1 bg-input border border-border rounded px-3 py-2 text-foreground text-sm placeholder:text-foreground/40 focus:outline-none focus:border-accent focus:glow-cyan"
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="bg-accent text-background p-2 rounded hover:glow-cyan transition disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-br from-accent to-secondary rounded-full flex items-center justify-center hover:glow-cyan transition-all cursor-pointer shadow-lg hover:scale-110"
      >
        <MessageCircle size={28} className="text-background" />
      </button>
    </div>
  )
}

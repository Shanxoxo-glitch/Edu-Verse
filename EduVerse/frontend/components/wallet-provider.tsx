"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

interface WalletContextType {
  address: string | null
  isConnected: boolean
  connect: () => Promise<void>
  disconnect: () => void
  balance: string
  chainId: number
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [balance, setBalance] = useState("0")
  const [chainId, setChainId] = useState(137) // Polygon mainnet

  // Simulate wallet connection
  const connect = async () => {
    try {
      // Simulate MetaMask connection
      const mockAddress = "0x" + Math.random().toString(16).slice(2, 42).padEnd(40, "0")
      const mockBalance = (Math.random() * 10).toFixed(2)

      setAddress(mockAddress)
      setBalance(mockBalance)
      setIsConnected(true)

      // Store in localStorage
      localStorage.setItem("walletAddress", mockAddress)
      localStorage.setItem("walletConnected", "true")
    } catch (error) {
      console.error("Wallet connection error:", error)
    }
  }

  const disconnect = () => {
    setAddress(null)
    setBalance("0")
    setIsConnected(false)
    localStorage.removeItem("walletAddress")
    localStorage.removeItem("walletConnected")
  }

  // Check for existing connection on mount
  useEffect(() => {
    const savedAddress = localStorage.getItem("walletAddress")
    const wasConnected = localStorage.getItem("walletConnected")

    if (savedAddress && wasConnected === "true") {
      setAddress(savedAddress)
      setBalance((Math.random() * 10).toFixed(2))
      setIsConnected(true)
    }
  }, [])

  return (
    <WalletContext.Provider value={{ address, isConnected, connect, disconnect, balance, chainId }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider")
  }
  return context
}

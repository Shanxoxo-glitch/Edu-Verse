"use client"

import { Wallet, LogOut } from "lucide-react"
import { useWallet } from "@/components/wallet-provider"

export default function WalletButton() {
  const { address, isConnected, connect, disconnect } = useWallet()

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <button
      onClick={isConnected ? disconnect : connect}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-heading font-bold transition-all ${
        isConnected
          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border border-blue-400/50 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg"
          : "bg-gradient-to-r from-blue-500 to-blue-600 text-white border border-blue-400/50 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg"
      }`}
    >
      {isConnected ? (
        <>
          <LogOut size={18} />
          <span className="hidden sm:inline text-sm font-heading font-bold">
            {address ? shortenAddress(address) : "Disconnect"}
          </span>
        </>
      ) : (
        <>
          <Wallet size={18} />
          <span className="hidden sm:inline text-sm font-heading font-bold">Connect Wallet</span>
        </>
      )}
    </button>
  )
}

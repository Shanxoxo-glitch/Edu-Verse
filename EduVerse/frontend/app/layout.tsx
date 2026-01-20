import type React from "react"
import type { Metadata } from "next"
import { Orbitron } from "next/font/google"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import CustomCursor from "@/components/custom-cursor"
import AudioSystem from "@/components/audio-system"
import { WalletProvider } from "@/components/wallet-provider"

const orbitron = Orbitron({ subsets: ["latin"], weight: ["400", "700", "900"] })
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "EduVerse — Decentralized Metaverse Campus",
  description: "Learn, Interact, and Earn in a Decentralized Metaverse Campus",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <style>{`
          :root {
            --font-sans: ${inter.style.fontFamily};
            --font-heading: ${orbitron.style.fontFamily};
          }
        `}</style>
      </head>
      <body className={`font-sans antialiased bg-background text-foreground`}>
        <WalletProvider>
          <CustomCursor />
          <AudioSystem />
          {children}
          <Analytics />
        </WalletProvider>
      </body>
    </html>
  )
}

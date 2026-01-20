"use client"

import type React from "react"

import { useState } from "react"
import Navigation from "@/components/navigation"
import CampusScene from "@/components/campus-scene"
import ProblemScene from "@/components/problem-scene"
import FeaturesScene from "@/components/features-scene"
import TechStack3D from "@/components/tech-stack-3d"
import TokenomicsChart from "@/components/tokenomics-chart"
import TokenomicsItemComponent from "@/components/tokenomics-item"
import ExploreCampus from "@/components/explore-campus"
import AIAssistant from "@/components/ai-assistant"
import VirtualClassroom from "@/components/virtual-classroom"

export default function Home() {
  const [activeSection, setActiveSection] = useState("home")
  const [activeFeature, setActiveFeature] = useState(0)
  const [walletConnected, setWalletConnected] = useState(false)

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Navigation
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        walletConnected={walletConnected}
        onWalletConnect={() => setWalletConnected(!walletConnected)}
      />

      <main className="relative pt-20">
        {activeSection === "home" && <HomePageHero />}
        {activeSection === "problem" && <ProblemSectionWithScene />}
        {activeSection === "features" && (
          <FeaturesSectionWithScene activeFeature={activeFeature} setActiveFeature={setActiveFeature} />
        )}
        {activeSection === "technology" && <TechnologySectionEnhanced />}
        {activeSection === "explore" && <ExploreCampusPage />}
        {activeSection === "courses" && <CoursesPage />}
        {activeSection === "mentors" && <MentorsPage />}
        {activeSection === "community" && <CommunityPage />}
        {activeSection === "rewards" && <RewardsPage />}
        {activeSection === "profile" && <ProfilePage />}
        {activeSection === "contact" && <ContactSection />}
      </main>

      <AIAssistant />
    </div>
  )
}

function HomePageHero() {
  return (
    <section className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden">
      <CampusScene type="home" />

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="relative z-10 text-center space-y-8 pointer-events-auto">
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-7xl md:text-8xl font-heading font-black text-balance leading-tight">
              <span className="text-blue-900">EduVerse</span>
            </h1>
            <p className="text-2xl md:text-3xl text-slate-700 font-heading">
              Step into the Future of Decentralized Learning
            </p>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Where Learning Feels Real — a fully immersive 3D metaverse campus for students and educators
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <button className="relative px-8 py-4 bg-primary text-primary-foreground font-heading font-bold rounded-lg hover:bg-primary/90 hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 border border-primary/50">
              Enter Campus
              <span className="absolute inset-0 rounded-lg bg-primary/20 opacity-0 hover:opacity-100 transition-opacity blur-xl"></span>
            </button>

            <button className="px-8 py-4 border-2 border-primary text-primary font-heading font-bold rounded-lg hover:bg-primary/10 transition-all duration-300 hover:border-primary/80">
              Explore Demo
            </button>
          </div>

          <div className="pt-8 space-y-2 text-sm text-slate-600">
            <p>Trusted by educators and learners worldwide</p>
            <div className="flex items-center justify-center gap-4">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span>Join 10,000+ early members</span>
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ProblemSectionWithScene() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  const problems = [
    {
      icon: "🏢",
      title: "Centralization Crisis",
      description: "Learning is locked in institutional silos with limited accessibility and zero transparency",
      details: "Traditional education gatekeeps knowledge and restricts who can teach or learn.",
      gradient: "from-cyan-500/20 to-transparent",
    },
    {
      icon: "🎮",
      title: "Engagement Gap",
      description: "Digital natives need immersive experiences, not outdated lecture halls",
      details: "Current systems fail to motivate and engage the next generation of learners.",
      gradient: "from-purple-500/20 to-transparent",
    },
    {
      icon: "📜",
      title: "Credential Crisis",
      description: "Degrees lack verifiability, portability, and real-world value",
      details: "No proof of actual learning or skills—just certificates that don't transfer.",
      gradient: "from-orange-500/20 to-transparent",
    },
  ]

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 py-32 bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl w-full relative z-10">
        <div className="text-center mb-24">
          <h1 className="text-6xl md:text-7xl font-heading font-black text-balance mb-6">
            <span className="text-accent glow-cyan">The Education Problem</span>
          </h1>
          <p className="text-xl text-foreground/60 max-w-3xl mx-auto">
            Traditional education is broken. Centralized, disengaging, and unable to prove what students actually learn.
          </p>
        </div>

        <div className="mb-24 bg-card/30 rounded-2xl p-8 backdrop-blur border border-border/50 overflow-hidden">
          <ProblemScene />
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((problem, idx) => (
            <div
              key={idx}
              onMouseEnter={() => setHoveredCard(idx)}
              onMouseLeave={() => setHoveredCard(null)}
              className="relative group cursor-pointer"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-b ${problem.gradient} rounded-2xl blur-xl transition-all duration-300 ${hoveredCard === idx ? "opacity-100" : "opacity-0"}`}
              ></div>

              <div
                className={`relative bg-card/50 backdrop-blur border border-border rounded-2xl p-8 transition-all duration-300 ${hoveredCard === idx ? "border-accent/50 translate-y-[-8px] shadow-2xl" : "border-border/50"}`}
              >
                <div className="text-5xl mb-6">{problem.icon}</div>

                <h3 className="text-2xl font-heading font-bold text-secondary mb-3">{problem.title}</h3>
                <p className="text-foreground/80 mb-6">{problem.description}</p>

                <div
                  className={`overflow-hidden transition-all duration-300 ${hoveredCard === idx ? "max-h-24 opacity-100" : "max-h-0 opacity-0"}`}
                >
                  <p className="text-sm text-accent border-t border-accent/30 pt-4">{problem.details}</p>
                </div>

                <div
                  className={`mt-6 w-2 h-2 bg-accent rounded-full glow-cyan transition-all duration-300 ${hoveredCard === idx ? "scale-100" : "scale-0"}`}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-24 text-center">
          <p className="text-foreground/70 mb-8">
            EduVerse solves these problems with decentralized, immersive, blockchain-verified learning
          </p>
          <div className="inline-block px-8 py-4 bg-accent/10 border border-accent/30 rounded-full text-accent glow-cyan">
            Explore our solution
          </div>
        </div>
      </div>
    </section>
  )
}

function FeaturesSectionWithScene({
  activeFeature,
  setActiveFeature,
}: { activeFeature: number; setActiveFeature: (idx: number) => void }) {
  const features = [
    {
      icon: "🏛️",
      title: "NFT Classrooms",
      description: "Own and host educational sessions",
      fullDescription:
        "Create and monetize your own classrooms with blockchain-verified credentials. Students own their learning experience.",
      color: "from-cyan-500/20",
    },
    {
      icon: "🪙",
      title: "Token Economy",
      description: "Earn $EDUV for learning and teaching",
      fullDescription:
        "Complete courses, teach peers, and participate in governance. Real economic value for real learning.",
      color: "from-secondary/20",
    },
    {
      icon: "⛓️",
      title: "On-Chain Proof",
      description: "Immutable attendance and achievements",
      fullDescription:
        "Every completed course and achievement is permanently recorded on blockchain. Portable, verifiable credentials.",
      color: "from-purple-500/20",
    },
    {
      icon: "🤖",
      title: "AI Tutors",
      description: "Personalized holographic guides",
      fullDescription:
        "Interactive AI assistants adapt to your learning pace and style. Available 24/7 for support and guidance.",
      color: "from-orange-500/20",
    },
  ]

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 py-32 bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl w-full relative z-10">
        <div className="text-center mb-24">
          <h1 className="text-6xl md:text-7xl font-heading font-black text-balance mb-6">
            <span className="text-accent glow-cyan">EduVerse Features</span>
          </h1>
          <p className="text-xl text-foreground/60 max-w-3xl mx-auto">
            A complete ecosystem for decentralized, immersive, rewarded education
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="grid grid-cols-2 gap-6">
            {features.map((feature, idx) => (
              <button
                key={idx}
                onClick={() => setActiveFeature(idx)}
                className={`relative group p-6 rounded-2xl transition-all duration-300 text-left ${activeFeature === idx ? "bg-card border border-accent/50" : "bg-card/30 border border-border hover:border-border"}`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-b ${feature.color} rounded-2xl blur-xl transition-all duration-300 ${activeFeature === idx ? "opacity-100" : "opacity-0"}`}
                ></div>

                <div className="relative">
                  <div className="text-4xl mb-3">{feature.icon}</div>
                  <h3 className="font-heading font-bold text-secondary mb-2">{feature.title}</h3>
                  <p className="text-sm text-foreground/60">{feature.description}</p>

                  {activeFeature === idx && (
                    <div className="mt-4 pt-4 border-t border-accent/30">
                      <div className="w-2 h-2 bg-accent rounded-full glow-cyan"></div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="relative">
            <div className="mb-8 sticky top-32">
              <FeaturesScene activeFeatureIndex={activeFeature} />
            </div>

            <div className="sticky top-96 bg-card/50 backdrop-blur border border-border rounded-2xl p-12">
              <div className="text-7xl mb-8">{features[activeFeature].icon}</div>
              <h2 className="text-4xl font-heading font-bold text-accent mb-4 glow-cyan">
                {features[activeFeature].title}
              </h2>
              <p className="text-foreground/80 text-lg mb-8">{features[activeFeature].fullDescription}</p>

              <div className="flex items-center gap-3 text-accent">
                <div className="w-3 h-3 bg-accent rounded-full glow-cyan"></div>
                <p className="text-sm font-heading">Core Platform Feature</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function TechnologySectionEnhanced() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 py-20 bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl w-full relative z-10">
        <div className="text-center mb-24">
          <h1 className="text-6xl font-heading font-black text-balance mb-6">
            <span className="text-accent glow-cyan">Technology Stack</span>
          </h1>
          <p className="text-xl text-foreground/60">Built on cutting-edge Web3, AI, and 3D technologies</p>
        </div>

        <div className="mb-24 bg-card/30 rounded-2xl p-8 backdrop-blur border border-border/50 overflow-hidden">
          <TechStack3D />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
          <TechStackCard
            title="Frontend"
            items={["React", "Three.js", "Next.js 16", "WebGL"]}
            color="from-cyan-500/20"
          />
          <TechStackCard
            title="Blockchain"
            items={["Polygon", "Smart Contracts", "NFT Standards", "Web3.js"]}
            color="from-purple-500/20"
          />
          <TechStackCard
            title="AI & Analytics"
            items={["GPT Models", "Machine Learning", "Data Analytics", "Adaptive Learning"]}
            color="from-orange-500/20"
          />
          <TechStackCard
            title="Storage & Infrastructure"
            items={["IPFS", "Decentralized Data", "Arweave", "Node.js"]}
            color="from-green-500/20"
          />
        </div>

        {/* Tokenomics section */}
        <div className="mt-40">
          <div className="text-center mb-24">
            <h2 className="text-5xl font-heading font-bold text-balance mb-6">
              <span className="text-secondary">Token Economics</span>
            </h2>
            <p className="text-lg text-foreground/60 max-w-3xl mx-auto">
              $EDUV drives the EduVerse ecosystem, rewarding learning, teaching, and participation
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="bg-card/30 rounded-2xl p-8 backdrop-blur border border-border/50 overflow-hidden">
              <TokenomicsChart />
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-2xl font-heading font-bold text-accent glow-cyan">Token Distribution</h3>
                <TokenomicsItemComponent percentage={35} label="Community Rewards" color="bg-cyan-500" />
                <TokenomicsItemComponent percentage={25} label="DAO Treasury" color="bg-purple-500" />
                <TokenomicsItemComponent percentage={20} label="Team & Operations" color="bg-yellow-500" />
                <TokenomicsItemComponent percentage={20} label="Ecosystem Growth" color="bg-green-500" />
              </div>

              <div className="space-y-4 pt-8 border-t border-border">
                <h3 className="text-lg font-heading font-bold text-foreground">Use Cases</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0 glow-cyan"></div>
                    <span className="text-foreground/80">Earn by completing courses and teaching peers</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0 glow-cyan"></div>
                    <span className="text-foreground/80">Stake to participate in governance decisions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0 glow-cyan"></div>
                    <span className="text-foreground/80">Access premium classrooms and AI tutors</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0 glow-cyan"></div>
                    <span className="text-foreground/80">Trade on decentralized exchanges</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function TechStackCard({ title, items, color }: { title: string; items: string[]; color: string }) {
  return (
    <div
      className={`bg-gradient-to-b ${color} rounded-xl p-6 border border-border/50 backdrop-blur hover:border-accent/50 transition-all`}
    >
      <h3 className="text-xl font-heading font-bold text-secondary mb-4">{title}</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-foreground/80">
            <div className="w-1.5 h-1.5 bg-accent rounded-full glow-cyan"></div>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function ContactSection() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "", betaType: "waitlist" })
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    // Simulate form submission
    console.log("Form submitted:", formData)
    setSubmitted(true)

    setTimeout(() => {
      setSubmitted(false)
      setFormData({ name: "", email: "", message: "", betaType: "waitlist" })
    }, 3000)
  }

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 py-20 bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl w-full relative z-10">
        <div className="text-center mb-24">
          <h1 className="text-6xl font-heading font-black text-balance mb-6">
            <span className="text-accent glow-cyan">Join EduVerse Beta</span>
          </h1>
          <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
            Be among the first to experience the future of decentralized education
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Beta benefits */}
          <div className="space-y-8">
            <h2 className="text-3xl font-heading font-bold text-secondary mb-8">Early Member Benefits</h2>

            <div className="space-y-4">
              {[
                { title: "Exclusive NFT", desc: "Founding member NFT collectible" },
                { title: "Token Airdrop", desc: "Extra $EDUV tokens for early supporters" },
                { title: "Priority Access", desc: "VIP campus features and premium classes" },
                { title: "Governance Rights", desc: "Vote on platform direction and features" },
                { title: "Special Badge", desc: "Display your pioneer status" },
                { title: "Community Discord", desc: "Access to exclusive founder community" },
              ].map((benefit, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 p-4 bg-card/50 rounded-lg border border-border/50 hover:border-accent/50 transition"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-accent to-secondary rounded-lg flex items-center justify-center flex-shrink-0 glow-cyan">
                    <span className="text-background font-heading font-bold">{idx + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-foreground mb-1">{benefit.title}</h4>
                    <p className="text-sm text-foreground/60">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact form */}
          <div className="bg-card/50 backdrop-blur border border-border rounded-2xl p-8">
            {submitted ? (
              <div className="text-center py-12">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent to-secondary rounded-full mx-auto flex items-center justify-center glow-cyan mb-4">
                    <svg className="w-8 h-8 text-background" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-heading font-bold text-accent mb-2 glow-cyan">Thank you!</h3>
                <p className="text-foreground/80">We received your application. Check your email for next steps!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-heading font-bold text-foreground/80 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full bg-input border rounded px-4 py-3 text-foreground focus:outline-none focus:glow-cyan transition ${
                      errors.name ? "border-red-500" : "border-border"
                    }`}
                    placeholder="Your name"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-heading font-bold text-foreground/80 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full bg-input border rounded px-4 py-3 text-foreground focus:outline-none focus:glow-cyan transition ${
                      errors.email ? "border-red-500" : "border-border"
                    }`}
                    placeholder="your@email.com"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-heading font-bold text-foreground/80 mb-2">Interest</label>
                  <select
                    value={formData.betaType}
                    onChange={(e) => setFormData({ ...formData, betaType: e.target.value })}
                    className="w-full bg-input border border-border rounded px-4 py-3 text-foreground focus:outline-none focus:glow-cyan transition"
                  >
                    <option value="waitlist">Join Waitlist</option>
                    <option value="teacher">Become Teacher</option>
                    <option value="partner">Partnership</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-heading font-bold text-foreground/80 mb-2">Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-input border border-border rounded px-4 py-3 text-foreground h-32 focus:outline-none focus:glow-cyan transition resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-900 text-blue-200 px-6 py-3 rounded-lg font-heading font-bold hover:bg-blue-800 transition-all border border-blue-500/50 hover:border-blue-500/70"
                >
                  Join EduVerse Beta
                </button>

                <p className="text-xs text-foreground/60 text-center">
                  We respect your privacy. Your info will only be used for beta updates.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function ExploreCampusPage() {
  const [hoveredBuilding, setHoveredBuilding] = useState<string | null>(null)
  const [showClassroom, setShowClassroom] = useState(false)

  return (
    <div className="relative w-full">
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20 bg-background relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-6xl w-full relative z-10">
          <div className="text-center mb-16">
            <h1 className="text-6xl font-heading font-black text-balance mb-6">
              <span className="text-blue-900">3D Classroom</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Join interactive virtual classrooms with AI teachers and fellow students
            </p>
          </div>

          {/* 3D Classroom Section */}
          <div className="mb-16 bg-card/50 rounded-2xl p-8 backdrop-blur border border-border overflow-hidden">
            <VirtualClassroom />
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-card/50 backdrop-blur border border-border rounded-2xl p-6 hover:border-blue-500/50 transition">
              <div className="text-4xl mb-4">👨‍🏫</div>
              <h3 className="text-xl font-heading font-bold text-blue-900 mb-2">Expert Teachers</h3>
              <p className="text-slate-600 text-sm">Learn from experienced AI tutors and industry professionals</p>
            </div>

            <div className="bg-card/50 backdrop-blur border border-border rounded-2xl p-6 hover:border-blue-500/50 transition">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-heading font-bold text-blue-900 mb-2">Peer Collaboration</h3>
              <p className="text-slate-600 text-sm">Engage with students around the world in immersive classrooms</p>
            </div>

            <div className="bg-card/50 backdrop-blur border border-border rounded-2xl p-6 hover:border-blue-500/50 transition">
              <div className="text-4xl mb-4">🎓</div>
              <h3 className="text-xl font-heading font-bold text-blue-900 mb-2">Real-Time Learning</h3>
              <p className="text-slate-600 text-sm">
                Interactive experiences with instant feedback and progress tracking
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600/10 to-blue-500/10 rounded-2xl border border-blue-500/20 p-8 text-center">
            <p className="text-slate-700 mb-4">Ready to experience the future of education?</p>
            <button className="px-8 py-3 bg-primary text-primary-foreground font-heading font-bold rounded-lg hover:bg-primary/90 transition-all border border-primary/50 hover:shadow-lg">
              Join a Class Now
            </button>
          </div>
        </div>
      </div>

      {/* Original campus explorer */}
      <div className="relative">
        <ExploreCampus onBuildingHovered={setHoveredBuilding} />

        {hoveredBuilding && (
          <div className="absolute top-32 left-8 bg-card/80 backdrop-blur border border-border rounded-lg p-4 max-w-xs">
            <p className="text-sm text-blue-600 font-heading font-bold">{hoveredBuilding}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function CoursesPage() {
  const [selectedCourse, setSelectedCourse] = useState(0)

  const courses = [
    {
      title: "Web3 Fundamentals",
      instructor: "Alex Chen",
      level: "Beginner",
      progress: 45,
      icon: "⛓️",
      description: "Learn blockchain basics, smart contracts, and DeFi fundamentals",
      duration: "6 weeks",
      students: 234,
      reward: "500 EDUV",
    },
    {
      title: "AI & Machine Learning",
      instructor: "Dr. Sarah Kim",
      level: "Intermediate",
      progress: 0,
      icon: "🤖",
      description: "Deep dive into neural networks and modern AI applications",
      duration: "8 weeks",
      students: 156,
      reward: "750 EDUV",
    },
    {
      title: "Metaverse Development",
      instructor: "Jordan Lee",
      level: "Advanced",
      progress: 0,
      icon: "🌐",
      description: "Build immersive 3D experiences with Three.js and WebGL",
      duration: "10 weeks",
      students: 89,
      reward: "1000 EDUV",
    },
    {
      title: "Digital Marketing",
      instructor: "Emma Rodriguez",
      level: "Beginner",
      progress: 60,
      icon: "📱",
      description: "Master social media, content strategy, and growth hacking",
      duration: "4 weeks",
      students: 412,
      reward: "400 EDUV",
    },
  ]

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 py-20 bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl w-full relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-heading font-black text-balance mb-6">
            <span className="text-accent glow-cyan">Explore Courses</span>
          </h1>
          <p className="text-xl text-foreground/60 max-w-3xl mx-auto">
            Learn from industry experts and earn EDUV tokens while mastering cutting-edge skills
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {courses.map((course, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedCourse(idx)}
              className={`relative group cursor-pointer transition-all duration-300 ${
                selectedCourse === idx ? "lg:col-span-2" : ""
              }`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-b from-cyan-500/20 to-transparent rounded-2xl blur-xl transition-all duration-300 ${
                  selectedCourse === idx ? "opacity-100" : "opacity-0"
                }`}
              ></div>

              <div
                className={`relative bg-card/50 backdrop-blur border border-border rounded-2xl p-6 transition-all duration-300 ${
                  selectedCourse === idx ? "border-accent/50 shadow-2xl" : "border-border/50 hover:border-accent/30"
                }`}
              >
                <div className="text-5xl mb-4">{course.icon}</div>
                <h3 className="text-2xl font-heading font-bold text-blue-300 mb-2">{course.title}</h3>
                <p className="text-sm text-blue-200/90 mb-3">{course.instructor}</p>

                {selectedCourse === idx && (
                  <div className="mt-6 space-y-4">
                    <p className="text-foreground/80">{course.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <div className="text-xs bg-blue-500/20 text-blue-400 font-medium rounded-full px-3 py-1 border border-blue-400/30">{course.level}</div>
                      <div className="text-xs bg-amber-500/20 text-amber-400 font-medium rounded-full px-3 py-1 border border-amber-400/30">
                        {course.duration}
                      </div>
                      <div className="text-xs bg-purple-500/20 text-purple-300 font-medium rounded-full px-3 py-1 border border-purple-400/30">
                        {course.students} students
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <button className="bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg p-2 text-sm font-medium hover:bg-blue-500/20 transition-all">
                        View on Explorer
                      </button>
                      <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-2 text-sm font-bold hover:from-blue-600 hover:to-blue-700 hover:shadow-lg transition-all">
                        Claim Rewards
                      </button>
                    </div>
                    <div className="pt-4 border-t border-border">
                      <p className="text-blue-400 font-heading font-bold mb-3">Earn: <span className="text-blue-300">{course.reward}</span></p>
                      <div className="w-full bg-background rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-accent to-secondary transition-all"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-foreground/60 mt-2">{course.progress}% Complete</p>
                    </div>
                    <button className="w-full bg-primary text-primary-foreground px-4 py-3 rounded-lg font-heading font-bold hover:bg-primary/90 transition-all border border-primary/50 hover:shadow-md">
                      {course.progress > 0 ? "Continue Course" : "Start Course"}
                    </button>
                  </div>
                )}

                {selectedCourse !== idx && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-primary/90 font-medium">{course.level}</span>
                    <span className="text-xs bg-primary/20 text-primary font-medium rounded-full px-2.5 py-1">{course.progress}%</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function MentorsPage() {
  const mentors = [
    {
      name: "Dr. Alex Chen",
      expertise: "Web3 & Blockchain",
      rating: 4.9,
      students: 1203,
      avatar: "👨‍💼",
      schedule: "Available Mon-Fri",
      hourlyRate: "50 EDUV/hr",
    },
    {
      name: "Sarah Kim",
      expertise: "AI & ML Engineering",
      rating: 4.8,
      students: 987,
      avatar: "👩‍💼",
      schedule: "Available Tue-Sat",
      hourlyRate: "75 EDUV/hr",
    },
    {
      name: "Jordan Lee",
      expertise: "3D Graphics & Game Dev",
      rating: 4.95,
      students: 654,
      avatar: "👨‍💻",
      schedule: "Available Wed-Sun",
      hourlyRate: "60 EDUV/hr",
    },
    {
      name: "Emma Rodriguez",
      expertise: "Digital Marketing",
      rating: 4.7,
      students: 1456,
      avatar: "👩‍💻",
      schedule: "Available Mon-Thu",
      hourlyRate: "40 EDUV/hr",
    },
    {
      name: "Marcus Johnson",
      expertise: "Smart Contracts",
      rating: 5.0,
      students: 523,
      avatar: "👨‍🎓",
      schedule: "Available Sat-Sun",
      hourlyRate: "80 EDUV/hr",
    },
    {
      name: "Lisa Wang",
      expertise: "Data Science",
      rating: 4.85,
      students: 834,
      avatar: "👩‍🏫",
      schedule: "Available Daily",
      hourlyRate: "70 EDUV/hr",
    },
  ]

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 py-20 bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-accent/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl w-full relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-heading font-black text-balance mb-6">
            <span className="text-secondary">Expert Mentors</span>
          </h1>
          <p className="text-xl text-foreground/60 max-w-3xl mx-auto">
            Connect with verified educators and industry professionals
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentors.map((mentor, idx) => (
            <div
              key={idx}
              className="relative group bg-card/50 backdrop-blur border border-border rounded-2xl p-6 hover:border-accent/50 transition-all duration-300 hover:translate-y-[-4px]"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-secondary/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all"></div>

              <div className="relative">
                <div className="text-6xl mb-4 text-center">{mentor.avatar}</div>
                <h3 className="text-xl font-heading font-bold text-foreground mb-1 text-center">{mentor.name}</h3>
                <p className="text-sm text-cyan-300 font-bold text-center mb-4 font-heading">
                  {mentor.expertise}
                </p>

                <div className="space-y-3 text-sm mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground/70">Rating:</span>
                    <span className="text-yellow-400 font-bold">{mentor.rating}/5.0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground/70">Tokens Earned:</span>
                    <span className="font-bold text-blue-400">1,250 $EDUV</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-foreground/70">NFT Badges:</span>
                    <span className="font-bold text-purple-400">3/5</span>
                  </div>
                  <span className="text-xs bg-primary/20 text-primary font-medium rounded-full px-3 py-1 border border-primary/30">
                    {mentor.schedule}
                  </span>
                </div>

                <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg font-heading font-bold hover:bg-primary/90 transition-all border border-primary/50 hover:shadow-md">
                  Book Session
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CommunityPage() {
  const [messages, setMessages] = useState([
    {
      user: "Alex",
      avatar: "👨‍💼",
      message: "Just finished the Web3 course! Check out my NFT project",
      time: "2m ago",
    },
    {
      user: "Sarah",
      avatar: "👩‍💼",
      message: "Anyone interested in a study group for AI fundamentals?",
      time: "5m ago",
    },
    { user: "Jordan", avatar: "👨‍💻", message: "The new 3D metaverse update is 🔥", time: "12m ago" },
  ])
  const [newMessage, setNewMessage] = useState("")

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, { user: "You", avatar: "🤖", message: newMessage, time: "now" }])
      setNewMessage("")
    }
  }

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 py-20 bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/3 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-1/3 w-80 h-80 bg-secondary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl w-full relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-heading font-black text-balance mb-6">
            <span className="text-accent glow-cyan">Campus Community</span>
          </h1>
        </div>

        <div className="bg-card/50 backdrop-blur border border-border rounded-2xl overflow-hidden flex flex-col h-[600px]">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="text-3xl">{msg.avatar}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-heading font-bold text-foreground">{msg.user}</span>
                    <span className="text-xs text-foreground/50">{msg.time}</span>
                  </div>
                  <p className="text-foreground/80">{msg.message}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border p-4 flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Share something with the community..."
              className="flex-1 bg-input border border-border rounded px-4 py-2 text-foreground placeholder-foreground/50 focus:outline-none focus:border-accent"
            />
            <button
              onClick={handleSendMessage}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-heading font-bold hover:bg-primary/90 transition-all border border-primary/50 hover:shadow-md"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

function RewardsPage() {
  const [userTokens] = useState(2450)
  const [userNFTs] = useState(3)

  const rewards = [
    { type: "Daily Login", earned: 10, date: "Today" },
    { type: "Course Completed", earned: 500, date: "2 days ago" },
    { type: "Mentor Session", earned: 75, date: "1 week ago" },
    { type: "Community Contribution", earned: 50, date: "2 weeks ago" },
  ]

  const leaderboard = [
    { rank: 1, name: "Alex Chen", tokens: 15420, badge: "👑" },
    { rank: 2, name: "Sarah Kim", tokens: 12890, badge: "🥈" },
    { rank: 3, name: "Jordan Lee", tokens: 11560, badge: "🥉" },
    { rank: 4, name: "Emma Rodriguez", tokens: 9870, badge: "⭐" },
    { rank: 5, name: "Marcus Johnson", tokens: 8950, badge: "⭐" },
  ]

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 py-20 bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl w-full relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-heading font-black text-balance mb-6">
            <span className="text-secondary">Rewards & Tokens</span>
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-1 bg-card/50 backdrop-blur border border-border rounded-2xl p-8">
            <h2 className="text-sm text-foreground/60 font-heading mb-2">Your Balance</h2>
            <p className="text-5xl font-heading font-bold text-blue-300 mb-4">{userTokens} <span className="text-2xl text-blue-400">$EDUV</span></p>
            <p className="text-sm font-medium text-blue-300/90 mb-6">≈ ${(userTokens * 0.25).toFixed(2)} USD</p>
            <button
              onClick={() => console.log("Trade Tokens")}
              className="w-full bg-primary text-primary-foreground px-4 py-3 rounded-lg font-heading font-bold hover:bg-primary/90 transition-all border border-primary/50 hover:shadow-md"
            >
              Trade Tokens
            </button>
          </div>

          <div className="lg:col-span-2 bg-card/50 backdrop-blur border border-border rounded-2xl p-8">
            <h2 className="text-2xl font-heading font-bold text-foreground mb-6">Recent Rewards</h2>
            <div className="space-y-4">
              {rewards.map((reward, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/50"
                >
                  <div>
                    <p className="font-heading font-bold text-foreground">{reward.type}</p>
                    <p className="text-sm text-foreground/60">{reward.date}</p>
                  </div>
                  <p className="text-lg font-heading font-bold text-secondary glow-gold">+{reward.earned}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-card/50 backdrop-blur border border-border rounded-2xl p-8">
          <h2 className="text-2xl font-heading font-bold text-foreground mb-6">Top Learners</h2>
          <div className="space-y-2">
            {leaderboard.map((learner, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-4 bg-background/50 rounded-lg border border-border/50 hover:border-accent/30 transition"
              >
                <span className="text-2xl">{learner.badge}</span>
                <div className="flex-1">
                  <p className="font-heading font-bold text-foreground">{learner.name}</p>
                  <p className="text-xs text-foreground/60">Rank #{learner.rank}</p>
                </div>
                <p className="text-lg font-heading font-bold text-secondary">{learner.tokens}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function ProfilePage() {
  const [avatar, setAvatar] = useState({ hair: "brown", outfit: "blue", accessories: "none" })
  const [userInfo] = useState({
    name: "Alex Developer",
    email: "alex@eduverse.com",
    joined: "2024",
    coursesCompleted: 5,
    certificates: 3,
  })

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 py-20 bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl w-full relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-heading font-black text-balance mb-6">
            <span className="text-accent glow-cyan">Your Profile</span>
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-card/50 backdrop-blur border border-border rounded-2xl p-8">
            <div className="bg-background rounded-xl p-8 mb-6 border border-border text-center">
              <div className="text-8xl mb-4">🧑‍🎓</div>
              <p className="font-heading font-bold text-foreground mb-2">{userInfo.name}</p>
              <p className="text-sm text-accent glow-cyan">Member since {userInfo.joined}</p>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-background/50 rounded border border-border text-center">
                <p className="text-sm text-foreground/60">Courses Completed</p>
                <p className="text-2xl font-heading font-bold text-secondary">{userInfo.coursesCompleted}</p>
              </div>
              <div className="p-3 bg-background/50 rounded border border-border text-center">
                <p className="text-sm text-foreground/60">Certificates</p>
                <p className="text-2xl font-heading font-bold text-accent glow-cyan">{userInfo.certificates}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-card/50 backdrop-blur border border-border rounded-2xl p-8">
            <h2 className="text-2xl font-heading font-bold text-foreground mb-6">Avatar Customization</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-heading font-bold text-foreground/80 mb-3">Hair Style</label>
                <div className="flex gap-2">
                  {["brown", "black", "blonde", "purple"].map((hair) => (
                    <button
                      key={hair}
                      onClick={() => setAvatar({ ...avatar, hair })}
                      className={`px-4 py-2 rounded-lg transition ${
                        avatar.hair === hair
                          ? "bg-primary text-primary-foreground border border-primary/50"
                          : "bg-background border border-border hover:border-primary/50"
                      }`}
                    >
                      {hair}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-heading font-bold text-foreground/80 mb-3">Outfit</label>
                <div className="flex gap-2">
                  {["blue", "red", "green", "neon"].map((outfit) => (
                    <button
                      key={outfit}
                      onClick={() => setAvatar({ ...avatar, outfit })}
                      className={`px-4 py-2 rounded-lg transition ${
                        avatar.outfit === outfit
                          ? "bg-primary/90 text-primary-foreground border border-primary/50"
                          : "bg-background border border-border hover:border-primary/50"
                      }`}
                    >
                      {outfit}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-heading font-bold text-foreground/80 mb-3">Accessories</label>
                <div className="flex gap-2">
                  {["none", "glasses", "hat", "crown"].map((acc) => (
                    <button
                      key={acc}
                      onClick={() => setAvatar({ ...avatar, accessories: acc })}
                      className={`px-4 py-2 rounded-lg transition ${
                        avatar.accessories === acc
                          ? "bg-primary/90 text-primary-foreground border border-primary/50"
                          : "bg-background border border-border hover:border-primary/50"
                      }`}
                    >
                      {acc}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-background/50 rounded-lg border border-border">
              <h3 className="font-heading font-bold text-foreground mb-4">Connected Wallets</h3>
              <button className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-3 rounded-lg font-heading font-bold border border-blue-500 hover:from-blue-500 hover:to-blue-600 hover:shadow-lg transition-all">
                0x1234...5678 (Connected)
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

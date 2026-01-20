"use client"

import { useState } from "react"

interface StudentAvatar {
  id: number
  name: string
  emoji: string
  status: "active" | "idle" | "away"
}

export default function VirtualClassroom() {
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null)

  const teacher = {
    name: "Dr. Alexandra Chen",
    emoji: "👨‍🏫",
    status: "teaching",
    currentTopic: "Web3 Smart Contracts Fundamentals",
  }

  const students: StudentAvatar[] = [
    { id: 1, name: "Alex", emoji: "👨‍🎓", status: "active" },
    { id: 2, name: "Sarah", emoji: "👩‍🎓", status: "active" },
    { id: 3, name: "Jordan", emoji: "👨‍💼", status: "active" },
    { id: 4, name: "Emma", emoji: "👩‍💼", status: "idle" },
    { id: 5, name: "Michael", emoji: "🧑‍💻", status: "active" },
    { id: 6, name: "Lisa", emoji: "👩‍💻", status: "away" },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "idle":
        return "bg-yellow-500"
      case "away":
        return "bg-gray-400"
      default:
        return "bg-blue-500"
    }
  }

  return (
    <div className="space-y-8">
      {/* Classroom Header */}
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
        <div>
          <h3 className="text-2xl font-heading font-bold text-blue-900 mb-1">Live Classroom</h3>
          <p className="text-sm text-blue-700">{teacher.currentTopic}</p>
        </div>
        <div className="text-center">
          <div className="text-5xl mb-2">{teacher.emoji}</div>
          <p className="font-heading font-bold text-blue-900 text-sm">{teacher.name}</p>
        </div>
      </div>

      {/* Whiteboard/Content Area */}
      <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl p-12 border-2 border-slate-300 min-h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-slate-700 font-heading font-bold text-lg mb-2">Interactive Whiteboard</p>
          <p className="text-slate-600 text-sm max-w-md">
            Real-time collaboration space for diagrams, code snippets, and learning materials
          </p>
        </div>
      </div>

      {/* Students Grid */}
      <div>
        <h4 className="text-lg font-heading font-bold text-blue-900 mb-4">Participants ({students.length})</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Teacher */}
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center text-4xl border-4 border-blue-500 shadow-lg">
                {teacher.emoji}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <p className="text-xs font-heading font-bold text-center text-blue-900 text-wrap line-clamp-2">
              {teacher.name}
            </p>
            <p className="text-xs text-red-600 font-bold mt-1">LIVE</p>
          </div>

          {/* Students */}
          {students.map((student) => (
            <button
              key={student.id}
              onClick={() => setSelectedStudent(student.id)}
              className={`flex flex-col items-center cursor-pointer transition-transform hover:scale-105 ${
                selectedStudent === student.id ? "scale-110" : ""
              }`}
            >
              <div className="relative mb-2">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg flex items-center justify-center text-4xl border-2 border-slate-400 shadow-md hover:shadow-lg transition">
                  {student.emoji}
                </div>
                <div
                  className={`absolute -bottom-1 -right-1 w-5 h-5 ${getStatusColor(student.status)} rounded-full border-2 border-white`}
                ></div>
              </div>
              <p className="text-xs font-heading font-bold text-center text-slate-700 max-w-[4rem] line-clamp-2">
                {student.name}
              </p>
              <p className="text-xs text-slate-500 mt-1 capitalize">{student.status}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Student Info */}
      {selectedStudent !== null && (
        <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">{students.find((s) => s.id === selectedStudent)?.emoji}</div>
            <div>
              <p className="font-heading font-bold text-blue-900 text-lg">
                {students.find((s) => s.id === selectedStudent)?.name}
              </p>
              <p className="text-sm text-blue-600 capitalize">
                Status: {students.find((s) => s.id === selectedStudent)?.status}
              </p>
            </div>
          </div>
          <p className="text-slate-700 text-sm">Actively participating in class • Notes shared • 95% attendance</p>
        </div>
      )}

      {/* Classroom Controls */}
      <div className="flex gap-3 flex-wrap">
        <button className="flex-1 min-w-32 px-4 py-2 bg-blue-600 text-white font-heading font-bold rounded-lg hover:bg-blue-700 transition">
          Raise Hand
        </button>
        <button className="flex-1 min-w-32 px-4 py-2 bg-slate-600 text-white font-heading font-bold rounded-lg hover:bg-slate-700 transition">
          Share Screen
        </button>
        <button className="flex-1 min-w-32 px-4 py-2 bg-slate-200 text-slate-900 font-heading font-bold rounded-lg hover:bg-slate-300 transition">
          Chat
        </button>
      </div>
    </div>
  )
}

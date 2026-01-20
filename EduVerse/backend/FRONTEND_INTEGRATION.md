# 🔗 Frontend Integration Guide

Complete guide for connecting your EduVerse 3D frontend with the backend API.

---

## 📦 Frontend Setup

### 1. Install Required Packages

```bash
cd ../  # Go to root Eduverse directory
npm install axios socket.io-client ethers
```

### 2. Create API Configuration

Create `lib/api.ts`:

```typescript
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('eduverse_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('eduverse_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 3. Create Socket.IO Configuration

Create `lib/socket.ts`:

```typescript
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export const initializeSocket = (token: string) => {
  if (socket) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('✅ Connected to EduVerse Socket.IO');
  });

  socket.on('disconnect', () => {
    console.log('❌ Disconnected from EduVerse');
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
```

---

## 🔐 Authentication Integration

### Login Component Example

Create `components/auth/LoginForm.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { initializeSocket } from '@/lib/socket';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      
      // Store token
      localStorage.setItem('eduverse_token', response.data.token);
      localStorage.setItem('eduverse_user', JSON.stringify(response.data.data));
      
      // Initialize Socket.IO
      initializeSocket(response.data.token);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full px-4 py-2 border rounded"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full px-4 py-2 border rounded"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### Web3 Wallet Login

Create `components/auth/WalletLogin.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ethers } from 'ethers';
import api from '@/lib/api';
import { initializeSocket } from '@/lib/socket';

export default function WalletLogin() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask!');
      return;
    }

    setLoading(true);

    try {
      // Request account access
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      // Step 1: Get nonce
      const nonceResponse = await api.post('/auth/wallet/nonce', {
        walletAddress: address,
      });

      const { message } = nonceResponse.data.data;

      // Step 2: Sign message
      const signature = await signer.signMessage(message);

      // Step 3: Login with signature
      const loginResponse = await api.post('/auth/wallet/login', {
        walletAddress: address,
        signature,
      });

      // Store token
      localStorage.setItem('eduverse_token', loginResponse.data.token);
      localStorage.setItem('eduverse_user', JSON.stringify(loginResponse.data.data));

      // Initialize Socket.IO
      initializeSocket(loginResponse.data.token);

      router.push('/dashboard');
    } catch (error: any) {
      console.error('Wallet login error:', error);
      alert(error.response?.data?.message || 'Wallet login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={connectWallet}
      disabled={loading}
      className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 flex items-center justify-center gap-2"
    >
      {loading ? 'Connecting...' : '🦊 Connect with MetaMask'}
    </button>
  );
}
```

---

## 🏫 Classroom Integration

### Fetch Classrooms

Create `hooks/useClassrooms.ts`:

```typescript
import { useState, useEffect } from 'react';
import api from '@/lib/api';

export interface Classroom {
  _id: string;
  title: string;
  description: string;
  subject: string;
  owner: {
    name: string;
    avatarData: any;
  };
  currentStudentCount: number;
  maxStudents: number;
  thumbnail?: string;
}

export const useClassrooms = (filters?: any) => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const params = new URLSearchParams(filters).toString();
        const response = await api.get(`/classrooms?${params}`);
        setClassrooms(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch classrooms');
      } finally {
        setLoading(false);
      }
    };

    fetchClassrooms();
  }, [filters]);

  return { classrooms, loading, error };
};
```

### Join Classroom in 3D Scene

```typescript
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { getSocket } from '@/lib/socket';

export const joinClassroom = async (classroomId: string, avatarPosition: any) => {
  try {
    // Join via API
    await api.post(`/classrooms/${classroomId}/join`);

    // Join via Socket.IO for real-time
    const socket = getSocket();
    if (socket) {
      socket.emit('classroom:join', {
        classroomId,
        avatarPosition,
      });

      // Listen for other users
      socket.on('classroom:user-joined', (data) => {
        console.log('User joined:', data.user.name);
        // Add user avatar to 3D scene
      });

      socket.on('classroom:users-list', (data) => {
        console.log('Current users:', data.users);
        // Render all user avatars in 3D scene
      });
    }

    return true;
  } catch (error: any) {
    console.error('Join classroom error:', error);
    throw error;
  }
};
```

---

## 🎮 3D Avatar Movement Integration

### Sync Avatar Position

```typescript
import { getSocket } from '@/lib/socket';

export const updateAvatarPosition = (
  classroomId: string,
  position: { x: number; y: number; z: number },
  rotation: { x: number; y: number; z: number }
) => {
  const socket = getSocket();
  if (!socket) return;

  // Throttle updates (send max 10 times per second)
  socket.emit('avatar:move', {
    classroomId,
    position,
    rotation,
  });
};

// Listen for other avatar movements
export const listenToAvatarMovements = (callback: (data: any) => void) => {
  const socket = getSocket();
  if (!socket) return;

  socket.on('avatar:moved', (data) => {
    // Update avatar position in 3D scene
    callback(data);
  });
};
```

### Three.js Integration Example

```typescript
import * as THREE from 'three';
import { updateAvatarPosition } from '@/lib/classroom';

// In your Three.js scene
const scene = new THREE.Scene();
const avatars = new Map();

// Update local avatar position
function onAvatarMove(position: THREE.Vector3, rotation: THREE.Euler) {
  // Update in 3D scene
  localAvatar.position.copy(position);
  localAvatar.rotation.copy(rotation);

  // Sync with backend
  updateAvatarPosition(
    currentClassroomId,
    { x: position.x, y: position.y, z: position.z },
    { x: rotation.x, y: rotation.y, z: rotation.z }
  );
}

// Listen for remote avatar movements
listenToAvatarMovements((data) => {
  const { userId, position, rotation } = data;
  
  let avatar = avatars.get(userId);
  if (!avatar) {
    // Create new avatar
    avatar = createAvatar(userId);
    avatars.set(userId, avatar);
    scene.add(avatar);
  }

  // Smooth movement with lerp
  avatar.position.lerp(
    new THREE.Vector3(position.x, position.y, position.z),
    0.1
  );
});
```

---

## 💬 Chat Integration

### Chat Component

```typescript
'use client';

import { useState, useEffect, useRef } from 'react';
import { getSocket } from '@/lib/socket';

interface Message {
  id: string;
  user: {
    name: string;
    avatarData: any;
  };
  message: string;
  timestamp: number;
}

export default function ClassroomChat({ classroomId }: { classroomId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Listen for messages
    socket.on('chat:message', (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    // Listen for typing
    socket.on('chat:typing', (data) => {
      if (data.isTyping) {
        setIsTyping((prev) => [...prev, data.userName]);
      } else {
        setIsTyping((prev) => prev.filter((name) => name !== data.userName));
      }
    });

    return () => {
      socket.off('chat:message');
      socket.off('chat:typing');
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const socket = getSocket();
    if (!socket) return;

    socket.emit('chat:message', {
      classroomId,
      message: input,
      type: 'text',
    });

    setInput('');
  };

  const handleTyping = (typing: boolean) => {
    const socket = getSocket();
    if (!socket) return;

    socket.emit('chat:typing', {
      classroomId,
      isTyping: typing,
    });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => (
          <div key={msg.id} className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
              {msg.user.name[0]}
            </div>
            <div>
              <div className="font-semibold text-sm">{msg.user.name}</div>
              <div className="text-gray-700">{msg.message}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicator */}
      {isTyping.length > 0 && (
        <div className="px-4 text-sm text-gray-500">
          {isTyping.join(', ')} {isTyping.length === 1 ? 'is' : 'are'} typing...
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => handleTyping(true)}
            onBlur={() => handleTyping(false)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border rounded-lg"
          />
          <button
            onClick={sendMessage}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 🤖 AI Tutor Integration

### AI Tutor Component

```typescript
'use client';

import { useState } from 'react';
import api from '@/lib/api';

export default function AITutor({ classroomId }: { classroomId?: string }) {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const askAI = async () => {
    if (!question.trim()) return;

    setLoading(true);
    try {
      const res = await api.post('/ai-tutor', {
        question,
        classroomId,
        context: {
          subject: 'Computer Science',
          difficulty: 'intermediate',
        },
      });

      setResponse(res.data.data.response);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to get AI response');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">🤖 AI Tutor</h2>
      
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask me anything about your course..."
        className="w-full h-32 p-4 border rounded-lg mb-4"
      />

      <button
        onClick={askAI}
        disabled={loading}
        className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700"
      >
        {loading ? 'Thinking...' : 'Ask AI Tutor'}
      </button>

      {response && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">AI Response:</h3>
          <div className="whitespace-pre-wrap">{response}</div>
        </div>
      )}
    </div>
  );
}
```

---

## 📝 Quiz Integration

### Take Quiz Component

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function TakeQuiz({ quizId }: { quizId: string }) {
  const [quiz, setQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    startQuiz();
  }, [quizId]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const startQuiz = async () => {
    try {
      const response = await api.post(`/quiz/${quizId}/start`);
      setQuiz(response.data.data);
      setTimeLeft(response.data.data.duration * 60);
      setAnswers(new Array(response.data.data.questions.length).fill(null));
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to start quiz');
    } finally {
      setLoading(false);
    }
  };

  const submitQuiz = async () => {
    try {
      const response = await api.post(`/quiz/${quizId}/submit`, {
        answers: answers.map((answer, index) => ({
          questionIndex: index,
          answer,
        })),
        startedAt: quiz.startedAt,
      });

      alert(`Score: ${response.data.data.score}%\nTokens Earned: ${response.data.data.tokensAwarded}`);
      router.push('/dashboard');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to submit quiz');
    }
  };

  if (loading) return <div>Loading quiz...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{quiz.title}</h1>
          <div className="text-xl font-semibold text-red-600">
            Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
        </div>

        <div className="space-y-6">
          {quiz.questions.map((q: any, index: number) => (
            <div key={index} className="border-b pb-6">
              <h3 className="font-semibold mb-3">
                {index + 1}. {q.question} ({q.points} points)
              </h3>

              {q.type === 'multiple-choice' && (
                <div className="space-y-2">
                  {q.options.map((option: string, optIndex: number) => (
                    <label key={optIndex} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={option}
                        checked={answers[index] === option}
                        onChange={(e) => {
                          const newAnswers = [...answers];
                          newAnswers[index] = e.target.value;
                          setAnswers(newAnswers);
                        }}
                        className="w-4 h-4"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {q.type === 'short-answer' && (
                <input
                  type="text"
                  value={answers[index] || ''}
                  onChange={(e) => {
                    const newAnswers = [...answers];
                    newAnswers[index] = e.target.value;
                    setAnswers(newAnswers);
                  }}
                  className="w-full px-4 py-2 border rounded"
                  placeholder="Your answer..."
                />
              )}
            </div>
          ))}
        </div>

        <button
          onClick={submitQuiz}
          className="mt-6 w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 text-lg font-semibold"
        >
          Submit Quiz
        </button>
      </div>
    </div>
  );
}
```

---

## 🌐 Environment Variables

Create `.env.local` in frontend root:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

For production:
```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
NEXT_PUBLIC_SOCKET_URL=https://your-backend.onrender.com
```

---

## ✅ Integration Checklist

- [ ] Install axios and socket.io-client
- [ ] Create API configuration file
- [ ] Create Socket.IO configuration
- [ ] Implement authentication (email + wallet)
- [ ] Connect classroom listing
- [ ] Integrate 3D avatar movements with Socket.IO
- [ ] Add chat functionality
- [ ] Integrate AI tutor
- [ ] Add quiz functionality
- [ ] Test all real-time features
- [ ] Configure environment variables
- [ ] Test with production backend

---

**Frontend Integration Complete! 🎉**

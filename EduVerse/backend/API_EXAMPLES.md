# 📚 EduVerse API - Complete Examples

Comprehensive examples for all EduVerse API endpoints with request/response samples.

---

## 🔐 Authentication APIs

### 1. Register New User

**Endpoint**: `POST /api/auth/register`

**Request**:
```json
{
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "password": "SecurePass123!",
  "role": "student"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "role": "student",
    "tokensEarned": 0,
    "avatarData": {
      "skinColor": "#FFD1A4",
      "hairStyle": "default",
      "hairColor": "#000000",
      "outfit": "casual"
    },
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Login with Email/Password

**Endpoint**: `POST /api/auth/login`

**Request**:
```json
{
  "email": "alice@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "role": "student",
    "tokensEarned": 150,
    "lastLogin": "2024-01-15T14:20:00.000Z"
  }
}
```

### 3. Get Wallet Nonce (Web3 Login - Step 1)

**Endpoint**: `POST /api/auth/wallet/nonce`

**Request**:
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "nonce": "847362",
    "message": "Welcome to EduVerse!\n\nSign this message to authenticate your wallet.\n\nWallet: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb\nNonce: 847362\n\nThis request will not trigger a blockchain transaction or cost any gas fees."
  }
}
```

### 4. Login with Wallet Signature (Web3 Login - Step 2)

**Endpoint**: `POST /api/auth/wallet/login`

**Request**:
```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "signature": "0x8f3d7c2a1b9e4f5d6c7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1b"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Wallet authentication successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "User_0x742d",
    "walletAddress": "0x742d35cc6634c0532925a3b844bc9e7595f0beb",
    "role": "student",
    "loginMethod": "wallet"
  }
}
```

### 5. Get Current User Profile

**Endpoint**: `GET /api/auth/me`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "walletAddress": "0x742d35cc6634c0532925a3b844bc9e7595f0beb",
    "role": "student",
    "tokensEarned": 150,
    "avatarData": {
      "skinColor": "#FFD1A4",
      "hairStyle": "ponytail",
      "hairColor": "#8B4513",
      "outfit": "uniform",
      "accessories": ["glasses", "backpack"]
    },
    "bio": "Passionate about blockchain and education",
    "institution": "Virtual University",
    "achievements": [
      {
        "title": "First Quiz Completed",
        "description": "Completed your first quiz",
        "earnedAt": "2024-01-10T12:00:00.000Z"
      }
    ],
    "classroomsJoined": [
      {
        "_id": "65a2b3c4d5e6f7g8h9i0j1k2",
        "title": "Introduction to Blockchain",
        "subject": "Computer Science"
      }
    ]
  }
}
```

---

## 🏫 Classroom APIs

### 6. Create Classroom (Educator Only)

**Endpoint**: `POST /api/classrooms/create`

**Headers**:
```
Authorization: Bearer <educator_token>
```

**Request**:
```json
{
  "title": "Advanced Smart Contracts",
  "description": "Deep dive into Solidity and smart contract development",
  "subject": "Computer Science",
  "accessType": "public",
  "maxStudents": 30,
  "schedule": [
    {
      "day": "Monday",
      "startTime": "14:00",
      "endTime": "16:00",
      "timezone": "UTC"
    },
    {
      "day": "Wednesday",
      "startTime": "14:00",
      "endTime": "16:00",
      "timezone": "UTC"
    }
  ],
  "mintNFT": true
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Classroom created successfully",
  "data": {
    "_id": "65a3b4c5d6e7f8g9h0i1j2k3",
    "title": "Advanced Smart Contracts",
    "description": "Deep dive into Solidity and smart contract development",
    "subject": "Computer Science",
    "owner": "65a1b2c3d4e5f6g7h8i9j0k1",
    "accessType": "public",
    "maxStudents": 30,
    "students": [],
    "nftId": "1705320000-65a3b4c5d6e7f8g9h0i1j2k3",
    "nftMetadataURI": "https://ipfs.io/ipfs/QmX...",
    "schedule": [...],
    "isActive": true,
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### 7. Get All Classrooms (with filters)

**Endpoint**: `GET /api/classrooms?subject=Computer Science&page=1&limit=10`

**Response** (200 OK):
```json
{
  "success": true,
  "count": 10,
  "total": 45,
  "totalPages": 5,
  "currentPage": 1,
  "data": [
    {
      "_id": "65a3b4c5d6e7f8g9h0i1j2k3",
      "title": "Advanced Smart Contracts",
      "description": "Deep dive into Solidity...",
      "subject": "Computer Science",
      "owner": {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
        "name": "Prof. Smith",
        "avatarData": {...}
      },
      "accessType": "public",
      "currentStudentCount": 15,
      "maxStudents": 30,
      "thumbnail": "https://...",
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### 8. Join Classroom

**Endpoint**: `POST /api/classrooms/:id/join`

**Headers**:
```
Authorization: Bearer <student_token>
```

**Request** (for private classrooms):
```json
{
  "accessToken": "abc123def456"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Successfully joined classroom",
  "data": {
    "_id": "65a3b4c5d6e7f8g9h0i1j2k3",
    "title": "Advanced Smart Contracts",
    "students": [
      {
        "user": "65a1b2c3d4e5f6g7h8i9j0k1",
        "joinedAt": "2024-01-15T11:00:00.000Z",
        "status": "active"
      }
    ]
  }
}
```

---

## 📝 Quiz APIs

### 9. Create Quiz

**Endpoint**: `POST /api/quiz/create`

**Headers**:
```
Authorization: Bearer <educator_token>
```

**Request**:
```json
{
  "title": "Blockchain Fundamentals Quiz",
  "description": "Test your knowledge of blockchain basics",
  "classroomId": "65a3b4c5d6e7f8g9h0i1j2k3",
  "questions": [
    {
      "question": "What is a blockchain?",
      "type": "multiple-choice",
      "options": [
        "A distributed ledger",
        "A centralized database",
        "A programming language",
        "A web browser"
      ],
      "correctAnswer": "A distributed ledger",
      "points": 10,
      "explanation": "A blockchain is a distributed ledger that records transactions across multiple computers.",
      "difficulty": "easy"
    },
    {
      "question": "What does 'immutable' mean in blockchain context?",
      "type": "short-answer",
      "correctAnswer": "cannot be changed",
      "points": 15,
      "difficulty": "medium"
    }
  ],
  "duration": 30,
  "passingScore": 70,
  "tokenReward": 50,
  "settings": {
    "shuffleQuestions": true,
    "shuffleOptions": true,
    "showCorrectAnswers": true,
    "allowMultipleAttempts": true,
    "maxAttempts": 3
  }
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Quiz created successfully",
  "data": {
    "_id": "65a4b5c6d7e8f9g0h1i2j3k4",
    "title": "Blockchain Fundamentals Quiz",
    "classroom": "65a3b4c5d6e7f8g9h0i1j2k3",
    "creator": "65a1b2c3d4e5f6g7h8i9j0k1",
    "totalPoints": 25,
    "duration": 30,
    "tokenReward": 50,
    "createdAt": "2024-01-15T12:00:00.000Z"
  }
}
```

### 10. Start Quiz

**Endpoint**: `POST /api/quiz/:id/start`

**Headers**:
```
Authorization: Bearer <student_token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "quizId": "65a4b5c6d7e8f9g0h1i2j3k4",
    "title": "Blockchain Fundamentals Quiz",
    "description": "Test your knowledge...",
    "duration": 30,
    "totalPoints": 25,
    "passingScore": 70,
    "questions": [
      {
        "index": 0,
        "question": "What is a blockchain?",
        "type": "multiple-choice",
        "options": ["A distributed ledger", "A centralized database", ...],
        "points": 10,
        "difficulty": "easy"
      }
    ],
    "startedAt": "2024-01-15T13:00:00.000Z"
  }
}
```

### 11. Submit Quiz

**Endpoint**: `POST /api/quiz/:id/submit`

**Headers**:
```
Authorization: Bearer <student_token>
```

**Request**:
```json
{
  "answers": [
    {
      "questionIndex": 0,
      "answer": "A distributed ledger"
    },
    {
      "questionIndex": 1,
      "answer": "cannot be changed"
    }
  ],
  "startedAt": "2024-01-15T13:00:00.000Z"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Quiz passed! Tokens awarded.",
  "data": {
    "score": 100,
    "pointsEarned": 25,
    "totalPoints": 25,
    "correctCount": 2,
    "totalQuestions": 2,
    "tokensAwarded": 55,
    "passed": true,
    "timeSpent": 15,
    "answers": [
      {
        "questionIndex": 0,
        "answer": "A distributed ledger",
        "isCorrect": true,
        "pointsEarned": 10,
        "correctAnswer": "A distributed ledger",
        "explanation": "A blockchain is a distributed ledger..."
      }
    ]
  }
}
```

### 12. Issue Certificate

**Endpoint**: `POST /api/quiz/:id/certificate`

**Headers**:
```
Authorization: Bearer <student_token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Certificate issued successfully",
  "data": {
    "certificateUrl": "https://ipfs.io/ipfs/QmY...",
    "ipfsHash": "QmY...",
    "certificate": {
      "type": "Proof of Learning Certificate",
      "recipient": {
        "name": "Alice Johnson",
        "walletAddress": "0x742d35cc...",
        "userId": "65a1b2c3d4e5f6g7h8i9j0k1"
      },
      "quiz": {
        "title": "Blockchain Fundamentals Quiz",
        "classroom": "Advanced Smart Contracts",
        "subject": "Computer Science"
      },
      "achievement": {
        "score": 100,
        "pointsEarned": 25,
        "totalPoints": 25,
        "completedAt": "2024-01-15T13:15:00.000Z",
        "tokensAwarded": 55
      },
      "certificateId": "EDUVERSE-1705327500-65a1b2c3d4e5f6g7h8i9j0k1",
      "issuedAt": "2024-01-15T13:15:00.000Z"
    }
  }
}
```

---

## 🤖 AI Tutor APIs

### 13. Ask AI Tutor

**Endpoint**: `POST /api/ai-tutor`

**Headers**:
```
Authorization: Bearer <token>
```

**Request**:
```json
{
  "question": "Can you explain how Proof of Stake consensus works?",
  "classroomId": "65a3b4c5d6e7f8g9h0i1j2k3",
  "context": {
    "subject": "Computer Science",
    "topic": "Blockchain Consensus",
    "difficulty": "intermediate"
  },
  "sessionId": "session_12345"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "interactionId": "65a5b6c7d8e9f0g1h2i3j4k5",
    "question": "Can you explain how Proof of Stake consensus works?",
    "response": "Proof of Stake (PoS) is a consensus mechanism where validators are chosen to create new blocks based on the amount of cryptocurrency they hold and are willing to 'stake' as collateral.\n\nKey concepts:\n\n1. **Validators**: Instead of miners, PoS uses validators who lock up their coins as stake.\n\n2. **Selection Process**: Validators are chosen to create blocks based on:\n   - Amount of stake\n   - Age of stake\n   - Randomization\n\n3. **Rewards**: Validators earn transaction fees and sometimes new coins for creating valid blocks.\n\n4. **Penalties**: If a validator acts maliciously, they can lose their staked coins (slashing).\n\n5. **Energy Efficiency**: PoS uses significantly less energy than Proof of Work since it doesn't require intensive computational work.\n\nPopular PoS blockchains include Ethereum 2.0, Cardano, and Polkadot.\n\nWould you like me to explain any specific aspect in more detail?",
    "metadata": {
      "tokensUsed": 245,
      "responseTime": 1523,
      "model": "gpt-4-turbo-preview"
    }
  }
}
```

### 14. Generate Quiz Questions with AI

**Endpoint**: `POST /api/ai-tutor/generate-quiz`

**Headers**:
```
Authorization: Bearer <educator_token>
```

**Request**:
```json
{
  "topic": "Smart Contract Security",
  "subject": "Computer Science",
  "difficulty": "hard",
  "questionCount": 3,
  "questionType": "multiple-choice"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Quiz questions generated successfully",
  "data": {
    "questions": [
      {
        "question": "What is a reentrancy attack in smart contracts?",
        "options": [
          "A type of DoS attack",
          "An attack where a function is called recursively before the first execution completes",
          "A network congestion issue",
          "A gas optimization technique"
        ],
        "correctAnswer": "An attack where a function is called recursively before the first execution completes",
        "explanation": "Reentrancy attacks exploit the ability to call a function multiple times before the initial execution completes, potentially draining funds.",
        "points": 5
      }
    ],
    "metadata": {
      "topic": "Smart Contract Security",
      "subject": "Computer Science",
      "difficulty": "hard",
      "tokensUsed": 387
    }
  }
}
```

---

## 📊 Attendance & Analytics APIs

### 15. Mark Attendance

**Endpoint**: `POST /api/attendance/mark`

**Headers**:
```
Authorization: Bearer <student_token>
```

**Request**:
```json
{
  "classroomId": "65a3b4c5d6e7f8g9h0i1j2k3",
  "session": "2024-01-15-morning",
  "verificationMethod": "wallet",
  "walletSignature": "0x...",
  "deviceInfo": {
    "userAgent": "Mozilla/5.0...",
    "platform": "Win32",
    "browser": "Chrome"
  }
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Attendance marked successfully",
  "data": {
    "_id": "65a6b7c8d9e0f1g2h3i4j5k6",
    "user": "65a1b2c3d4e5f6g7h8i9j0k1",
    "classroom": "65a3b4c5d6e7f8g9h0i1j2k3",
    "session": "2024-01-15-morning",
    "checkInTime": "2024-01-15T14:05:00.000Z",
    "status": "present",
    "verificationMethod": "wallet",
    "isVerified": true
  }
}
```

### 16. Get Leaderboard

**Endpoint**: `GET /api/analytics/leaderboard?type=tokens&limit=10`

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "user": {
        "id": "65a1b2c3d4e5f6g7h8i9j0k1",
        "name": "Alice Johnson",
        "avatarData": {...},
        "institution": "Virtual University"
      },
      "tokensEarned": 1250,
      "achievementCount": 15
    },
    {
      "rank": 2,
      "user": {
        "id": "65a2b3c4d5e6f7g8h9i0j1k2",
        "name": "Bob Smith",
        "avatarData": {...}
      },
      "tokensEarned": 980,
      "achievementCount": 12
    }
  ]
}
```

---

## 🔌 Socket.IO Events

### Connect to Socket.IO

```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your_jwt_token_here'
  }
});

socket.on('connect', () => {
  console.log('Connected to EduVerse');
});
```

### Join Classroom

```javascript
socket.emit('classroom:join', {
  classroomId: '65a3b4c5d6e7f8g9h0i1j2k3',
  avatarPosition: { x: 0, y: 0, z: 0 }
});

// Listen for other users
socket.on('classroom:user-joined', (data) => {
  console.log('User joined:', data.user.name);
});

// Receive current users list
socket.on('classroom:users-list', (data) => {
  console.log('Users in classroom:', data.users);
});
```

### Send Chat Message

```javascript
socket.emit('chat:message', {
  classroomId: '65a3b4c5d6e7f8g9h0i1j2k3',
  message: 'Hello everyone!',
  type: 'text'
});

// Receive messages
socket.on('chat:message', (data) => {
  console.log(`${data.user.name}: ${data.message}`);
});
```

### Update Avatar Position

```javascript
socket.emit('avatar:move', {
  classroomId: '65a3b4c5d6e7f8g9h0i1j2k3',
  position: { x: 10, y: 0, z: 5 },
  rotation: { x: 0, y: 90, z: 0 }
});

// Listen for other avatar movements
socket.on('avatar:moved', (data) => {
  console.log('Avatar moved:', data.userId, data.position);
});
```

---

## 🎯 Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Valid email is required",
      "value": "invalid-email"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Classroom not found"
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Server Error"
}
```

---

**Complete API Reference! 🎉**

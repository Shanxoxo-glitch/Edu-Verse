# 🎓 EduVerse Backend

> **Decentralized 3D Metaverse Campus Backend with Web3 Integration**

A professional, production-ready backend for EduVerse - a revolutionary educational platform combining 3D metaverse experiences with blockchain technology, AI tutoring, and gamified learning.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Server](#running-the-server)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Socket.IO Events](#socketio-events)
- [Web3 Integration](#web3-integration)
- [Security](#security)
- [Deployment](#deployment)
- [Testing](#testing)
- [Contributing](#contributing)

---

## ✨ Features

### 🔐 Authentication & User Management
- **Dual Authentication**: Email/password and Web3 wallet (MetaMask/WalletConnect)
- **JWT-based Sessions**: Secure token-based authentication
- **Wallet Signature Verification**: Cryptographic proof of wallet ownership
- **User Profiles**: Customizable avatars, bio, achievements

### 🏫 NFT Classroom Management
- **Create Classrooms**: Educators can create virtual classrooms
- **NFT Minting**: Optional NFT representation of classrooms
- **Access Control**: Public, private, or NFT-gated classrooms
- **Student Enrollment**: Join/leave classroom functionality
- **Materials Management**: Upload and share learning resources

### 🎮 Learning & Gamification
- **Interactive Quizzes**: Create and take quizzes with auto-grading
- **Token Rewards**: ERC-20 tokens for participation and achievements
- **Proof of Learning**: On-chain certificates stored on IPFS
- **Leaderboards**: Competitive rankings based on tokens and achievements
- **Achievements System**: Track student progress and milestones

### 🤖 AI Tutor Module
- **OpenAI Integration**: GPT-4 powered intelligent tutoring
- **Context-Aware Responses**: Adapts to subject, topic, and difficulty
- **Conversation History**: Maintains context across interactions
- **Quiz Generation**: AI-powered question creation
- **Study Suggestions**: Personalized learning recommendations
- **Feedback System**: Rate and improve AI responses

### 📊 Attendance & Analytics
- **Attendance Tracking**: Multiple verification methods (wallet, session, manual)
- **Real-time Stats**: Live attendance monitoring
- **Analytics Dashboard**: Comprehensive insights for educators
- **Engagement Metrics**: Track student participation and performance
- **Attendance Reports**: Detailed historical data

### 🔌 Real-Time Features (Socket.IO)
- **Live Classroom**: Real-time avatar movements and interactions
- **Chat System**: Text messaging with typing indicators
- **Voice/Video**: WebRTC signaling for peer-to-peer communication
- **Presentations**: Synchronized slide sharing
- **Quiz Sessions**: Live quiz events and progress tracking
- **Notifications**: Real-time alerts and updates

---

## 🛠 Tech Stack

### Core Technologies
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.IO
- **Authentication**: JWT, bcryptjs

### Web3 & Blockchain
- **Ethereum/Polygon**: ethers.js, web3.js
- **Smart Contracts**: ERC-721 (NFTs), ERC-20 (Tokens)
- **Storage**: IPFS (via ipfs-http-client)

### AI & ML
- **OpenAI API**: GPT-4 for intelligent tutoring
- **Natural Language Processing**: Context-aware responses

### Security & Validation
- **Helmet**: Security headers
- **express-rate-limit**: API rate limiting
- **express-validator**: Input validation
- **express-mongo-sanitize**: NoSQL injection prevention
- **xss-clean**: XSS attack prevention

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher) or **yarn**
- **MongoDB** (v6.0 or higher) - Local or Atlas
- **Git**

### Required API Keys & Services

1. **MongoDB**: Database connection string
2. **OpenAI API Key**: For AI tutor functionality
3. **Infura/Alchemy**: Ethereum/Polygon RPC endpoints
4. **IPFS**: Infura IPFS or Pinata credentials
5. **Wallet Private Key**: For smart contract interactions (testnet)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
cd Eduverse/backend
```

### 2. Install Dependencies

```bash
npm install
```

Or using yarn:

```bash
yarn install
```

### 3. Create Environment File

Copy the example environment file:

```bash
cp env.example .env
```

---

## ⚙️ Configuration

Edit the `.env` file with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
HOST=localhost

# MongoDB
MONGODB_URI=mongodb://localhost:27017/eduverse

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# Web3
POLYGON_TESTNET_RPC_URL=https://rpc-mumbai.maticvigil.com
PRIVATE_KEY=your_wallet_private_key
CHAIN_ID=80001

# Smart Contracts
NFT_CLASSROOM_CONTRACT=0x...
TOKEN_REWARD_CONTRACT=0x...

# IPFS
IPFS_HOST=ipfs.infura.io
IPFS_PORT=5001
IPFS_PROTOCOL=https
IPFS_PROJECT_ID=your_ipfs_project_id
IPFS_PROJECT_SECRET=your_ipfs_secret

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=1000

# Frontend
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

---

## 🏃 Running the Server

### Development Mode

```bash
npm run dev
```

This starts the server with nodemon for auto-restart on file changes.

### Production Mode

```bash
npm start
```

### Expected Output

```
╔════════════════════════════════════════════════════════╗
║                                                        ║
║            🎓 EduVerse Backend Server 🎓              ║
║                                                        ║
╚════════════════════════════════════════════════════════╝

🚀 Server running in development mode
📡 API Server: http://localhost:5000
🔌 Socket.IO: ws://localhost:5000
📚 API Docs: http://localhost:5000/api
💚 Health Check: http://localhost:5000/health

✅ MongoDB Connected: localhost
```

---

## 📖 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "walletAddress": "0x..." (optional),
  "role": "student"
}
```

#### Login with Email
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Wallet Nonce
```http
POST /api/auth/wallet/nonce
Content-Type: application/json

{
  "walletAddress": "0x..."
}
```

#### Login with Wallet
```http
POST /api/auth/wallet/login
Content-Type: application/json

{
  "walletAddress": "0x...",
  "signature": "0x..."
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Classroom Endpoints

#### Create Classroom
```http
POST /api/classrooms/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Introduction to Blockchain",
  "description": "Learn blockchain fundamentals",
  "subject": "Computer Science",
  "accessType": "public",
  "maxStudents": 50,
  "mintNFT": true
}
```

#### Get All Classrooms
```http
GET /api/classrooms?subject=Computer Science&page=1&limit=10
```

#### Join Classroom
```http
POST /api/classrooms/:id/join
Authorization: Bearer <token>
Content-Type: application/json

{
  "accessToken": "abc123" (for private classrooms)
}
```

### Quiz Endpoints

#### Create Quiz
```http
POST /api/quiz/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Blockchain Basics Quiz",
  "classroomId": "...",
  "questions": [
    {
      "question": "What is a blockchain?",
      "type": "multiple-choice",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "points": 10
    }
  ],
  "duration": 30,
  "tokenReward": 50
}
```

#### Start Quiz
```http
POST /api/quiz/:id/start
Authorization: Bearer <token>
```

#### Submit Quiz
```http
POST /api/quiz/:id/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "answers": [
    { "questionIndex": 0, "answer": "A" }
  ],
  "startedAt": "2024-01-01T00:00:00.000Z"
}
```

### AI Tutor Endpoints

#### Ask AI Tutor
```http
POST /api/ai-tutor
Authorization: Bearer <token>
Content-Type: application/json

{
  "question": "Explain blockchain consensus mechanisms",
  "classroomId": "..." (optional),
  "context": {
    "subject": "Computer Science",
    "topic": "Blockchain",
    "difficulty": "intermediate"
  }
}
```

#### Generate Quiz Questions
```http
POST /api/ai-tutor/generate-quiz
Authorization: Bearer <token>
Content-Type: application/json

{
  "topic": "Smart Contracts",
  "subject": "Computer Science",
  "difficulty": "medium",
  "questionCount": 5
}
```

### Attendance Endpoints

#### Mark Attendance
```http
POST /api/attendance/mark
Authorization: Bearer <token>
Content-Type: application/json

{
  "classroomId": "...",
  "session": "2024-01-01-morning",
  "verificationMethod": "wallet",
  "walletSignature": "0x..."
}
```

#### Get Attendance Stats
```http
GET /api/attendance/stats/:classroomId?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

### Analytics Endpoints

#### Get Leaderboard
```http
GET /api/analytics/leaderboard?type=tokens&limit=10
```

#### Get Dashboard Analytics
```http
GET /api/analytics/dashboard?classroomId=...&period=30
Authorization: Bearer <token>
```

---

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  walletAddress: String (unique),
  role: Enum ['student', 'educator', 'admin'],
  tokensEarned: Number,
  avatarData: Object,
  achievements: Array,
  classroomsJoined: [ObjectId],
  classroomsOwned: [ObjectId]
}
```

### Classroom Model
```javascript
{
  title: String,
  description: String,
  subject: String,
  nftId: String,
  owner: ObjectId (User),
  accessType: Enum ['public', 'private', 'nft-gated'],
  maxStudents: Number,
  students: Array,
  events: Array,
  materials: Array,
  quizzes: [ObjectId]
}
```

### Quiz Model
```javascript
{
  title: String,
  classroom: ObjectId,
  creator: ObjectId,
  questions: Array,
  duration: Number,
  tokenReward: Number,
  attempts: Array,
  stats: Object
}
```

---

## 🔌 Socket.IO Events

### Client → Server

#### Classroom Events
- `classroom:join` - Join a classroom
- `classroom:leave` - Leave a classroom
- `avatar:move` - Update avatar position
- `avatar:action` - Perform avatar action

#### Chat Events
- `chat:message` - Send message
- `chat:typing` - Typing indicator

#### Quiz Events
- `quiz:start` - Start quiz session
- `quiz:progress` - Update progress

#### Voice Events
- `voice:offer` - WebRTC offer
- `voice:answer` - WebRTC answer
- `voice:ice-candidate` - ICE candidate

### Server → Client

- `classroom:user-joined` - User joined classroom
- `classroom:user-left` - User left classroom
- `avatar:moved` - Avatar position updated
- `chat:message` - New message received
- `quiz:started` - Quiz session started
- `notification:received` - New notification

---

## 🌐 Web3 Integration

### Smart Contract Interactions

The backend interacts with three main smart contracts:

1. **NFT Classroom Contract (ERC-721)**
   - Mint classroom NFTs
   - Verify ownership for access control

2. **Token Reward Contract (ERC-20)**
   - Issue tokens for achievements
   - Track token balances

3. **Proof of Learning Contract**
   - Store certificate hashes
   - Verify credentials

### IPFS Integration

- **Metadata Storage**: Classroom and certificate metadata
- **Content Addressing**: Immutable content references
- **Decentralized Storage**: Resilient data persistence

---

## 🔒 Security

### Implemented Security Measures

1. **Authentication**
   - JWT with secure secret
   - Bcrypt password hashing (10 rounds)
   - Wallet signature verification

2. **Input Validation**
   - express-validator for all inputs
   - MongoDB sanitization
   - XSS protection

3. **Rate Limiting**
   - API rate limiting (100 req/15min)
   - Auth rate limiting (5 req/15min)
   - Per-route custom limits

4. **Headers**
   - Helmet.js security headers
   - CORS configuration
   - CSP policies

5. **Data Protection**
   - Environment variable encryption
   - Sensitive data exclusion from responses
   - Secure cookie settings

---

## 🚢 Deployment

### Deployment Options

#### 1. Vercel (Recommended for API)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### 2. Render
1. Connect GitHub repository
2. Set environment variables
3. Deploy as Web Service

#### 3. AWS EC2
```bash
# SSH into EC2 instance
ssh -i key.pem ubuntu@your-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup
git clone <repo>
cd backend
npm install
npm start
```

#### 4. Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Environment Variables for Production

Ensure all sensitive keys are set in your hosting platform's environment variables section.

---

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test Coverage
```bash
npm run test:coverage
```

### API Testing with Postman

Import the Postman collection (coming soon) for comprehensive API testing.

---

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ] (optional)
}
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Support

For support, email support@eduverse.io or join our Discord community.

---

## 🎯 Roadmap

- [ ] GraphQL API support
- [ ] Multi-chain support (Ethereum, Polygon, BSC)
- [ ] Advanced AI features (voice synthesis, image generation)
- [ ] Mobile app backend support
- [ ] Decentralized identity (DID) integration
- [ ] DAO governance for platform decisions

---

**Built with ❤️ by the EduVerse Team**

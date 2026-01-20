# 🚀 EduVerse Backend - Quick Start Guide

Get your EduVerse backend up and running in 5 minutes!

---

## ⚡ Quick Setup (5 Steps)

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Setup MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB (if not installed)
# Windows: Download from mongodb.com
# Mac: brew install mongodb-community
# Linux: sudo apt-get install mongodb

# Start MongoDB
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Get connection string
4. Use in `.env` file

### Step 3: Configure Environment

```bash
# Copy example env file
cp env.example .env

# Edit .env with your values
```

**Minimum Required Configuration:**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/eduverse
JWT_SECRET=your_random_secret_key_here
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

**Optional (for full features):**
```env
# OpenAI (for AI Tutor)
OPENAI_API_KEY=sk-your-key-here

# Web3 (for blockchain features)
POLYGON_TESTNET_RPC_URL=https://rpc-mumbai.maticvigil.com
PRIVATE_KEY=your_wallet_private_key

# IPFS (for decentralized storage)
IPFS_PROJECT_ID=your_ipfs_id
IPFS_PROJECT_SECRET=your_ipfs_secret
```

### Step 4: Start the Server

```bash
npm run dev
```

You should see:
```
╔════════════════════════════════════════════════════════╗
║            🎓 EduVerse Backend Server 🎓              ║
╚════════════════════════════════════════════════════════╝

🚀 Server running in development mode
📡 API Server: http://localhost:5000
✅ MongoDB Connected: localhost
```

### Step 5: Test the API

Open your browser or Postman:
```
http://localhost:5000/health
```

You should see:
```json
{
  "success": true,
  "message": "EduVerse Backend is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

---

## 🧪 Test the APIs

### 1. Register a User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Student",
    "email": "student@test.com",
    "password": "password123",
    "role": "student"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com",
    "password": "password123"
  }'
```

**Save the token from response!**

### 3. Get Profile

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Create a Classroom (Educator)

First, register an educator:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Teacher",
    "email": "teacher@test.com",
    "password": "password123",
    "role": "educator"
  }'
```

Then create classroom:
```bash
curl -X POST http://localhost:5000/api/classrooms/create \
  -H "Authorization: Bearer EDUCATOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introduction to Web3",
    "description": "Learn blockchain basics",
    "subject": "Computer Science",
    "accessType": "public",
    "maxStudents": 50
  }'
```

---

## 🔌 Test Socket.IO

Create a simple HTML file to test real-time features:

```html
<!DOCTYPE html>
<html>
<head>
    <title>EduVerse Socket Test</title>
    <script src="https://cdn.socket.io/4.6.0/socket.io.min.js"></script>
</head>
<body>
    <h1>EduVerse Socket.IO Test</h1>
    <div id="status">Connecting...</div>
    <script>
        const socket = io('http://localhost:5000', {
            auth: {
                token: 'YOUR_JWT_TOKEN_HERE'
            }
        });

        socket.on('connect', () => {
            document.getElementById('status').textContent = 'Connected!';
            console.log('Connected to EduVerse');
        });

        socket.on('users:online', (data) => {
            console.log('Online users:', data.count);
        });

        socket.on('disconnect', () => {
            document.getElementById('status').textContent = 'Disconnected';
        });
    </script>
</body>
</html>
```

---

## 🎯 Common Issues & Solutions

### Issue: MongoDB Connection Failed

**Solution:**
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB
mongod

# Or use MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eduverse
```

### Issue: Port Already in Use

**Solution:**
```bash
# Change port in .env
PORT=5001

# Or kill process using port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5000 | xargs kill -9
```

### Issue: JWT Secret Error

**Solution:**
```bash
# Generate a secure random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to .env
JWT_SECRET=<generated_secret>
```

### Issue: CORS Error

**Solution:**
```env
# In .env, add your frontend URL
CORS_ORIGIN=http://localhost:3000

# For multiple origins (comma-separated)
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

---

## 📚 Next Steps

1. **Explore API Documentation**: Visit `http://localhost:5000/api`

2. **Connect Frontend**: Update frontend API base URL to `http://localhost:5000/api`

3. **Setup Web3**: 
   - Get Polygon Mumbai testnet RPC from [Infura](https://infura.io) or [Alchemy](https://alchemy.com)
   - Create a testnet wallet and add private key to `.env`

4. **Enable AI Tutor**:
   - Get OpenAI API key from [platform.openai.com](https://platform.openai.com)
   - Add to `.env` as `OPENAI_API_KEY`

5. **Setup IPFS**:
   - Create account at [infura.io/product/ipfs](https://infura.io/product/ipfs)
   - Get project ID and secret
   - Add to `.env`

---

## 🛠️ Development Tips

### Auto-Restart on Changes
```bash
npm run dev
```

### View Logs
```bash
# Development logs are detailed
# Production logs are minimal

# Custom logging
console.log('Debug:', data);
```

### Database GUI Tools
- **MongoDB Compass**: Official MongoDB GUI
- **Robo 3T**: Lightweight MongoDB client
- **Studio 3T**: Advanced MongoDB IDE

### API Testing Tools
- **Postman**: Full-featured API client
- **Insomnia**: Simple REST client
- **Thunder Client**: VS Code extension

---

## 🎓 Learning Resources

- **Express.js**: [expressjs.com](https://expressjs.com)
- **MongoDB**: [mongodb.com/docs](https://www.mongodb.com/docs)
- **Socket.IO**: [socket.io/docs](https://socket.io/docs)
- **Web3.js**: [web3js.readthedocs.io](https://web3js.readthedocs.io)
- **Ethers.js**: [docs.ethers.org](https://docs.ethers.org)

---

## 💡 Pro Tips

1. **Use Environment Variables**: Never commit `.env` file
2. **Test with Postman**: Create collections for all endpoints
3. **Monitor Logs**: Watch console for errors
4. **Use Git Branches**: Create feature branches for development
5. **Database Backups**: Regularly backup MongoDB data

---

## 🆘 Get Help

- **Documentation**: Check `README.md` for detailed info
- **GitHub Issues**: Report bugs and request features
- **Discord**: Join our community (coming soon)
- **Email**: support@eduverse.io

---

**Happy Coding! 🚀**

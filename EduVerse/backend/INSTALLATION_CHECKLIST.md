# ✅ EduVerse Backend - Installation Checklist

Complete step-by-step checklist to get your backend running.

---

## 📋 Pre-Installation Requirements

### System Requirements
- [ ] Node.js v18.0.0 or higher installed
- [ ] npm v9.0.0 or higher installed
- [ ] Git installed
- [ ] Code editor (VS Code recommended)
- [ ] Terminal/Command Prompt access

### Verify Installation
```bash
node --version    # Should show v18.x.x or higher
npm --version     # Should show v9.x.x or higher
git --version     # Should show git version
```

---

## 🗄️ Database Setup

### Option A: Local MongoDB
- [ ] Download MongoDB from [mongodb.com/download-center/community](https://www.mongodb.com/try/download/community)
- [ ] Install MongoDB on your system
- [ ] Start MongoDB service
  ```bash
  # Windows
  net start MongoDB
  
  # Mac
  brew services start mongodb-community
  
  # Linux
  sudo systemctl start mongod
  ```
- [ ] Verify MongoDB is running
  ```bash
  mongosh
  # Should connect successfully
  ```

### Option B: MongoDB Atlas (Cloud - Recommended)
- [ ] Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
- [ ] Create free account
- [ ] Create new cluster (M0 Free tier)
- [ ] Create database user
- [ ] Whitelist IP address (0.0.0.0/0 for development)
- [ ] Get connection string
- [ ] Save connection string for later

---

## 📦 Backend Installation

### Step 1: Navigate to Backend Directory
```bash
cd f:/Eduverse/backend
```
- [ ] Confirmed in backend directory

### Step 2: Install Dependencies
```bash
npm install
```
- [ ] All dependencies installed successfully
- [ ] No error messages
- [ ] `node_modules` folder created

### Step 3: Create Environment File
```bash
# Copy example file
cp env.example .env

# Or manually create .env file
```
- [ ] `.env` file created in backend root

### Step 4: Configure Environment Variables

Edit `.env` file with your values:

#### Essential Configuration (Required)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/eduverse
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

- [ ] `NODE_ENV` set
- [ ] `PORT` set (5000 recommended)
- [ ] `MONGODB_URI` configured (local or Atlas)
- [ ] `JWT_SECRET` set (use strong random string)
- [ ] `FRONTEND_URL` set
- [ ] `CORS_ORIGIN` set

#### Generate Strong JWT Secret
```bash
# Run this command to generate a secure secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
- [ ] JWT secret generated and added to `.env`

#### Optional Configuration (For Full Features)

**OpenAI (AI Tutor)**
```env
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=1000
```
- [ ] OpenAI API key obtained from [platform.openai.com](https://platform.openai.com)
- [ ] Added to `.env` file

**Web3/Blockchain**
```env
POLYGON_TESTNET_RPC_URL=https://rpc-mumbai.maticvigil.com
PRIVATE_KEY=your_wallet_private_key_for_testnet
CHAIN_ID=80001
NFT_CLASSROOM_CONTRACT=0x...
TOKEN_REWARD_CONTRACT=0x...
```
- [ ] RPC URL configured (Infura/Alchemy)
- [ ] Testnet wallet private key added
- [ ] Contract addresses configured (if deployed)

**IPFS (Decentralized Storage)**
```env
IPFS_HOST=ipfs.infura.io
IPFS_PORT=5001
IPFS_PROTOCOL=https
IPFS_PROJECT_ID=your_ipfs_project_id
IPFS_PROJECT_SECRET=your_ipfs_project_secret
```
- [ ] IPFS account created at [infura.io](https://infura.io)
- [ ] Project ID and secret obtained
- [ ] Added to `.env` file

---

## 🚀 Start the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```
- [ ] Server started successfully
- [ ] No error messages
- [ ] MongoDB connected message appears
- [ ] Server running message appears

### Expected Output
```
╔════════════════════════════════════════════════════════╗
║            🎓 EduVerse Backend Server 🎓              ║
╚════════════════════════════════════════════════════════╝

🚀 Server running in development mode
📡 API Server: http://localhost:5000
🔌 Socket.IO: ws://localhost:5000
✅ MongoDB Connected: localhost
```

- [ ] All startup messages displayed
- [ ] No errors in console

---

## 🧪 Test the Installation

### Test 1: Health Check
```bash
curl http://localhost:5000/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "EduVerse Backend is running",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "environment": "development"
}
```
- [ ] Health check returns success

### Test 2: API Documentation
Open browser: `http://localhost:5000/api`
- [ ] API documentation loads
- [ ] Shows all endpoint categories

### Test 3: Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "student"
  }'
```
- [ ] User registration successful
- [ ] Token received in response

### Test 4: Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```
- [ ] Login successful
- [ ] Token received

### Test 5: Get Profile (with token)
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
- [ ] Profile data received
- [ ] User information correct

---

## 🔌 Test Socket.IO Connection

Create a test HTML file:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Socket.IO Test</title>
    <script src="https://cdn.socket.io/4.6.0/socket.io.min.js"></script>
</head>
<body>
    <h1>Socket.IO Connection Test</h1>
    <div id="status">Connecting...</div>
    <script>
        const socket = io('http://localhost:5000', {
            auth: { token: 'YOUR_TOKEN_HERE' }
        });
        
        socket.on('connect', () => {
            document.getElementById('status').textContent = '✅ Connected!';
            console.log('Connected to EduVerse');
        });
        
        socket.on('disconnect', () => {
            document.getElementById('status').textContent = '❌ Disconnected';
        });
    </script>
</body>
</html>
```
- [ ] Socket.IO connects successfully
- [ ] "Connected!" message appears

---

## 🗄️ Verify Database

### Check MongoDB Collections
```bash
# Connect to MongoDB
mongosh

# Use eduverse database
use eduverse

# Show collections
show collections

# Should show: users, classrooms, quizzes, attendances, aiinteractions
```
- [ ] Database created
- [ ] Collections visible after first API calls

---

## 🔧 Troubleshooting

### Issue: Port Already in Use
**Solution:**
```bash
# Change port in .env
PORT=5001

# Or kill process on port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:5000 | xargs kill -9
```
- [ ] Port issue resolved

### Issue: MongoDB Connection Failed
**Solution:**
- [ ] Verify MongoDB is running
- [ ] Check connection string in `.env`
- [ ] Check network connectivity (for Atlas)
- [ ] Verify IP whitelist (for Atlas)

### Issue: Module Not Found
**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```
- [ ] Dependencies reinstalled

### Issue: JWT Error
**Solution:**
- [ ] Verify JWT_SECRET is set in `.env`
- [ ] Ensure JWT_SECRET is at least 32 characters
- [ ] Restart server after changing `.env`

---

## 📱 Optional: Install Development Tools

### MongoDB Compass (GUI for MongoDB)
- [ ] Download from [mongodb.com/products/compass](https://www.mongodb.com/products/compass)
- [ ] Install and connect to your database
- [ ] View collections and documents

### Postman (API Testing)
- [ ] Download from [postman.com](https://www.postman.com/downloads/)
- [ ] Import API collection (create from API_EXAMPLES.md)
- [ ] Test all endpoints

### VS Code Extensions
- [ ] REST Client
- [ ] MongoDB for VS Code
- [ ] Thunder Client
- [ ] ESLint

---

## 🎯 Final Verification Checklist

### Backend
- [ ] Server starts without errors
- [ ] MongoDB connects successfully
- [ ] Health check endpoint works
- [ ] User registration works
- [ ] User login works
- [ ] Protected routes require authentication
- [ ] Socket.IO connects successfully

### Configuration
- [ ] All required environment variables set
- [ ] JWT secret is secure
- [ ] Database connection string correct
- [ ] CORS origins configured
- [ ] Port is available

### Optional Features
- [ ] OpenAI API key configured (if using AI tutor)
- [ ] Web3 RPC configured (if using blockchain)
- [ ] IPFS configured (if using decentralized storage)

### Documentation
- [ ] README.md reviewed
- [ ] QUICKSTART.md followed
- [ ] API_EXAMPLES.md available for reference
- [ ] FRONTEND_INTEGRATION.md ready for frontend team

---

## ✅ Installation Complete!

If all checkboxes are marked, your EduVerse backend is ready!

### Next Steps:
1. **Test All APIs**: Use Postman or curl to test endpoints
2. **Connect Frontend**: Follow FRONTEND_INTEGRATION.md
3. **Deploy**: When ready, follow DEPLOYMENT.md
4. **Monitor**: Set up logging and monitoring

---

## 📞 Need Help?

- **Documentation**: Check README.md
- **Quick Start**: QUICKSTART.md
- **API Examples**: API_EXAMPLES.md
- **Deployment**: DEPLOYMENT.md
- **Frontend**: FRONTEND_INTEGRATION.md

---

**Installation Status: ✅ COMPLETE**

Your EduVerse backend is now running and ready for development! 🎉

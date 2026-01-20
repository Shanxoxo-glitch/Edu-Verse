# 🚢 EduVerse Backend - Deployment Guide

Complete guide for deploying EduVerse backend to production.

---

## 📋 Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] MongoDB production database ready
- [ ] OpenAI API key obtained (if using AI features)
- [ ] Web3 RPC endpoints configured
- [ ] IPFS credentials set up
- [ ] Domain name purchased (optional)
- [ ] SSL certificate ready (for custom domains)
- [ ] Frontend CORS origins configured
- [ ] Rate limits adjusted for production
- [ ] Error logging configured

---

## 🌐 Deployment Options

### Option 1: Render (Recommended - Easy & Free Tier)

#### Step 1: Prepare Repository
```bash
# Ensure your code is pushed to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### Step 2: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +" → "Web Service"

#### Step 3: Configure Service
- **Repository**: Select your EduVerse repo
- **Branch**: main
- **Root Directory**: backend
- **Environment**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: Free (or paid for better performance)

#### Step 4: Add Environment Variables
In Render dashboard, add all variables from `.env`:
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
OPENAI_API_KEY=...
POLYGON_RPC_URL=...
FRONTEND_URL=https://your-frontend.vercel.app
CORS_ORIGIN=https://your-frontend.vercel.app
```

#### Step 5: Deploy
- Click "Create Web Service"
- Wait for deployment (5-10 minutes)
- Your API will be live at: `https://your-app.onrender.com`

---

### Option 2: Vercel (Serverless)

#### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

#### Step 2: Create vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### Step 3: Deploy
```bash
cd backend
vercel --prod
```

#### Step 4: Set Environment Variables
```bash
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add OPENAI_API_KEY
# ... add all other variables
```

**Note**: Socket.IO may have limitations on Vercel serverless. Consider Render for full Socket.IO support.

---

### Option 3: AWS EC2 (Full Control)

#### Step 1: Launch EC2 Instance
1. Go to AWS Console → EC2
2. Launch Instance
   - **AMI**: Ubuntu Server 22.04 LTS
   - **Instance Type**: t2.micro (free tier) or t2.small
   - **Security Group**: Allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS), 5000 (API)

#### Step 2: Connect to Instance
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

#### Step 3: Install Node.js
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### Step 4: Install MongoDB (Optional - if not using Atlas)
```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### Step 5: Clone and Setup Application
```bash
# Install Git
sudo apt-get install git -y

# Clone repository
git clone https://github.com/your-username/eduverse.git
cd eduverse/backend

# Install dependencies
npm install --production

# Create .env file
nano .env
# Paste your environment variables
```

#### Step 6: Install PM2 (Process Manager)
```bash
sudo npm install -g pm2

# Start application
pm2 start src/server.js --name eduverse-backend

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

#### Step 7: Setup Nginx (Reverse Proxy)
```bash
# Install Nginx
sudo apt-get install nginx -y

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/eduverse
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Socket.IO support
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/eduverse /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 8: Setup SSL with Let's Encrypt
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
```

---

### Option 4: Heroku

#### Step 1: Install Heroku CLI
```bash
npm install -g heroku
```

#### Step 2: Login and Create App
```bash
heroku login
heroku create eduverse-backend
```

#### Step 3: Add Procfile
Create `Procfile` in backend directory:
```
web: node src/server.js
```

#### Step 4: Set Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=mongodb+srv://...
heroku config:set JWT_SECRET=...
# ... set all other variables
```

#### Step 5: Deploy
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

---

### Option 5: Docker + Any Cloud

#### Step 1: Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["npm", "start"]
```

#### Step 2: Create .dockerignore
```
node_modules
npm-debug.log
.env
.git
.gitignore
README.md
```

#### Step 3: Build and Run
```bash
# Build image
docker build -t eduverse-backend .

# Run container
docker run -d \
  -p 5000:5000 \
  --env-file .env \
  --name eduverse-backend \
  eduverse-backend
```

#### Step 4: Deploy to Cloud
- **AWS ECS**: Upload to ECR and deploy
- **Google Cloud Run**: `gcloud run deploy`
- **Azure Container Instances**: Deploy via Azure Portal
- **DigitalOcean App Platform**: Connect GitHub repo

---

## 🔒 Production Security Checklist

### Environment Variables
- [ ] Use strong JWT secret (32+ characters)
- [ ] Use production MongoDB URI
- [ ] Never commit `.env` file
- [ ] Rotate secrets regularly

### Database Security
- [ ] Enable MongoDB authentication
- [ ] Use IP whitelist
- [ ] Enable SSL/TLS connections
- [ ] Regular backups configured

### API Security
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Helmet security headers active
- [ ] Input validation on all routes
- [ ] SQL/NoSQL injection prevention

### Monitoring
- [ ] Error logging (Sentry, LogRocket)
- [ ] Performance monitoring (New Relic, DataDog)
- [ ] Uptime monitoring (UptimeRobot, Pingdom)
- [ ] Database monitoring

---

## 📊 Post-Deployment Monitoring

### Health Checks
```bash
# Check if server is running
curl https://your-api.com/health

# Check database connection
curl https://your-api.com/api

# Monitor response times
curl -w "@curl-format.txt" -o /dev/null -s https://your-api.com/api
```

### Logging Services
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **Papertrail**: Log aggregation
- **CloudWatch**: AWS logging

### Performance Monitoring
- **New Relic**: APM
- **DataDog**: Infrastructure monitoring
- **Grafana**: Custom dashboards

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: |
        cd backend
        npm ci
    
    - name: Run tests
      run: |
        cd backend
        npm test
    
    - name: Deploy to Render
      env:
        RENDER_API_KEY: ${{ secrets.RENDER_API_KEY }}
      run: |
        curl -X POST https://api.render.com/deploy/srv-xxx
```

---

## 🌍 Domain Configuration

### Custom Domain Setup

1. **Purchase Domain**: Namecheap, GoDaddy, Google Domains

2. **DNS Configuration**:
```
Type    Name    Value
A       @       your-server-ip
A       www     your-server-ip
CNAME   api     your-app.onrender.com
```

3. **Update Environment Variables**:
```env
FRONTEND_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
```

---

## 📈 Scaling Strategies

### Horizontal Scaling
- Use load balancer (AWS ALB, Nginx)
- Deploy multiple instances
- Session management with Redis

### Vertical Scaling
- Upgrade server resources
- Optimize database queries
- Enable caching (Redis)

### Database Scaling
- MongoDB Atlas auto-scaling
- Read replicas
- Sharding for large datasets

---

## 🆘 Troubleshooting

### Server Won't Start
```bash
# Check logs
pm2 logs eduverse-backend

# Check port availability
netstat -tulpn | grep 5000

# Verify environment variables
printenv | grep MONGODB_URI
```

### Database Connection Issues
```bash
# Test MongoDB connection
mongosh "mongodb+srv://..."

# Check network access
ping your-mongodb-host
```

### High Memory Usage
```bash
# Monitor with PM2
pm2 monit

# Restart application
pm2 restart eduverse-backend
```

---

## 📞 Support

- **Documentation**: Check README.md
- **Issues**: GitHub Issues
- **Email**: support@eduverse.io

---

**Deployment Complete! 🎉**

# Deployment Guide

This guide covers deploying the Inventory Management Dashboard to various platforms.

## Prerequisites

- Node.js 16+ installed
- MongoDB database (local or cloud)
- Git repository access
- Domain name (for production)

## Environment Variables

Create the following environment files:

### Backend (.env)
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/inventory_management

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=production

# Frontend URL (for CORS)
FRONTEND_URL=https://your-domain.com

# Email (optional - for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### Frontend (.env)
```bash
REACT_APP_API_URL=https://your-api-domain.com/api
```

## Local Development

1. **Clone and Install Dependencies**
```bash
git clone <repository-url>
cd inventory-management-dashboard

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

2. **Set up Database**
```bash
# Start MongoDB (if using local installation)
mongod

# Create admin user and seed data
npm run create-admin
npm run seed
```

3. **Start Development Servers**
```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
npm start
```

## Production Deployment

### Option 1: Traditional VPS/Server

1. **Server Setup**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

2. **Deploy Application**
```bash
# Clone repository
git clone <repository-url>
cd inventory-management-dashboard

# Install dependencies
npm install
cd backend && npm install && cd ..

# Build frontend
npm run build

# Set up environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with production values

# Start backend with PM2
cd backend
pm2 start server.js --name "inventory-api"
pm2 startup
pm2 save
```

3. **Configure Nginx**
```nginx
# /etc/nginx/sites-available/inventory-dashboard
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/inventory-management-dashboard/build;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/inventory-dashboard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Set up SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

### Option 2: Docker Deployment

1. **Create Dockerfile for Backend**
```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

2. **Create Dockerfile for Frontend**
```dockerfile
# Dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

3. **Docker Compose**
```yaml
# docker-compose.yml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    container_name: inventory_mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password123
    volumes:
      - mongodb_data:/data/db
    ports:
      - "27017:27017"

  backend:
    build: ./backend
    container_name: inventory_backend
    restart: unless-stopped
    environment:
      MONGODB_URI: mongodb://admin:password123@mongodb:27017/inventory_management?authSource=admin
      JWT_SECRET: your_super_secret_jwt_key_here_min_32_chars
      NODE_ENV: production
    depends_on:
      - mongodb
    ports:
      - "5000:5000"

  frontend:
    build: .
    container_name: inventory_frontend
    restart: unless-stopped
    environment:
      REACT_APP_API_URL: http://localhost:5000/api
    depends_on:
      - backend
    ports:
      - "80:80"

volumes:
  mongodb_data:
```

```bash
# Deploy with Docker Compose
docker-compose up -d

# Initialize database
docker-compose exec backend npm run create-admin
docker-compose exec backend npm run seed
```

### Option 3: Cloud Platforms

#### Heroku Deployment

1. **Prepare for Heroku**
```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create apps
heroku create your-app-name-api
heroku create your-app-name-frontend
```

2. **Deploy Backend**
```bash
cd backend

# Set environment variables
heroku config:set MONGODB_URI=your_mongodb_atlas_uri --app your-app-name-api
heroku config:set JWT_SECRET=your_jwt_secret --app your-app-name-api
heroku config:set NODE_ENV=production --app your-app-name-api

# Deploy
git init
git add .
git commit -m "Initial commit"
heroku git:remote -a your-app-name-api
git push heroku main
```

3. **Deploy Frontend**
```bash
cd ..

# Set build pack
heroku buildpacks:set mars/create-react-app --app your-app-name-frontend

# Set environment variables
heroku config:set REACT_APP_API_URL=https://your-app-name-api.herokuapp.com/api --app your-app-name-frontend

# Deploy
git init
git add .
git commit -m "Initial commit"
heroku git:remote -a your-app-name-frontend
git push heroku main
```

#### Vercel + Railway

1. **Deploy Backend to Railway**
- Connect GitHub repository to Railway
- Set environment variables in Railway dashboard
- Deploy automatically on push

2. **Deploy Frontend to Vercel**
- Connect GitHub repository to Vercel
- Set `REACT_APP_API_URL` environment variable
- Deploy automatically on push

## Database Setup

### MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Create database user
4. Whitelist IP addresses
5. Get connection string
6. Update `MONGODB_URI` in environment variables

### Local MongoDB

```bash
# Install MongoDB
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS
brew install mongodb-community

# Start MongoDB
sudo systemctl start mongod

# Enable auto-start
sudo systemctl enable mongod
```

## SSL Certificate

### Let's Encrypt (Free)
```bash
sudo certbot --nginx -d your-domain.com
```

### Cloudflare (Free)
1. Add domain to Cloudflare
2. Update nameservers
3. Enable SSL/TLS encryption

## Monitoring and Maintenance

### PM2 Monitoring
```bash
# View logs
pm2 logs inventory-api

# Monitor processes
pm2 monit

# Restart application
pm2 restart inventory-api

# Update application
git pull
npm install
pm2 restart inventory-api
```

### Database Backup
```bash
# Create backup
mongodump --uri="mongodb://localhost:27017/inventory_management" --out=/backup/$(date +%Y%m%d)

# Restore backup
mongorestore --uri="mongodb://localhost:27017/inventory_management" /backup/20240115
```

## Security Checklist

- [ ] Use strong JWT secret (32+ characters)
- [ ] Enable HTTPS/SSL
- [ ] Set up firewall rules
- [ ] Use environment variables for secrets
- [ ] Enable MongoDB authentication
- [ ] Regular security updates
- [ ] Monitor application logs
- [ ] Set up automated backups
- [ ] Use rate limiting
- [ ] Validate all inputs

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check `FRONTEND_URL` in backend environment
   - Verify API URL in frontend environment

2. **Database Connection**
   - Check MongoDB URI format
   - Verify network connectivity
   - Check authentication credentials

3. **Build Failures**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify environment variables

4. **Performance Issues**
   - Enable MongoDB indexing
   - Implement caching
   - Optimize database queries
   - Use CDN for static assets

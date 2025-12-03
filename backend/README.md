# Backend - Railway Deployment

## Environment Variables Required

Railway dashboard में निम्नलिखित environment variables set करें:

### Database Configuration
```
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
DB_PORT=3306
```

### Server Configuration
```
PORT=5000
NODE_ENV=production
```

### JWT Configuration
```
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
```

### Email Configuration (Optional - for OTP)
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
EMAIL_FROM=noreply@yourdomain.com
```

### Rate Limiting
```
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### CORS Configuration
```
CORS_ORIGINS=https://your-frontend-domain.vercel.app
```

**Note:** Frontend URL को comma-separated list में add कर सकते हैं:
```
CORS_ORIGINS=https://app1.vercel.app,https://app2.vercel.app
```

## Railway Deployment Steps

1. Railway dashboard में project create करें
2. GitHub repository connect करें
3. Root directory को `backend` set करें
4. Environment variables add करें
5. Deploy करें

## Health Check

Deploy के बाद health check endpoint:
```
GET https://your-backend.railway.app/health
```

Database connection test:
```
GET https://your-backend.railway.app/test-db
```


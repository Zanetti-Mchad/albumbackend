# Package Documentation

## Qualiworth School Management System API

This document provides comprehensive documentation of the `package.json` configuration for the Qualiworth School Management System API, a robust backend service built with Node.js and Express.

---

## 📦 Project Metadata

### Package Information

- **Name**: `@axoblade/qualiworth-hike-api`
  - Uses npm organization scope `@axoblade` for package management
  - Follows standard npm package naming conventions
  
- **Version**: `1.0.0`
  - Follows [Semantic Versioning 2.0.0](https://semver.org/)
  - Current production version
  
- **Description**: `"Qualiworth Hike API Service"`
  - Official backend API for Qualiworth School Management System
  - Handles authentication, academics, inventory, and more
  
- **Main**: `server.js`
  - Primary entry point for the application
  - Initializes the Express server and connects all middleware
  - Loads environment variables and database connections

---

## 🚀 NPM Scripts

Commands that can be executed using `npm run <script>`:

### Core Scripts

- **`npm start`** (`node src/server.js`)
  - Production server initialization
  - Loads environment variables and starts the Express application
  - Used in production environments and Docker containers
  - **Note**: Ensure all environment variables are properly configured

- **`npm run dev`** (`nodemon src/server.js`)
  - Development server with hot-reloading
  - Automatically restarts on file changes using Nodemon
  - Enables faster development iteration
  - **Tip**: Configure Nodemon watch patterns in `nodemon.json`

### Testing & Quality

- **`npm test`** (`jest`)
  - Runs the complete test suite using Jest
  - Executes all test files matching `*.test.js` pattern
  - Generates code coverage reports in `coverage/` directory
  - **Coverage**: Configure thresholds in `jest.config.js`

### Database Operations

- **`npm run resetdb`** (`node reset_db.js`)
  - Resets the database to a clean state
  - **WARNING**: This will delete all data in the database
  - Primarily used for development and testing
  - **Dependencies**: Requires database credentials in `.env`

### Prisma Commands

- **`npx prisma generate`**
  - Generates Prisma Client based on schema
  - Required after schema changes
  - Updates TypeScript types for database models

- **`npx prisma migrate dev`**
  - Creates and applies database migrations
  - Runs in development environment
  - **Note**: Always commit migration files to version control

- **`npx prisma migrate deploy`**
  - Applies pending migrations in production
  - Used in CI/CD pipelines
  - **Best Practice**: Run before starting the production server

- **`npx prisma studio`**
  - Launches Prisma Studio GUI
  - Visual database management interface
  - **Access**: Available at `http://localhost:5555` by default

---

## 🔗 Repository Information

### Git Repository

- **Type**: `git`
- **URL**: `git+https://github.com/axoblade/qualiworth-hike-api.git`
- **Issues**: `https://github.com/axoblade/qualiworth-hike-api/issues`
- **Homepage**: `https://github.com/axoblade/qualiworth-hike-api#readme`

### Project Metadata

- **Author**: `axoblade`
- **License**: `MIT` (Open source license)
- **Keywords**: `["Auth", "JWT", "2FA"]`
  - Used for npm registry discovery and search

---

## 📚 Production Dependencies

Essential packages required for the application to run in production environments:

### 🗄️ Database & ORM

- **`@prisma/client@^6.1.0`**
  - Type-safe database client for Node.js & TypeScript
  - Auto-generated query builder based on Prisma schema
  - Supports transactions, relations, and complex queries
  - **Key Features**:
    - Type-safe database access
    - Auto-completion in IDEs
    - Connection pooling

- **`prisma@^6.1.0`**
  - Prisma CLI for database management
  - Handles migrations and schema introspection
  - **Common Commands**:
    - `prisma generate`: Generate Prisma Client
    - `prisma migrate dev`: Create and apply migrations
    - `prisma studio`: Database GUI

- **`mysql2@^3.12.0`**
  - High-performance MySQL client for Node.js
  - Supports prepared statements and connection pooling
  - **Performance**: Up to 2x faster than `mysql` package

### 📱 Communication Services

#### SMS Services

- **`africastalking@^0.7.3`**
  - Africa's Talking API client
  - **Use Case**: Primary SMS service for Uganda region
  - **Features**:
    - Cost-effective local SMS delivery
    - Delivery reports
    - Bulk messaging support

- **`twilio@^5.7.0`**
  - Global SMS and voice communication API
  - **Use Case**: Fallback SMS service
  - **Features**:
    - Worldwide coverage
    - Advanced message tracking
    - Two-factor authentication

#### Email Service

- **`nodemailer@^6.10.1`**
  - Comprehensive email sending solution
  - **Features**:
    - Supports multiple transport methods (SMTP, Sendmail, etc.)
    - HTML and plain text emails
    - Embedded images and attachments
    - Secure email delivery with TLS/STARTTLS

### 🌐 Web Framework & Middleware

- **`express@^4.21.2`**
  - Fast, unopinionated web framework
  - **Key Features**:
    - Robust routing
    - Middleware support
    - Template engines
    - File uploads

- **`morgan@^1.10.0`**
  - HTTP request logger
  - **Formats**:
    - `combined`: Standard Apache combined log
    - `dev`: Colored response for development
    - `common`: Standard Apache common log

- **`express-validator@^7.2.0`**
  - Request validation middleware
  - **Features**:
    - Input sanitization
    - Custom validation
    - Asynchronous validation
    - Schema validation

### 📄 File Handling

- **`formidable@^3.5.4`**
  - File upload handling
  - **Features**:
    - Fast and streaming parser
    - Multiple file uploads
    - Progress events
    - File type validation

- **`xlsx@^0.18.5`**
  - Excel/Spreadsheet file processing
  - **Features**:
    - Read/write Excel files
    - CSV/JSON conversion
    - Formula calculation
    - Cell formatting

### 🔐 Authentication & Security

- **`bcrypt@^5.1.1`**
  - Password hashing
  - **Security Features**:
    - Salt generation
    - Adaptive hash algorithm
    - Protection against timing attacks

- **`jsonwebtoken@^9.0.2`**
  - JSON Web Token implementation
  - **Features**:
    - Token signing and verification
    - Expiration handling
    - Custom claims
    - Asymmetric key support

---

## 🛠️ Development Dependencies

Packages used during development and testing that are not required in production:

### 🌍 Environment Management

- **`dotenv@^16.4.7`**
  - Zero-dependency module for loading environment variables
  - **Key Features**:
    - Loads variables from `.env` into `process.env`
    - Supports variable expansion
    - No dependency on Node's `require`
  - **Usage**:
    ```javascript
    require('dotenv').config();
    console.log(process.env.DB_HOST);
    ```
  - **Best Practices**:
    - Never commit `.env` files to version control
    - Use `.env.example` as a template
    - Document all required environment variables

### 🧪 Testing Framework

- **`jest@^29.7.0`**
  - Delightful JavaScript Testing Framework
  - **Features**:
    - 🃏 Fast and parallel test execution
    - 🧩 Built-in code coverage reports
    - 🔄 Snapshot testing
    - 🎭 Mock functions and modules
  - **Configuration**:
    - Configured via `jest.config.js`
    - Supports TypeScript and Babel out of the box
    - Coverage thresholds can be set

- **`supertest@^7.0.0`**
  - HTTP assertions made easy
  - **Features**:
    - High-level abstraction for testing HTTP
    - Works with any test framework
    - Supports promises and async/await
  - **Example**:
    ```javascript
    const request = require('supertest');
    const app = require('../app');
    
    describe('GET /api/users', () => {
      it('responds with JSON', async () => {
        const response = await request(app)
          .get('/api/users')
          .expect('Content-Type', /json/)
          .expect(200);
      });
    });
    ```

### 🔧 Development Tools

- **`nodemon@^3.1.10`**
  - Simple monitor script for development
  - **Features**:
    - Automatic process restart on file changes
    - Configurable watch patterns
    - Delay restarting to handle multiple saves
  - **Configuration** (in `package.json` or `nodemon.json`):
    ```json
    {
      "watch": ["src/"],
      "ext": "js,json",
      "ignore": ["src/tests/"]
    }
    ```
  - **Usage**:
    ```bash
    # Basic usage
    nodemon src/server.js
    
    # With custom watch options
    nodemon --watch src --ext js,ts --exec npm start
    ```

---

## 🏗️ System Architecture

### Core Components

1. **API Layer**
   - **Express.js**: Lightweight web framework for building RESTful APIs
   - **RESTful Endpoints**: Resource-based routing following REST principles
   - **Middleware Pipeline**: Request processing with middleware functions
   - **Rate Limiting**: Protection against brute force attacks
   - **CORS**: Secure cross-origin resource sharing

2. **Data Access Layer**
   - **Prisma ORM**: Type-safe database client
   - **MySQL Database**: Relational database for structured data
   - **Migrations**: Version-controlled database schema changes
   - **Connection Pooling**: Efficient database connection management

3. **Authentication & Authorization**
   - **JWT (JSON Web Tokens)**: Stateless authentication
   - **Role-Based Access Control (RBAC)**: Fine-grained permissions
   - **Refresh Tokens**: Secure token rotation
   - **2FA Support**: Optional two-factor authentication

4. **Communication Services**
   - **Email (Nodemailer)**: Transactional and notification emails
   - **SMS (Africa's Talking + Twilio)**: Reliable message delivery
   - **WebSockets**: Real-time updates (future implementation)

### Application Flow

#### User Authentication
```mermaid
graph TD
    A[User Registration] --> B[Email Verification]
    B --> C[Login with Credentials]
    C --> D[2FA Code via Email/SMS]
    D --> E[Access Token + Refresh Token]
    E --> F[Access Protected Resources]
```

#### Data Flow
1. **Request Handling**
   - HTTP Request → Express Router → Middleware → Controller → Service → Database
   - Response flows back through the chain

2. **Error Handling**
   - Global error handler middleware
   - Structured error responses
   - Logging and monitoring

### Security Measures

- **Input Validation**: Sanitize and validate all user inputs
- **Rate Limiting**: Prevent abuse and DDoS attacks
- **Helmet Headers**: Secure HTTP headers
- **CSRF Protection**: Cross-Site Request Forgery prevention
- **CORS Configuration**: Controlled resource sharing
- **Secure Cookies**: HTTP-only and secure flags

### Performance Considerations

- **Caching Layer**: Redis for frequently accessed data (future)
- **Connection Pooling**: Efficient database connections
- **Compression**: Response compression for faster transfers
- **Query Optimization**: Indexed fields and optimized queries

### Monitoring & Logging

- **Winston Logger**: Structured logging
- **Request Logging**: HTTP request/response logging
- **Error Tracking**: Centralized error monitoring
- **Performance Metrics**: Response times and throughput

### Deployment Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │───▶│  API Servers    │───▶│   Database      │
└─────────────────┘    │  (Auto-scaled)  │    │   (MySQL)       │
                       └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │  Redis Cache    │    │  File Storage   │
                       │  (Future)       │    │  (If needed)    │
                       └─────────────────┘    └─────────────────┘
```

### Future Enhancements

1. **Microservices Architecture**: Split into smaller, focused services
2. **Message Queue**: For background job processing
3. **API Gateway**: For request routing and composition
4. **Containerization**: Docker and Kubernetes for orchestration
5. **Service Mesh**: For service-to-service communication

---

## 🔧 Version Management

All dependencies use caret (`^`) versioning:

- **Caret Range**: `^1.2.3` allows `>=1.2.3 <2.0.0`
- **Benefits**: Automatic minor and patch updates
- **Safety**: Major version changes require manual update

### Key Version Considerations

- **Prisma**: v6.x for latest ORM features
- **Express**: v4.x stable LTS version
- **Node.js**: Compatible with Node 16+ LTS versions

---

## 🚀 Deployment Guide

### System Requirements

- **Runtime**: Node.js 16+ LTS
- **Database**: MySQL 8.0+ or compatible
- **Memory**: Minimum 1GB RAM (2GB recommended)
- **Storage**: 10GB+ free disk space
- **Network**: Open ports (HTTP/80, HTTPS/443, MySQL/3306)

### Environment Configuration

#### Required Environment Variables

```env
# Application
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL="mysql://user:password@host:3306/db_name?connection_limit=5"

# JWT Configuration
JWT_SECRET="generate_a_strong_secret_here"
JWT_REFRESH_SECRET="another_strong_secret_here"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Email Configuration (Gmail SMTP)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-specific-password"
EMAIL_FROM=""Your App Name <noreply@yourdomain.com>""

# SMS Configuration (Africa's Talking)
AFRICASTALKING_API_KEY="your_api_key_here"
AFRICASTALKING_USERNAME="your_username"

# Twilio (Fallback)
TWILIO_ACCOUNT_SID="your_account_sid"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_PHONE_NUMBER="+1234567890"

# Security
RATE_LIMIT_WINDOW_MS=15*60*1000  # 15 minutes
RATE_LIMIT_MAX=100  # Limit each IP to 100 requests per window

# CORS
FRONTEND_URL="https://your-frontend-domain.com"
```

#### Optional Environment Variables

```env
# Logging
LOG_LEVEL="info"  # error, warn, info, debug, silly
ENABLE_REQUEST_LOGGING="true"

# Development
NODE_ENV="development"
DEBUG="app:*,prisma:*"

# File Uploads
MAX_FILE_SIZE="10"  # in MB
UPLOAD_DIR="./uploads"
```

### Deployment Steps

#### 1. Server Setup

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js (using nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install --lts

# Install MySQL
sudo apt install -y mysql-server
sudo mysql_secure_installation

# Install PM2 (Process Manager)
npm install -g pm2
```

#### 2. Application Deployment

```bash
# Clone the repository
git clone https://github.com/your-username/your-repo.git
cd your-repo

# Install dependencies
npm install --production

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
nano .env

# Run database migrations
npx prisma migrate deploy

# Build the application (if using TypeScript)
npm run build

# Start the application with PM2
pm2 start dist/server.js --name "your-app-name"

# Configure PM2 to start on system boot
pm2 startup
pm2 save
```

#### 3. Configure Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 4. Set Up SSL (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain and install certificate
sudo certbot --nginx -d your-domain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

### Monitoring and Maintenance

#### Logs

```bash
# View application logs
pm2 logs your-app-name

# View database logs
sudo tail -f /var/log/mysql/error.log
```

#### Backup Database

```bash
# Create backup
mysqldump -u username -p database_name > backup_$(date +%Y%m%d).sql

# Restore from backup
mysql -u username -p database_name < backup_file.sql
```

#### Performance Monitoring

```bash
# Monitor Node.js process
pm2 monit

# Check system resources
top
htop

# Monitor database queries (temporarily enable slow query log)
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;
```

### Scaling

#### Vertical Scaling
- Upgrade server resources (CPU, RAM)
- Optimize MySQL configuration
- Implement caching (Redis)

#### Horizontal Scaling
- Add more application instances behind a load balancer
- Set up read replicas for the database
- Use a managed database service

### Security Best Practices

1. **Regular Updates**
   - Keep Node.js and dependencies updated
   - Apply security patches promptly
   - Use `npm audit` to check for vulnerabilities

2. **Database Security**
   - Use strong passwords
   - Restrict database access by IP
   - Enable SSL for database connections

3. **Application Security**
   - Use HTTPS everywhere
   - Implement rate limiting
   - Sanitize all user inputs
   - Use security headers

4. **Backup Strategy**
   - Regular database backups
   - Off-site backup storage
   - Test restore procedures

### Troubleshooting

#### Common Issues

1. **Database Connection Issues**
   - Verify database credentials
   - Check if MySQL is running
   - Ensure the database user has proper permissions

2. **Port Conflicts**
   - Check if another process is using the port
   - Use `lsof -i :3000` to find the process

3. **Permission Issues**
   - Ensure the app has write access to required directories
   - Check file ownership with `ls -la`

#### Getting Help

- Check application logs: `pm2 logs`
- Check system logs: `journalctl -u your-service-name`
- Search GitHub issues
- Contact support with detailed error messages

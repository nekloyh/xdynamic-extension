# XDynamic Backend API

Backend API cho XDynamic - Chrome Extension lọc nội dung nguy hiểm bằng AI.

## 🚀 Quick Start

### Development (Local)

```bash
# 1. Đảm bảo có file .env
cp .env.example .env

# 2. Chạy backend
./start-local.sh

# 3. Truy cập
# API: http://localhost:8000
# Docs: http://localhost:8000/docs
```

### Production

```bash
# 1. Cấu hình production environment
cp .env.production.example .env.production
# Sau đó edit .env.production với thông tin thực

# 2. Deploy
./start-production.sh
```

## 📋 Requirements

- Docker & Docker Compose
- File model: `mobilenetv2_dangerous_objects.pth`
- File `.env` (local) hoặc `.env.production` (production)

## 🛠️ Commands

### Local Development

```bash
# Start
./start-local.sh

# Logs
docker compose logs -f backend

# Stop
docker compose down

# Restart
docker compose restart backend

# Rebuild
docker compose up -d --build
```

### Production

```bash
# Start (with Nginx)
./start-production.sh

# Logs
docker compose --profile production logs -f

# Stop
docker compose --profile production down

# Restart
docker compose --profile production restart
```

### Manual Docker Commands

```bash
# Build only
docker compose build

# Run without build
docker compose up -d

# View logs
docker compose logs backend -f

# Shell into container
docker compose exec backend bash

# Check health
curl http://localhost:8000/health
```

## 📁 Structure

```
backend/
├── app/                    # Application code
│   ├── api.py             # API router
│   ├── main.py            # FastAPI app
│   ├── database.py        # Database setup
│   ├── config/            # Settings
│   ├── controllers/       # API endpoints
│   ├── services/          # Business logic
│   ├── models/            # Database models
│   ├── repositories/      # Data access
│   └── schemas/           # Pydantic schemas
├── nginx/                 # Nginx config (production)
├── data/                  # SQLite database (created at runtime)
├── Dockerfile             # Docker image definition
├── docker-compose.yaml    # Compose configuration
├── requirements.txt       # Python dependencies
├── .env                   # Local environment
├── .env.production        # Production environment
└── mobilenetv2_dangerous_objects.pth  # AI model
```

## 🔧 Configuration

### Environment Variables

#### Required (App)
- `APP_NAME` - Application name
- `DEBUG` - Debug mode (true/false)
- `DATABASE_URL` - SQLite database path
- `JWT_SECRET_KEY` - Secret key for JWT (CHANGE IN PRODUCTION!)
- `MODEL_PATH` - Path to AI model file

#### Optional (OAuth)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth secret
- `GOOGLE_REDIRECT_URI` - OAuth callback URL

#### Optional (Payment)
- `MOMO_PARTNER_CODE` - MoMo partner code
- `MOMO_ACCESS_KEY` - MoMo access key
- `MOMO_SECRET_KEY` - MoMo secret key

### Ports

- **8000** - Backend API (local)
- **80** - HTTP (production with Nginx)
- **443** - HTTPS (production with Nginx)

## 🔍 Testing

```bash
# Health check
curl http://localhost:8000/health

# API Documentation
open http://localhost:8000/docs

# Register user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "full_name": "Test User"
  }'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234"
  }'
```

## 🐛 Troubleshooting

### Build fails

```bash
# Clear Docker cache
docker system prune -f
docker compose build --no-cache
```

### Port already in use

```bash
# Change port in .env
echo "API_PORT=8001" >> .env
docker compose up -d
```

### Database errors

```bash
# Delete and recreate database
docker compose down -v
docker compose up -d
```

### Permission errors

```bash
# Fix data directory permissions
sudo chown -R $USER:$USER data/
chmod 755 data/
```

## 📊 Production Checklist

- [ ] Set strong `JWT_SECRET_KEY` in `.env.production`
- [ ] Configure real Google OAuth credentials
- [ ] Configure real MoMo payment credentials
- [ ] Set `DEBUG=false`
- [ ] Configure SSL certificates
- [ ] Update domain in `nginx/conf.d/app.conf`
- [ ] Setup database backups
- [ ] Configure monitoring/logging
- [ ] Test all API endpoints
- [ ] Load test the application

## 📝 Notes

- Database: SQLite file stored in `./data/app.db`
- Model: PyTorch CPU version (no GPU required)
- Images: Multi-stage build for smaller image size (~500MB)
- Security: Non-root user in container
- Logs: Automatically rotated (max 10MB, 5 files)

## 🆘 Support

For issues or questions, check:
- API docs: http://localhost:8000/docs
- Health status: http://localhost:8000/health
- Container logs: `docker compose logs -f`

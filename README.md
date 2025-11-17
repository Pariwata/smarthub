# SmartHub - Law-Reg Change Intelligent System

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Python](https://img.shields.io/badge/python-3.11+-blue.svg)

An intelligent system for tracking, analyzing, and managing regulatory changes using AI-powered analysis.

## 🌟 Features

### Core Capabilities

- **Regulation Management** - Comprehensive CRUD operations for regulations
- **Version Control** - Automatic versioning of regulation changes
- **Change Detection** - Intelligent detection of changes between versions
- **AI-Powered Analysis** - LLM-based summarization and impact analysis
- **Risk Assessment** - Automated risk scoring for regulatory changes
- **Impact Analysis** - Business and compliance impact assessment
- **Smart Recommendations** - AI-generated actionable recommendations
- **Notifications** - Alert stakeholders about critical changes

### Technology Stack

- **Backend Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Search**: Elasticsearch 8
- **AI/ML**: OpenAI GPT-4 / Anthropic Claude
- **Task Queue**: Celery
- **Containerization**: Docker & Docker Compose

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Python 3.11+ (for local development)
- API keys for AI services (OpenAI or Anthropic)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/smarthub.git
cd smarthub
```

2. **Set up environment variables**

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and add your API keys:

```env
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
SECRET_KEY=your-secret-key
```

3. **Start the services**

```bash
docker-compose up -d
```

4. **Access the application**

- API Documentation: http://localhost:8000/docs
- Alternative Docs: http://localhost:8000/redoc
- API Endpoint: http://localhost:8000/api/v1

### Health Check

```bash
curl http://localhost:8000/api/v1/health
```

## 📚 Documentation

### Architecture

```
SmartHub/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── api/v1/            # API endpoints
│   │   │   ├── regulations.py # Regulation management
│   │   │   ├── changes.py     # Change tracking
│   │   │   ├── analysis.py    # Analysis & reporting
│   │   │   └── health.py      # Health checks
│   │   ├── models/            # Database models
│   │   │   ├── regulation.py  # Regulation entities
│   │   │   ├── change.py      # Change tracking
│   │   │   └── jurisdiction.py
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── services/          # Business logic
│   │   │   ├── change_detection_service.py
│   │   │   ├── ai_service.py
│   │   │   └── analysis_service.py
│   │   └── config.py          # Configuration
│   ├── requirements.txt       # Dependencies
│   └── Dockerfile
├── docs/                      # Documentation
├── docker-compose.yml         # Docker orchestration
└── README.md
```

## 🔧 API Usage

### Create a Regulation

```bash
curl -X POST "http://localhost:8000/api/v1/regulations" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "GDPR Article 5",
    "reference_number": "GDPR-ART-5",
    "jurisdiction": "eu",
    "category": "regulation",
    "content": "Personal data shall be processed lawfully, fairly and in a transparent manner...",
    "effective_date": "2018-05-25T00:00:00Z"
  }'
```

### List Regulations

```bash
curl "http://localhost:8000/api/v1/regulations?page=1&page_size=10"
```

### Analyze Change Between Versions

```bash
curl -X POST "http://localhost:8000/api/v1/analysis/analyze-change" \
  -H "Content-Type: application/json" \
  -d '{
    "regulation_id": "uuid-here",
    "old_version": 1,
    "new_version": 2,
    "use_ai": true
  }'
```

### Get Dashboard Summary

```bash
curl "http://localhost:8000/api/v1/analysis/dashboard/summary"
```

## 🎯 Key Services

### Change Detection Service

Detects and analyzes changes between regulation versions:

- Text diff analysis
- Section-level change detection
- Change type classification (addition, removal, modification)
- Severity assessment (critical, high, medium, low)
- Similarity scoring

### AI Service

AI-powered intelligent analysis:

- Change summarization
- Key point extraction
- Compliance impact analysis
- Risk scoring
- Recommendation generation
- Dependency identification

### Analysis Service

Comprehensive analysis orchestration:

- Full change analysis workflow
- Impact report generation
- Regulation comparison
- Timeline analysis
- Related change identification

## 🔒 Security

- Environment-based configuration
- API key protection
- Non-root Docker containers
- Input validation with Pydantic
- CORS configuration
- Health check endpoints

## 🧪 Development

### Local Development Setup

1. **Create virtual environment**

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies**

```bash
pip install -r requirements.txt
```

3. **Run development server**

```bash
uvicorn app.main:app --reload
```

### Running Tests

```bash
pytest
```

### Code Quality

```bash
# Format code
black .

# Lint code
flake8 .

# Type checking
mypy .
```

## 📊 Monitoring

### View Logs

```bash
# Backend logs
docker-compose logs -f backend

# Celery worker logs
docker-compose logs -f celery-worker

# All services
docker-compose logs -f
```

### Database Access

```bash
docker-compose exec db psql -U postgres smarthub
```

### Redis CLI

```bash
docker-compose exec redis redis-cli
```

## 🛠️ Configuration

### Environment Variables

Key configuration options in `.env`:

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql+asyncpg://...` |
| `REDIS_URL` | Redis connection string | `redis://redis:6379/0` |
| `OPENAI_API_KEY` | OpenAI API key | - |
| `ANTHROPIC_API_KEY` | Anthropic API key | - |
| `AI_MODEL` | AI model to use | `gpt-4-turbo-preview` |
| `CHANGE_DETECTION_ENABLED` | Enable auto change detection | `True` |
| `NOTIFICATION_ENABLED` | Enable notifications | `True` |

## 🚢 Deployment

### Production Considerations

1. **Set secure secrets**
   - Generate strong `SECRET_KEY`
   - Use secure database credentials
   - Protect API keys

2. **Configure CORS**
   - Update `BACKEND_CORS_ORIGINS` for production domains

3. **Set up SSL/TLS**
   - Use reverse proxy (Nginx/Traefik)
   - Enable HTTPS

4. **Enable monitoring**
   - Application logs
   - Error tracking (Sentry)
   - Performance monitoring

5. **Database backups**
   - Regular automated backups
   - Backup retention policy

## 📖 API Documentation

Full interactive API documentation available at:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

- Issues: [GitHub Issues](https://github.com/yourusername/smarthub/issues)
- Documentation: [Full Docs](./docs/)

## 🎉 Acknowledgments

- FastAPI framework
- OpenAI & Anthropic for AI capabilities
- Python community

---

**Built with ❤️ for regulatory compliance professionals**

# SmartHub Architecture

## System Overview

SmartHub is a microservices-based intelligent system for tracking and analyzing regulatory changes using AI.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                            │
│  (Web UI, Mobile Apps, External Systems via REST API)          │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                      API Gateway                                │
│                    FastAPI Application                          │
│                  (Port 8000, REST API)                          │
└─────┬──────────────┬──────────────┬──────────────┬─────────────┘
      │              │              │              │
      │              │              │              │
┌─────▼────┐  ┌──────▼─────┐  ┌────▼─────┐  ┌────▼─────┐
│Regulation│  │   Change   │  │ Analysis │  │  Health  │
│   API    │  │    API     │  │   API    │  │   API    │
└─────┬────┘  └──────┬─────┘  └────┬─────┘  └──────────┘
      │              │              │
┌─────▼──────────────▼──────────────▼─────────────────────┐
│                 Service Layer                           │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │   Change    │  │      AI      │  │   Analysis    │ │
│  │  Detection  │  │   Service    │  │   Service     │ │
│  │   Service   │  │              │  │               │ │
│  └─────────────┘  └──────────────┘  └───────────────┘ │
└────────┬───────────────┬─────────────────┬────────────┘
         │               │                 │
┌────────▼───────────────▼─────────────────▼────────────┐
│                  Data Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │  PostgreSQL  │  │     Redis    │  │Elasticsearch│ │
│  │  (Primary DB)│  │    (Cache)   │  │  (Search)   │ │
│  └──────────────┘  └──────────────┘  └─────────────┘ │
└───────────────────────────────────────────────────────┘
         │
┌────────▼───────────────────────────────────────────────┐
│              Background Processing                     │
│  ┌──────────────┐  ┌──────────────┐                   │
│  │Celery Worker │  │ Celery Beat  │                   │
│  │(Async Tasks) │  │ (Scheduler)  │                   │
│  └──────────────┘  └──────────────┘                   │
└───────────────────────────────────────────────────────┘
         │
┌────────▼───────────────────────────────────────────────┐
│           External Services Integration                │
│  ┌──────────────┐  ┌──────────────┐                   │
│  │   OpenAI     │  │  Anthropic   │                   │
│  │  (GPT-4)     │  │   (Claude)   │                   │
│  └──────────────┘  └──────────────┘                   │
└───────────────────────────────────────────────────────┘
```

## Components

### 1. API Gateway (FastAPI)

**Responsibilities:**
- HTTP request handling
- Request validation
- Authentication/Authorization
- CORS management
- API documentation (Swagger/ReDoc)

**Technology:** FastAPI, Uvicorn

### 2. Service Layer

#### Change Detection Service
- Compares regulation versions
- Detects text changes using diff algorithms
- Classifies change types
- Calculates severity scores
- Extracts affected sections

**Key Algorithms:**
- Diff-Match-Patch for text comparison
- Section parsing with regex
- Similarity calculation using SequenceMatcher

#### AI Service
- Integrates with LLM providers (OpenAI, Anthropic)
- Generates change summaries
- Extracts key points
- Analyzes compliance impact
- Calculates risk scores
- Generates recommendations

**Features:**
- Async API calls
- Fallback between providers
- Token management
- Error handling

#### Analysis Service
- Orchestrates change detection and AI analysis
- Generates impact reports
- Manages batch analysis
- Identifies related changes
- Creates timelines

### 3. Data Layer

#### PostgreSQL
**Purpose:** Primary data store

**Tables:**
- `regulations` - Regulation entities
- `regulation_versions` - Version history
- `regulatory_changes` - Change tracking
- `change_impacts` - Impact assessments
- `jurisdictions` - Jurisdiction data

#### Redis
**Purpose:** Caching and task queue

**Use Cases:**
- API response caching
- Session storage
- Celery broker
- Rate limiting

#### Elasticsearch
**Purpose:** Full-text search

**Use Cases:**
- Regulation content search
- Semantic search
- Change history search
- Analytics

### 4. Background Processing

#### Celery Worker
- Async change detection
- Scheduled analysis tasks
- Notification sending
- Index updates

#### Celery Beat
- Periodic regulation checks
- Scheduled reports
- Data cleanup tasks

## Data Flow

### 1. Create Regulation Flow

```
Client → API → Validation → Create Regulation Entity
                          → Create Version 1
                          → Index in Elasticsearch
                          → Return Response
```

### 2. Change Detection Flow

```
Client → API → Fetch Old Version
             → Fetch New Version
             → Change Detection Service
             → Calculate Diff
             → Classify Change Type
             → Calculate Severity
             → AI Analysis (if enabled)
             → Store Results
             → Return Analysis
```

### 3. AI Analysis Flow

```
Change Detected → AI Service → Build Prompt
                             → Call LLM API
                             → Parse Response
                             → Extract Insights
                             → Calculate Risk Score
                             → Generate Recommendations
                             → Store Results
```

## Scalability Considerations

### Horizontal Scaling
- Stateless API servers (can add multiple instances)
- Load balancer in front of API
- Multiple Celery workers
- Database read replicas

### Performance Optimization
- Response caching in Redis
- Database query optimization
- Async I/O operations
- Connection pooling
- Background task processing

### High Availability
- Database replication
- Redis clustering
- Health checks
- Graceful degradation
- Circuit breakers for external APIs

## Security Architecture

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- API key management

### Data Protection
- Environment-based secrets
- Encrypted connections (SSL/TLS)
- SQL injection prevention (ORM)
- XSS protection
- CORS policies

### API Security
- Rate limiting
- Input validation
- Request size limits
- HTTPS enforcement

## Monitoring & Observability

### Logging
- Structured JSON logging
- Log aggregation
- Error tracking

### Metrics
- Request rates
- Response times
- Error rates
- Resource usage

### Health Checks
- Application health endpoint
- Database connectivity
- External service status

## Development Patterns

### Design Patterns Used
1. **Repository Pattern** - Data access abstraction
2. **Service Layer Pattern** - Business logic separation
3. **Dependency Injection** - Loose coupling
4. **Factory Pattern** - Object creation
5. **Strategy Pattern** - Algorithm selection

### Code Organization
```
app/
├── api/          # API routes (presentation layer)
├── models/       # Database models (data layer)
├── schemas/      # Pydantic schemas (validation)
├── services/     # Business logic (service layer)
├── repositories/ # Data access (repository pattern)
├── utils/        # Shared utilities
└── config.py     # Configuration management
```

## Deployment Architecture

### Development
- Docker Compose
- Local PostgreSQL
- Local Redis
- Local Elasticsearch

### Production
- Kubernetes cluster
- Managed PostgreSQL (AWS RDS, Google Cloud SQL)
- Managed Redis (ElastiCache, Cloud Memorystore)
- Managed Elasticsearch (AWS OpenSearch)
- Load balancer
- CDN for static assets
- CI/CD pipeline

## Future Enhancements

1. **WebSocket Support** - Real-time notifications
2. **GraphQL API** - Flexible queries
3. **Machine Learning** - Custom models for change classification
4. **Multi-tenancy** - Organization isolation
5. **Audit Trail** - Complete change history
6. **Advanced Analytics** - Trend analysis and predictions

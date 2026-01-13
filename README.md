# Pokémon API 🎮

A RESTful API service that provides Pokémon information with fun translations. Built with TypeScript, Express.js, and integrated with PokeAPI and FunTranslations API.

## Features ✨

- 🔍 **Pokemon Information**: Fetch detailed Pokemon data including name, description, habitat, and legendary status
- 🎭 **Fun Translations**: Get Pokemon descriptions translated in Yoda or Shakespeare style
- ⚡ **High Performance**: Built-in caching to reduce API calls and improve response times
- 🔒 **Secure**: Helmet.js for security headers and rate limiting to prevent abuse
- 📝 **API Documentation**: Interactive Swagger/OpenAPI documentation
- 🐳 **Docker Support**: Containerized application for easy deployment
- ✅ **Comprehensive Testing**: Unit and integration tests with high coverage


## Project Structure 📁

```
pokemon/
├── src/
│   ├── server.ts              # Application entry point
│   ├── routes/
│   │   └── pokemon.ts         # Pokemon routes
│   ├── services/
│   │   ├── pokemon-service.ts # Pokemon data service
│   │   └── translation-service.ts # Translation service
│   ├── types/
│   │   ├── pokemon.ts         # Pokemon type definitions
│   │   └── translation.ts     # Translation type definitions
│   ├── utils/
│   │   ├── cache.ts           # Cache configuration
│   │   ├── exception.ts       # Custom error handling
│   │   └── logger.ts          # Pino logger setup
│   └── config/
│       └── swagger.ts         # Swagger configuration
├── tests/
│   ├── unit/                  # Unit tests
│   └── integration/           # Integration tests
├── Dockerfile                 # Docker configuration
├── docker-compose.yml         # Docker Compose setup
└── package.json
```

## Getting Started 🚀

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Docker (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pokemon
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file:
   ```env
   PORT=3000
   NODE_ENV=development
   ```

### Running the Application

#### Quick Start with run.sh
The project includes a convenient shell script for common tasks:

```bash
# Make script executable (first time only)
chmod +x run.sh

# Development mode
./run.sh dev

# Production mode
./run.sh prod

# Docker mode
./run.sh docker

# Run tests
./run.sh test

# Other available commands
./run.sh build        # Build only
./run.sh lint         # Run linter
./run.sh docker-stop  # Stop Docker containers
./run.sh docker-logs  # View Docker logs
```

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm run build
npm start
```

#### Using Docker
```bash
# Build and run with Docker Compose
docker-compose up --build

# Or with Docker
docker build -t pokemon-api .
docker run -p 3000:3000 pokemon-api
```

The API will be available at `http://localhost:3000`

## API Endpoints 📡

### Root Endpoint
```http
GET /
```
Returns API status message.

**Response:**
```json
{
  "status": "ok",
  "message": "Pokemon API is running"
}
```

### Health Check
```http
GET /health
```
Returns detailed service health status with uptime and cache statistics.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-13T10:30:00.000Z",
  "uptime": 3600,
  "service": "pokemon-api",
  "cache": {
    "hits": 150,
    "misses": 25,
    "keys": 10
  }
}
```

### Get Pokemon
```http
GET /pokemon/:name
```
Retrieve Pokemon information by name.

**Parameters:**
- `name` (path, required): Pokemon name (case-insensitive)

**Example:**
```bash
curl http://localhost:3000/pokemon/mewtwo
```

**Response:**
```json
{
  "name": "mewtwo",
  "description": "It was created by a scientist after years of horrific gene splicing and DNA engineering experiments.",
  "habitat": "rare",
  "isLegendary": true
}
```

### Get Pokemon with Translation
```http
GET /pokemon/translated/:name
```
Retrieve Pokemon with fun translated description:
- **Legendary Pokemon** or **Cave dwellers**: Yoda translation
- **Others**: Shakespeare translation

**Example:**
```bash
curl http://localhost:3000/pokemon/translated/mewtwo
```

**Response:**
```json
{
  "name": "mewtwo",
  "description": "Created by a scientist after years of horrific gene splicing and dna engineering experiments,  it was.",
  "habitat": "rare",
  "isLegendary": true
}
```

### API Documentation
```http
GET /api-docs
```
Interactive Swagger UI documentation.

## Rate Limiting ⏱️

The API implements rate limiting to prevent abuse:
- **100 requests per minute** per IP address
- Exceeding the limit returns a `429 Too Many Requests` response

## Caching 💾

Built-in caching system to improve performance:
- Pokemon data cached for **24 hours**
- Translations cached for **1 hour**
- Automatic cache cleanup and management

## Development 🔧

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Lint code
- `npm run lint-fix` - Lint and fix issues
- `npm run typecheck` - Type check without emitting

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

Current test coverage: **97.75%**

### Code Style

The project uses ESLint with TypeScript support. Run linting:
```bash
npm run lint
npm run lint-fix
```

## Error Handling 🚨

The API returns appropriate HTTP status codes:

- `200` - Success
- `400` - Bad Request (invalid input)
- `404` - Not Found (Pokemon doesn't exist)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

Error response format:
```json
{
  "error": "Error message description"
}
```

## External APIs 🌐

This service integrates with:

1. **PokeAPI** - [https://pokeapi.co](https://pokeapi.co)
   - Provides Pokemon data

2. **FunTranslations API** - [https://funtranslations.com](https://funtranslations.com)
   - Provides Yoda and Shakespeare translations
   - Note: Free tier has rate limits (5 requests/hour)

## Docker Support 🐳

The application includes multi-stage Docker builds:

- **Build stage**: Compiles TypeScript
- **Test stage**: Runs tests (can be used in CI/CD)
- **Production stage**: Minimal production image with non-root user

### Docker Compose

```bash
# Start services
docker-compose up

# Build and start
docker-compose up --build

# Stop services
docker-compose down
```

## Environment Variables 🔐

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | Environment (development/production/test) |

## Production Improvements 🚀

To make this application production-ready, consider the following enhancements:

### Infrastructure & Deployment
- **Orchestration**: Deploy with Kubernetes for auto-scaling and high availability
- **CI/CD**: Implement GitHub Actions/GitLab CI for deployment

### Monitoring & Observability
- **APM**: Integrate Application Performance Monitoring (New Relic, Datadog, or Elastic APM)
- **Metrics**: Add Prometheus metrics endpoint for monitoring
- **Distributed Tracing**: Implement OpenTelemetry for request tracing
- **Error Tracking**: Integrate Sentry or Rollbar for error monitoring

### Security Enhancements
- **API Authentication**: Add JWT or API key authentication
- **CORS Configuration**: Implement proper CORS policies for production
- **Input Validation**: Add comprehensive request validation (e.g., using Joi or Zod)
- **Secrets Management**: Use AWS Secrets Manager, HashiCorp Vault, or similar

### Performance Optimization
- **Distributed Cache**: Replace node-cache with Redis for multi-instance support

### Reliability & Resilience
- **Circuit Breaker**: Implement circuit breaker pattern for external API calls

## Contributing 🤝

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License 📄

This project is licensed under the MIT License.

## Author ✍️

**Mohamed Dounnani**

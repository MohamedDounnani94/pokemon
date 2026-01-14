# Pokémon API 🎮

A lightweight RESTful API service that fetches Pokémon information from PokeAPI and returns it with optional fun translations (Shakespeare or Yoda style). Built as a demonstration of modern TypeScript/Node.js development practices with Express.js.

## Overview

This service acts as a proxy and enhancement layer for the PokeAPI, providing:
- Clean, typed Pokemon data (name, description, habitat, legendary status)
- Fun translation feature using FunTranslations API
- Intelligent caching to minimize external API calls
- Production-ready features (rate limiting, structured logging, health checks)

The API automatically applies Yoda translations for legendary Pokemon or cave dwellers, and Shakespeare translations for all others.

## Quick Start

**Prerequisites:** Node.js >= 18.0.0

```bash
# Clone and install
git clone git@github.com:MohamedDounnani94/pokemon.git
cd pokemon
npm install

# Set up environment (optional - defaults work fine)
cp .env.example .env

# Run in development
npm run dev

# Or use the convenience script
chmod +x run.sh
./run.sh dev
```

The API will be available at `http://localhost:3000`

Try it:
```bash
curl http://localhost:3000/pokemon/mewtwo
curl http://localhost:3000/pokemon/translated/pikachu
```

## Key Features

- **TypeScript-first**: Full type safety and excellent developer experience
- **Caching**: In-memory cache
- **Rate Limiting**: 100 requests/minute per IP
- **Retry Logic**: Exponential backoff for failed external API calls
- **Docker Ready**: Multi-stage builds with production optimizations
- **API Docs**: Interactive Swagger UI at `/api-docs`
- **Logging**: Structured JSON logging with Pino

## API Endpoints

### `GET /pokemon/:name`
Fetch Pokemon information by name (case-insensitive).

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

### `GET /pokemon/translated/:name`
Same as above, but with description translated to Yoda (legendary/cave) or Shakespeare (others).

**Example:**
```bash
curl http://localhost:3000/pokemon/translated/mewtwo
```

### `GET /health`
Health check with uptime and cache statistics.

### `GET /api-docs`
Interactive Swagger documentation.

## Running Locally

### Development Mode
```bash
npm run dev          # Hot reload with nodemon
```

### Production Mode
```bash
npm run build        # Compile TypeScript
npm start            # Run compiled JavaScript
```

### Using Docker
```bash
docker-compose up --build
# Or
docker build -t pokemon-api .
docker run -p 3000:3000 pokemon-api
```

### Convenience Script
```bash
./run.sh dev         # Development
./run.sh prod        # Production
./run.sh docker      # Docker Compose
./run.sh test        # Run tests
./run.sh lint        # Lint code
```

## Development

### Testing
```bash
npm test                # Run all tests
npm run test:coverage   # With coverage report
npm run test:watch      # Watch mode
```

### Code Quality
```bash
npm run lint            # Check for issues
npm run lint-fix        # Auto-fix issues
npm run typecheck       # TypeScript type checking
```

## Limitations & Caveats ⚠️

### External API Dependencies
- **PokeAPI**: Generally reliable, but no SLA. Service failures will cause 500 errors.
- **FunTranslations API**: Generally reliable, but no SLA. Service failures will cause 500 errors. For the free tier and public API usage, the limit is 60 API calls per day, allocated as 5 calls per hour.

### Current Architecture
- **Single Instance**: Uses in-memory cache (node-cache). Not suitable for multi-instance deployments without Redis.
- **No Persistence**: Cache is lost on restart. No database backing.
- **No Authentication**: Public API with only rate limiting for protection.

### Known Issues
- Pokemon names must be exact (e.g., "mr-mime" not "mr mime")
- Only returns first flavor text entry (English version)
- Funtranslations has a limit of 60 API calls per day, allocated as 5 calls per hour.
- The service rate limiting is intentionally set low to make it easy to trigger during testing.


## Areas for Improvement 🚀

### For Production Use
1. **Distributed Caching**: Replace node-cache with Redis for multi-instance support
2. **Authentication**: Add API keys or JWT for access control
3. **Database**: Store Pokemon data locally to reduce PokeAPI dependency
4. **Circuit Breaker**: Prevent cascading failures when external APIs are down
5. **Monitoring**: Add APM (Datadog, New Relic) and metrics (Prometheus)
6. **CORS**: Currently wide-open, should be restricted in production
7. **Input Validation**: Add Zod or Joi schemas for request validation
8. **API Versioning**: Support `/v1/pokemon` for backward compatibility
9. **Rate Limiting**: Move from application-level to load balancer/API gateway for better scalability and DDoS protection or define a better strategy by configuring suitable windowMs values and maximum request limits.
10. **CI/CD Pipeline**: Build a GitHub Actions–based CD pipeline to build and push Docker images, then deploy them to Kubernetes with automated rollout and rollback support.
11. **HTTPS/TLS Termination**: Implement TLS termination at infrastructure layer (load balancer, reverse proxy like Nginx/Traefik) rather than in the application, with HSTS headers and HTTP-to-HTTPS redirects


### Code Quality
- Increase error scenario coverage

### Features
- Support multiple languages for Pokemon descriptions
- Add pagination for potential bulk endpoints
- Support searching Pokemon by type, habitat, or other attributes

## Project Structure

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

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | Environment mode |
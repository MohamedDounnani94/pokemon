# Build stage
FROM node:20-alpine AS build

WORKDIR /usr/app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm ci --quiet

# Copy TypeScript config and source code
COPY tsconfig.json ./
COPY eslint.config.mjs ./
COPY jest.config.js ./
COPY src ./src
COPY tests ./tests

# Build the application
RUN npm run build

# Test stage - includes devDependencies for testing
FROM build AS test

################################

# Production stage
FROM node:20-alpine AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /usr/app

# Install wget for healthcheck
RUN apk add --no-cache wget=~1

# Copy package files and node_modules from build
COPY --from=build --chown=nodejs:nodejs /usr/app/package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev --quiet

# Copy built application
COPY --from=build --chown=nodejs:nodejs /usr/app/build ./build

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Run the application
CMD ["node", "build/server.js"] 
#!/bin/bash

# SearnAI Deployment Script
set -e

echo "🚀 Starting SearnAI deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
BUILD_DIR=".next"
DOCKER_IMAGE="searnai"
DOCKER_TAG="latest"

echo -e "${YELLOW}Environment: $ENVIRONMENT${NC}"

# Pre-deployment checks
echo "🔍 Running pre-deployment checks..."

# Check if required environment variables are set
required_vars=(
    "NEXT_PUBLIC_FIREBASE_API_KEY"
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" 
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
    "OPENAI_API_KEY"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}❌ Error: $var is not set${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✅ Environment variables check passed${NC}"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Run tests
echo "🧪 Running tests..."
npm run test:ci

# Type checking
echo "🔍 Type checking..."
npm run typecheck

# Linting
echo "🧹 Linting code..."
npm run lint

# Build application
echo "🏗️  Building application..."
npm run build

if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}❌ Build failed - $BUILD_DIR directory not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully${NC}"

# Deployment based on environment
case $ENVIRONMENT in
    "production")
        echo "🌐 Deploying to production..."
        
        # Build Docker image
        echo "🐳 Building Docker image..."
        docker build -t $DOCKER_IMAGE:$DOCKER_TAG .
        
        # Tag for registry
        if [ ! -z "$DOCKER_REGISTRY" ]; then
            docker tag $DOCKER_IMAGE:$DOCKER_TAG $DOCKER_REGISTRY/$DOCKER_IMAGE:$DOCKER_TAG
            docker push $DOCKER_REGISTRY/$DOCKER_IMAGE:$DOCKER_TAG
        fi
        
        # Deploy to production (customize based on your infrastructure)
        echo "🚀 Deploying to production servers..."
        # kubectl apply -f k8s/production/
        # or docker-compose up -d
        # or your custom deployment commands
        
        ;;
        
    "staging")
        echo "🧪 Deploying to staging..."
        
        # Deploy to staging environment
        # Add your staging deployment commands here
        
        ;;
        
    "vercel")
        echo "▲ Deploying to Vercel..."
        
        # Deploy to Vercel
        if command -v vercel &> /dev/null; then
            vercel --prod
        else
            echo -e "${RED}❌ Vercel CLI not found. Install with: npm i -g vercel${NC}"
            exit 1
        fi
        
        ;;
        
    "firebase")
        echo "🔥 Deploying to Firebase..."
        
        # Deploy to Firebase Hosting
        if command -v firebase &> /dev/null; then
            firebase deploy --only hosting
        else
            echo -e "${RED}❌ Firebase CLI not found. Install with: npm i -g firebase-tools${NC}"
            exit 1
        fi
        
        ;;
        
    *)
        echo -e "${RED}❌ Unknown environment: $ENVIRONMENT${NC}"
        echo "Available environments: production, staging, vercel, firebase"
        exit 1
        ;;
esac

# Post-deployment checks
echo "🔍 Running post-deployment checks..."

# Health check (customize URL based on your deployment)
HEALTH_CHECK_URL="https://searnai.com/api/health"
if [ "$ENVIRONMENT" = "staging" ]; then
    HEALTH_CHECK_URL="https://staging.searnai.com/api/health"
fi

# Wait for deployment to be ready
sleep 10

# Check if deployment is healthy
if curl -f -s "$HEALTH_CHECK_URL" > /dev/null; then
    echo -e "${GREEN}✅ Health check passed${NC}"
else
    echo -e "${YELLOW}⚠️  Health check failed or endpoint not available${NC}"
fi

# Performance check with Lighthouse (optional)
if command -v lhci &> /dev/null && [ "$ENVIRONMENT" = "production" ]; then
    echo "⚡ Running Lighthouse performance check..."
    lhci autorun --config=lighthouserc.js
fi

# Cleanup
echo "🧹 Cleaning up..."
docker system prune -f 2>/dev/null || true

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"

# Send notification (customize based on your notification system)
if [ ! -z "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"🚀 SearnAI deployed to $ENVIRONMENT successfully!\"}" \
        "$SLACK_WEBHOOK_URL"
fi

echo "📊 Deployment Summary:"
echo "  Environment: $ENVIRONMENT"
echo "  Build Size: $(du -sh $BUILD_DIR | cut -f1)"
echo "  Docker Image: $DOCKER_IMAGE:$DOCKER_TAG"
echo "  Timestamp: $(date)"

exit 0
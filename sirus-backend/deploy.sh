#!/bin/bash

# PostgreSQL Deployment Script for SIRUS Application
set -e

# Configuration
CONTAINER_NAME="sirus-backend"
IMAGE_NAME="sirus-backend:latest"
PORT="8080"

echo "🚀 Starting SIRUS deployment with PostgreSQL..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create it from env.example"
    exit 1
fi

# Load environment variables
source .env

# 1. Build Docker image
echo "📦 Building Docker image..."
docker build -t $IMAGE_NAME .

# 2. Stop and remove existing container if it exists
echo "🛑 Stopping existing container if running..."
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

# 3. Run the container
echo "🔄 Starting container..."
docker run -d \
    --name $CONTAINER_NAME \
    -p $PORT:8080 \
    --env-file .env \
    $IMAGE_NAME

if [ $? -eq 0 ]; then
    echo "✅ Deployment completed successfully!"
    echo "🌐 Application URL: http://localhost:$PORT"
    echo "📊 Container logs: docker logs $CONTAINER_NAME"
    echo "🛑 Stop container: docker stop $CONTAINER_NAME"
    echo "🗑️ Remove container: docker rm $CONTAINER_NAME"
else
    echo "❌ Deployment failed!"
    exit 1
fi 
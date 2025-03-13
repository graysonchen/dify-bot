#!/bin/bash

# Set variables
IMAGE_NAME="graysonchen/dify-bot"
VERSION="latest"

# Create and use a new builder instance
docker buildx create --name mybuilder --use || true

# Build and push multi-architecture image
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --build-arg USE_NPM_CI=false \
  --tag ${IMAGE_NAME}:${VERSION} \
  --push \
  .

echo "Successfully built and pushed ${IMAGE_NAME}:${VERSION} for multiple architectures" 
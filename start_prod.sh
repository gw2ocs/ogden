export NODE_ENV=production
export OGDEN_VERSION=stable
export COMPOSE_PROJECT_NAME=ogden
docker compose pull && docker compose -f docker-compose.yml up -d
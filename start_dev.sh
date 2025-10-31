export NODE_ENV=development
export OGDEN_VERSION=latest
export COMPOSE_PROJECT_NAME=ogden-${NODE_ENV}
docker compose -f docker-compose.yml up -d
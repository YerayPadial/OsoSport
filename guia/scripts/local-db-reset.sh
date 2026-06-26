#!/usr/bin/env sh
set -eu

docker compose -f docker-compose.local.yml down -v
docker compose -f docker-compose.local.yml up -d database

until docker compose -f docker-compose.local.yml exec database mysqladmin ping -h 127.0.0.1 -uroot -ptest >/dev/null 2>&1; do
  sleep 1
done

docker exec -i ososport-guia-mysql mysql -uososport -pososport --default-character-set=utf8mb4 ososport_local < public/api/schema-and-seed.sql
docker exec -i ososport-guia-mysql mysql -uososport -pososport --default-character-set=utf8mb4 ososport_local < public/api/user-training-schema.sql
docker compose -f docker-compose.local.yml up -d api vite

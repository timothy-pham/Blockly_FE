#!/bin/bash
echo "START BUILDING - LIVE"

# Thay đổi quyền truy cập để có thể thực thi script
echo "Change permission to execute the script"
chmod +x build.live.sh

# Sao chép các file cấu hình cần thiết cho môi trường phát triển
echo "Copy necessary configuration files for development environment"
cp .env.live .env
cp Dockerfile.live Dockerfile
cp docker-compose-live.yml docker-compose.yml

# Chạy lệnh build Docker
echo "Run Docker build command"
docker compose up --build -d

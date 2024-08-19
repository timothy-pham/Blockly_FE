#!/bin/bash
echo "START BUILDING - DEV"

# Thay đổi quyền truy cập để có thể thực thi script
echo "Change permission to execute the script"
chmod +x build.dev.sh

# Sao chép các file cấu hình cần thiết cho môi trường phát triển
echo "Copy necessary configuration files for development environment"
cp .env.dev .env
cp Dockerfile.dev Dockerfile
cp docker-compose-dev.yml docker-compose.yml

# Chạy lệnh build Docker
echo "Run Docker build command"
docker-compose up --build -d
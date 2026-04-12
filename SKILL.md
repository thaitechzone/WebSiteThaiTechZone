---
name: docker-deployment
description: "สร้างและ deploy application ด้วย Docker Use this skill when the user mentions \"ทำ docker\", \"deploy docker\", \"containerize\"."
---

# 🐳 Deploy ด้วย Docker

## 📋 คำอธิบาย
สร้างและ deploy application ด้วย Docker

## 🎯 เหมาะสำหรับ
DevOps, Developer

## ⚡ วิธีเรียกใช้งาน
พิมพ์คำสั่งเหล่านี้เพื่อเปิดใช้งาน:
- ทำ docker
- deploy docker
- containerize

## 🔄 กระบวนการทำงาน
### ขั้นตอนที่ 1: สร้าง Dockerfile
Base image, dependencies, build, run

### ขั้นตอนที่ 2: Docker Compose
Multi-service setup: app, db, cache

### ขั้นตอนที่ 3: Deploy
Registry, orchestration, CI/CD integration

## 📤 รูปแบบผลลัพธ์
```
**Dockerfile:**
```
FROM node:18-alpine
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

**docker-compose.yml:**
```yaml
services:
  app:
    build: .
    ports: ["3000:3000"]
  db:
    image: postgres:15
```
```

## 💡 เคล็ดลับ
- ใช้ .dockerignore
- multi-stage build ลด size
- health check ทุก service

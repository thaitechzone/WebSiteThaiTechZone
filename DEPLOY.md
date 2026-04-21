# Deploy Guide — ThaiTechZone

## สถาปัตยกรรม (Production)

```
Internet
   │
Cloudflare DNS  (A record → Server IP)
   │
:80 / :443
   │
Nginx Proxy Manager  (container: thaitechzone-npm)
   │  proxy → nginx:80  (docker internal network)
   │
Nginx App            (container: thaitechzone-nginx)
   ├── /api/*  →  Backend   (container: thaitechzone-backend :3000)
   └── /*      →  Frontend  (container: thaitechzone-frontend :80)
                      │
                   PostgreSQL (container: thaitechzone-db :5432)
```

---

## Deploy ครั้งแรก

### 1. เตรียม Server

```bash
ssh user@<server-ip>

# ตรวจสอบ Docker พร้อมใช้
docker --version
docker compose version

# Clone โปรเจ็กต์
git clone https://github.com/thaitechzone/WebSiteThaiTechZone.git
cd WebSiteThaiTechZone
```

### 2. ตั้งค่า Environment

```bash
nano .env.production
```

กรอกค่าให้ครบ:

```env
NODE_ENV=production
PORT=3000

DB_HOST=postgres
DB_PORT=5432
DB_NAME=thaitechzone_db
DB_USER=thaitechzone
DB_PASSWORD=<strong-password>

JWT_SECRET=<random-64-chars>
JWT_EXPIRES_IN=7d

FRONTEND_URL=https://yourdomain.com
```

สร้าง JWT_SECRET แบบ random:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

### 3. Build และรัน

```bash
docker compose --profile prod up -d --build
```

ตรวจสอบทุก container ขึ้นปกติ:
```bash
docker compose --profile prod ps
```

ผลลัพธ์ที่ควรได้:
```
NAME                    STATUS
thaitechzone-db         Up (healthy)
thaitechzone-backend    Up (healthy)
thaitechzone-frontend   Up (healthy)
thaitechzone-nginx      Up
thaitechzone-npm        Up
```

### 4. ตั้งค่า Nginx Proxy Manager

1. เปิด Admin UI: `http://<server-ip>:81`
2. Login ครั้งแรก: `admin@example.com` / `changeme` (ระบบบังคับเปลี่ยนทันที)
3. เมนู **Proxy Hosts** → **Add Proxy Host**

| Field | ค่า |
|-------|-----|
| Domain Names | `yourdomain.com`, `www.yourdomain.com` |
| Scheme | `http` |
| Forward Hostname | `nginx` |
| Forward Port | `80` |
| Block Common Exploits | ✅ |

4. แท็บ **SSL**:
   - SSL Certificate → **Request a new SSL Certificate**
   - Force SSL → ✅
   - HTTP/2 Support → ✅
   - กด **Save**

### 5. ตั้งค่า Cloudflare DNS

| Type | Name | Content | Proxy Status |
|------|------|---------|--------------|
| A | `@` | `<server-ip>` | DNS only (เมฆเทา) |
| A | `www` | `<server-ip>` | DNS only (เมฆเทา) |

> ใช้ **DNS only** ระหว่าง Let's Encrypt ออก certificate  
> หลัง SSL พร้อมแล้วค่อยเปลี่ยนเป็น **Proxied** (เมฆส้ม)

### 6. ทดสอบ

```bash
curl https://yourdomain.com/api/health
# ควรได้: {"status":"ok",...}
```

---

## อัปเดต Production

ดึงโค้ดใหม่ก่อนเสมอ:
```bash
git pull
```

| ต้องการอัปเดต | คำสั่ง |
|--------------|--------|
| Backend เท่านั้น | `docker compose --profile prod up -d --build --no-deps backend` |
| Frontend เท่านั้น | `docker compose --profile prod up -d --build --no-deps frontend` |
| Backend + Frontend | `docker compose --profile prod up -d --build --no-deps backend frontend` |
| Nginx config | `docker compose --profile prod restart nginx` |

---

## Local Development

### รันครั้งแรก

```bash
cp backend/.env.example backend/.env
docker compose --profile dev up -d
```

| Service | URL |
|---------|-----|
| Frontend (Vite) | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| pgAdmin | http://localhost:5050 |

### อัปเดต Dev

```bash
# Backend
docker compose --profile dev up -d --build --no-deps backend-dev

# Frontend
docker compose --profile dev up -d --build --no-deps frontend-dev
```

---

## หยุด Services

```bash
# Dev
docker compose --profile dev down

# Prod
docker compose --profile prod down
```

> ⚠️ **ห้ามรัน `docker compose down -v`** — จะลบ volume ข้อมูล DB และ SSL certificates

---

## ดู Logs

```bash
# ทุก service
docker compose --profile prod logs -f

# เฉพาะ service
docker compose --profile prod logs -f backend
docker compose --profile prod logs -f nginx
docker compose --profile prod logs -f npm
```

---

## Backup Database

```bash
# Backup
docker exec thaitechzone-db pg_dump -U thaitechzone thaitechzone_db > backup_$(date +%Y%m%d).sql

# Restore
cat backup_YYYYMMDD.sql | docker exec -i thaitechzone-db psql -U thaitechzone thaitechzone_db
```

---

## แก้ปัญหาเบื้องต้น

```bash
# ดู log service ที่มีปัญหา
docker logs thaitechzone-backend --tail 50
docker logs thaitechzone-nginx --tail 50
docker logs thaitechzone-npm --tail 50

# Restart service เดียว
docker compose --profile prod restart backend

# เช็ค resource
docker stats
```

---

## ⚠️ ข้อควรระวัง

- **ห้ามรัน** `docker compose down -v` — จะลบข้อมูล DB และ SSL certificates
- **ห้าม commit** `.env.production` ขึ้น git
- Backup DB ก่อนทุกครั้งที่ update โครงสร้าง database

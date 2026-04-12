# Deploy Production บน VPS

## สิ่งที่ต้องมีก่อน
- VPS ที่ติดตั้ง Docker + Docker Compose แล้ว
- Nginx Proxy Manager (NPM) ทำงานอยู่บน VPS
- Domain ที่ชี้ DNS มาที่ IP ของ VPS แล้ว
- SSH access เข้า VPS

---

## ขั้นตอนที่ 1 — เตรียม VPS

```bash
# SSH เข้า VPS
ssh user@your-vps-ip

# ตรวจสอบ Docker พร้อมใช้งาน
docker --version
docker compose version

# ตรวจสอบ port 8080 ว่างอยู่ (จะใช้รับ traffic จาก NPM)
ss -tlnp | grep 8080
```

---

## ขั้นตอนที่ 2 — Clone โปรเจ็กต์

```bash
# Clone repo ลง VPS
git clone https://github.com/thaitechzone/WebSiteThaiTechZone.git
cd WebSiteThaiTechZone
```

---

## ขั้นตอนที่ 3 — ตั้งค่า Environment

```bash
# คัดลอก template
cp .env.production .env.production.local

# แก้ไขค่าจริง
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
DB_PASSWORD=<strong-password>        # ← เปลี่ยน

JWT_SECRET=<random-64-chars>          # ← เปลี่ยน
JWT_EXPIRES_IN=7d

FRONTEND_URL=https://thaitechzone.com # ← domain จริง

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

สร้าง JWT_SECRET แบบ random:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

---

## ขั้นตอนที่ 4 — Deploy

```bash
# Build และรัน production containers
docker compose -f docker-compose.prod.yml up -d --build

# ตรวจสอบว่าทุก container ขึ้นปกติ
docker compose -f docker-compose.prod.yml ps
```

ผลลัพธ์ที่ควรได้:
```
NAME                    STATUS
thaitechzone-db         Up (healthy)
thaitechzone-backend    Up (healthy)
thaitechzone-frontend   Up (healthy)
thaitechzone-nginx      Up
```

ทดสอบ backend ตอบสนองก่อนตั้ง NPM:
```bash
curl http://localhost:8080/api/health
# ได้: {"status":"ok",...}
```

---

## ขั้นตอนที่ 5 — ตั้งค่า Nginx Proxy Manager

1. เปิด NPM: `http://your-vps-ip:81`
2. เข้าเมนู **Proxy Hosts** → **Add Proxy Host**
3. กรอกข้อมูล:

| Field | ค่า |
|-------|-----|
| Domain Names | `thaitechzone.com` |
| Scheme | `http` |
| Forward Hostname | `localhost` |
| Forward Port | `8080` |
| Cache Assets | ✅ |
| Block Common Exploits | ✅ |

4. แท็บ **SSL**:
   - SSL Certificate → **Request a new SSL Certificate**
   - Force SSL → ✅
   - HTTP/2 Support → ✅
   - กด **Save**

NPM จะ auto-renew SSL ให้ทุก 90 วัน

---

## ขั้นตอนที่ 6 — ทดสอบ

```bash
# ทดสอบ HTTPS
curl https://thaitechzone.com/api/health

# ดู logs ถ้ามีปัญหา
docker compose -f docker-compose.prod.yml logs -f
```

เปิด browser: `https://thaitechzone.com`

---

## การ Update โค้ด (ไม่กระทบ DB)

```bash
# ดึงโค้ดใหม่
git pull

# Update เฉพาะ backend
docker compose -f docker-compose.prod.yml up -d --build --no-deps backend

# Update เฉพาะ frontend
docker compose -f docker-compose.prod.yml up -d --build --no-deps frontend

# Update ทั้งคู่
docker compose -f docker-compose.prod.yml up -d --build --no-deps backend frontend
```

---

## Backup ข้อมูล DB

```bash
# Backup
docker exec thaitechzone-db pg_dump -U thaitechzone thaitechzone_db > backup_$(date +%Y%m%d).sql

# Restore (ถ้าจำเป็น)
docker exec -i thaitechzone-db psql -U thaitechzone thaitechzone_db < backup_20260412.sql
```

---

## แก้ปัญหาเบื้องต้น

```bash
# ดู logs service ที่มีปัญหา
docker logs thaitechzone-backend --tail 50
docker logs thaitechzone-frontend --tail 50
docker logs thaitechzone-nginx --tail 50

# Restart service เดียว
docker compose -f docker-compose.prod.yml restart backend

# เช็ค resource usage
docker stats
```

---

## ⚠️ ข้อควรระวัง

- **ห้ามรัน** `docker compose down -v` — จะลบข้อมูล DB
- **ห้าม commit** `.env.production` ขึ้น git
- Backup DB ก่อนทุกครั้งที่ update โครงสร้าง database

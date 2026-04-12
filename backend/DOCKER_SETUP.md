# Docker Setup Guide — Thai Tech Zone Backend

คู่มือการติดตั้งและจัดการ PostgreSQL + pgAdmin ด้วย Docker Desktop

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — ติดตั้งและเปิดใช้งานแล้ว
- [Node.js](https://nodejs.org/) v18+ (ทดสอบกับ v25.2.1)

---

## การเริ่มต้นใช้งาน

### 1. เริ่ม Containers

```bash
docker-compose up -d
```

คำสั่งนี้จะ:
- ดาวน์โหลด `postgres:15-alpine` image (ครั้งแรกเท่านั้น)
- สร้าง container `thaitechzone-db` (PostgreSQL)
- สร้าง container `thaitechzone-pgadmin` (pgAdmin)
- **โหลด schema และ sample data อัตโนมัติ** จาก `database/schema.sql`

> **หมายเหตุ:** Schema จะถูกโหลดอัตโนมัติเฉพาะตอนสร้าง volume ใหม่ครั้งแรกเท่านั้น ถ้า volume มีอยู่แล้ว data เดิมจะถูกเก็บไว้

### 2. ตรวจสอบสถานะ

```bash
docker-compose ps
```

ผลลัพธ์ที่ควรได้:

```
NAME                   IMAGE                   STATUS
thaitechzone-db        postgres:15-alpine      Up (healthy)
thaitechzone-pgadmin   dpage/pgadmin4:latest   Up
```

รอให้ `thaitechzone-db` แสดงสถานะ `(healthy)` ก่อนเริ่ม backend server

### 3. เริ่ม Backend Server

```bash
npm run dev
```

---

## ข้อมูลการเชื่อมต่อ

### PostgreSQL Database

| Field | Value |
|-------|-------|
| Host | `localhost` |
| Port | `5432` |
| Database | `thaitechzone_db` |
| Username | `thaitechzone` |
| Password | `thaitechzone2024` |

### pgAdmin

URL: **http://localhost:5050**

| Field | Value |
|-------|-------|
| Email | `admin@thaitechzone.com` |
| Password | `admin` |

**เพิ่ม PostgreSQL Server ใน pgAdmin:**
1. คลิก "Add New Server"
2. แท็บ **General** → Name: `Thai Tech Zone DB`
3. แท็บ **Connection:**
   - Host: `postgres` _(ชื่อ service ใน Docker network)_
   - Port: `5432`
   - Database: `thaitechzone_db`
   - Username: `thaitechzone`
   - Password: `thaitechzone2024`
4. คลิก "Save"

---

## ตารางในฐานข้อมูล

| Table | คำอธิบาย | Sample Data |
|-------|---------|-------------|
| `users` | ข้อมูลผู้ใช้งาน | 1 admin user |
| `courses` | คอร์สเรียน | 3 courses |
| `enrollment` | การลงทะเบียน | - |
| `payments` | การชำระเงิน | - |
| `contact_messages` | ข้อความติดต่อ | - |

**Admin account (development):**
- Email: `admin@thaitechzone.com`
- Password: `admin1234`

---

## คำสั่ง Docker ที่ใช้บ่อย

```bash
# เริ่ม containers (background)
docker-compose up -d

# หยุด containers (เก็บ data ไว้)
docker-compose down

# หยุดและลบ data ทั้งหมด (reset ฐานข้อมูล)
docker-compose down -v

# ดู logs แบบ real-time
docker-compose logs -f postgres

# ดูสถานะ containers
docker-compose ps

# Restart เฉพาะ postgres
docker-compose restart postgres
```

---

## PostgreSQL Shell

เข้า psql โดยตรง:

```bash
docker exec -it thaitechzone-db psql -U thaitechzone -d thaitechzone_db
```

คำสั่งพื้นฐานใน psql:

```sql
\dt                  -- แสดงตารางทั้งหมด
\d users             -- แสดงโครงสร้างตาราง users
SELECT * FROM courses;  -- ดูข้อมูล
\q                   -- ออกจาก psql
```

---

## Backup และ Restore

**Backup:**
```bash
docker exec thaitechzone-db pg_dump -U thaitechzone thaitechzone_db > backup.sql
```

**Restore:**
```bash
docker exec -i thaitechzone-db psql -U thaitechzone -d thaitechzone_db < backup.sql
```

---

## Reset ฐานข้อมูล (เริ่มใหม่หมด)

```bash
# 1. หยุดและลบ containers + volumes
docker-compose down -v

# 2. เริ่มใหม่ (schema จะถูกสร้างอัตโนมัติ)
docker-compose up -d

# 3. รอ healthy แล้วเริ่ม server
npm run dev
```

---

## Troubleshooting

### Port 5432 already in use

มี PostgreSQL ติดตั้งในเครื่องอยู่แล้ว แก้โดยเปลี่ยน port ใน `docker-compose.yml`:

```yaml
ports:
  - "5433:5432"
```

แล้วอัปเดต `.env`:
```env
DB_PORT=5433
```

### Port 3000 already in use (backend server)

```bash
npx kill-port 3000 && npm run dev
```

### Database connection error

```bash
# 1. ตรวจสอบ Docker ทำงานอยู่
docker info

# 2. ตรวจสอบ containers
docker-compose ps

# 3. ดู error logs
docker-compose logs postgres

# 4. ตรวจสอบ .env ว่าค่าตรงกับ docker-compose.yml
```

### Schema ไม่ถูกสร้าง (volume มีอยู่แล้ว)

```bash
docker exec -i thaitechzone-db psql -U thaitechzone -d thaitechzone_db < database/schema.sql
```

### pgAdmin เชื่อมต่อไม่ได้

ลองใช้ hostname `host.docker.internal` แทน `postgres` ถ้าเชื่อมต่อจาก host machine โดยตรง

---

## Docker Services

```yaml
# docker-compose.yml (summary)
services:
  postgres:
    image: postgres:15-alpine
    container_name: thaitechzone-db
    ports: ["5432:5432"]
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql

  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: thaitechzone-pgadmin
    ports: ["5050:80"]
```

---

สร้างโดย **Thai Tech Zone** 🇹🇭

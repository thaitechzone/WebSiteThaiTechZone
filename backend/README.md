# Thai Tech Zone — Backend API

Node.js + Express + PostgreSQL backend สำหรับระบบคอร์สออนไลน์ LabVIEW, AI Automation และเทคโนโลยีที่เกี่ยวข้อง

## Features

- User Authentication (JWT)
- Course Management (CRUD)
- Enrollment & Progress Tracking
- Payment Processing (Stripe)
- Contact Form + Email Notifications
- Admin Dashboard
- Swagger UI (interactive API docs)

---

## Prerequisites

| เครื่องมือ | เวอร์ชัน | หมายเหตุ |
|-----------|---------|---------|
| [Node.js](https://nodejs.org/) | v18+ | ทดสอบกับ v25.2.1 |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | latest | สำหรับ PostgreSQL + pgAdmin |

---

## Quick Start

### 1. ติดตั้ง Dependencies

```bash
npm install
```

### 2. ตั้งค่า Environment Variables

ไฟล์ `.env` มีค่า default สำหรับ development อยู่แล้ว ถ้าต้องการแก้ไขให้เปิดไฟล์ `.env` และปรับค่าตามต้องการ:

```env
# Server
NODE_ENV=development
PORT=3000

# Database (ตรงกับ docker-compose.yml)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=thaitechzone_db
DB_USER=thaitechzone
DB_PASSWORD=thaitechzone2024

# JWT
JWT_SECRET=thaitechzone-jwt-secret-key-dev-2024
JWT_EXPIRES_IN=7d

# Email (ต้องใส่ก่อนใช้งาน contact form)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Stripe (ต้องใส่ก่อนใช้งาน payment)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Frontend
FRONTEND_URL=http://localhost:5173
```

### 3. เริ่ม PostgreSQL ด้วย Docker

```bash
docker-compose up -d
```

Schema และ sample data จะถูกสร้างอัตโนมัติเมื่อ container เริ่มครั้งแรก

ตรวจสอบสถานะ:
```bash
docker-compose ps
```

ผลลัพธ์ที่ควรได้:
```
NAME                  STATUS
thaitechzone-db       Up (healthy)
thaitechzone-pgadmin  Up
```

### 4. เริ่ม Backend Server

Development mode (auto-restart เมื่อแก้ไขไฟล์):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

เซิร์ฟเวอร์รันที่: **http://localhost:3000**

---

## Swagger UI

เข้าถึง interactive API documentation ได้ที่:

**http://localhost:3000/api/docs/**

วิธีใช้:
1. เรียก **POST /api/auth/login** → ใส่ `admin@thaitechzone.com` / `admin1234`
2. Copy token จาก response
3. กดปุ่ม **Authorize** → ใส่ `Bearer <token>`
4. ทดสอบ endpoint ได้ทุกตัว

Raw OpenAPI spec: **http://localhost:3000/api/docs.json**

---

## API Endpoints (27 endpoints)

| Group | Method | Path | Auth |
|-------|--------|------|------|
| **Auth** | POST | `/api/auth/register` | - |
| | POST | `/api/auth/login` | - |
| | POST | `/api/auth/refresh` | - |
| **Courses** | GET | `/api/courses` | - |
| | GET | `/api/courses/:id` | - |
| | POST | `/api/courses` | Admin |
| | PUT | `/api/courses/:id` | Admin |
| | DELETE | `/api/courses/:id` | Admin |
| **Enrollment** | POST | `/api/enrollment/enroll` | JWT |
| | GET | `/api/enrollment/my-courses` | JWT |
| | GET | `/api/enrollment/:id` | JWT |
| | PUT | `/api/enrollment/:id/progress` | JWT |
| | DELETE | `/api/enrollment/:id` | JWT |
| **Users** | GET | `/api/users/me` | JWT |
| | PUT | `/api/users/me` | JWT |
| | GET | `/api/users/profile/:userId` | - |
| **Payment** | POST | `/api/payment/create-checkout` | JWT |
| | POST | `/api/payment/webhook` | Stripe |
| | GET | `/api/payment/status/:id` | JWT |
| **Contact** | POST | `/api/contact/submit` | - |
| | GET | `/api/contact` | Admin |
| | GET | `/api/contact/:id` | Admin |
| | PUT | `/api/contact/:id/reply` | Admin |
| **Admin** | GET | `/api/admin/dashboard` | Admin |
| | GET | `/api/admin/users` | Admin |
| | GET | `/api/admin/enrollments` | Admin |
| | GET | `/api/admin/payments` | Admin |

---

## Authentication

Endpoint ที่ต้องการ JWT ใส่ token ใน header:

```
Authorization: Bearer <jwt_token>
```

**Admin account (development):**
- Email: `admin@thaitechzone.com`
- Password: `admin1234`

---

## Project Structure

```
backend/
├── config/
│   └── swagger.js           # Swagger/OpenAPI config + schemas
├── database/
│   ├── db.js                # PostgreSQL connection pool
│   └── schema.sql           # Database schema + sample data
├── routes/
│   ├── auth.js              # Authentication
│   ├── courses.js           # Course management
│   ├── enrollment.js        # Enrollment system
│   ├── payment.js           # Stripe payment
│   ├── contact.js           # Contact form + email
│   ├── users.js             # User profile
│   └── admin.js             # Admin functions
├── scripts/
│   └── initDb.js            # Manual DB init script
├── uploads/                 # File uploads directory
├── docker-compose.yml       # PostgreSQL + pgAdmin
├── server.js                # Express app entry point
├── package.json
└── .env                     # Environment variables
```

---

## pgAdmin (Database Management)

เข้าถึงได้ที่: **http://localhost:5050**

| Field | Value |
|-------|-------|
| Email | `admin@thaitechzone.com` |
| Password | `admin` |

เชื่อมต่อ PostgreSQL server:
- Host: `postgres`
- Port: `5432`
- Database: `thaitechzone_db`
- Username: `thaitechzone`
- Password: `thaitechzone2024`

---

## Database Schema

**5 Tables:** `users`, `courses`, `enrollment`, `payments`, `contact_messages`

คู่มือละเอียด: [DOCKER_SETUP.md](DOCKER_SETUP.md)

---

## Stripe Setup

1. สร้าง [Stripe Account](https://stripe.com)
2. ไปที่ Dashboard → API keys
3. ใส่ keys ใน `.env`:
   ```env
   STRIPE_SECRET_KEY=sk_test_xxx
   STRIPE_PUBLISHABLE_KEY=pk_test_xxx
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   ```
4. ทดสอบด้วยบัตร: `4242 4242 4242 4242`

---

## Email Setup (Gmail)

1. เปิด 2-Factor Authentication ใน Gmail
2. สร้าง App Password: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. ใส่ใน `.env`:
   ```env
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   ```

---

## Troubleshooting

**Port 3000 already in use:**
```bash
npx kill-port 3000 && npm run dev
```

**Database connection error:**
```bash
# ตรวจสอบ containers
docker-compose ps

# ดู logs
docker-compose logs postgres

# ตรวจสอบ .env ว่าค่าตรงกับ docker-compose.yml
```

**Schema ไม่ถูกสร้าง (container ที่มีอยู่แล้ว):**
```bash
docker exec -i thaitechzone-db psql -U thaitechzone -d thaitechzone_db < database/schema.sql
```

**JWT token expired:**
```bash
# เรียก POST /api/auth/refresh พร้อม token เก่า
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"token": "your_old_token"}'
```

---

## Quick Test (cURL)

```bash
# Health check
curl http://localhost:3000/api/health

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@thaitechzone.com","password":"admin1234"}'

# Get courses
curl http://localhost:3000/api/courses

# Register new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"สมชาย","lastName":"ใจดี"}'
```

---

## License

MIT License

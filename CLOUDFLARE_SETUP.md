# Cloudflare Tunnel & Nginx Proxy Manager Setup

## สถาปัตยกรรม

```
Internet
   │
Cloudflare Edge (HTTPS อัตโนมัติ)
   │
cloudflared (container: thaitechzone-cloudflared)
   │
nginx:80 (container: thaitechzone-nginx, docker internal)
   ├── /api/*  →  backend:3000
   └── /*      →  frontend:80
```

> Nginx Proxy Manager (NPM) ใช้สำหรับ Admin UI เท่านั้น — traffic จริงผ่าน Cloudflare Tunnel

---

## 1. ตั้งค่า Public Hostname ใน Cloudflare

### เข้า Dashboard

1. ไปที่ [dash.cloudflare.com](https://dash.cloudflare.com)
2. เมนูซ้าย → **Zero Trust**
3. **Networks** → **Tunnels**
4. คลิก tunnel ที่ใช้งาน → **Configure**
5. แท็บ **Public Hostname**

### เพิ่ม Root Domain

คลิก **Add a public hostname**

| Field | ค่า |
|-------|-----|
| Subdomain | _(ว่าง)_ |
| Domain | `yourdomain.com` |
| Type | `HTTP` |
| URL | `nginx:80` |

กด **Save hostname**

### เพิ่ม www

คลิก **Add a public hostname** อีกครั้ง

| Field | ค่า |
|-------|-----|
| Subdomain | `www` |
| Domain | `yourdomain.com` |
| Type | `HTTP` |
| URL | `nginx:80` |

กด **Save hostname**

> Cloudflare จะสร้าง CNAME DNS records ให้อัตโนมัติ และออก SSL certificate ให้เอง

### ตรวจสอบ

Tunnel status ควรเป็น **Healthy** (จุดเขียว) ใน Tunnels list

ทดสอบผ่าน terminal:
```bash
curl https://yourdomain.com/api/health
# ควรได้: {"status":"ok",...}
```

---

## 2. ตั้งค่า Nginx Proxy Manager (NPM)

NPM ใช้สำหรับจัดการ proxy rules เพิ่มเติมหรือ SSL สำรอง

### Login ครั้งแรก

1. เปิด `http://<server-ip>:81`
2. Login ด้วย:
   - Email: `admin@example.com`
   - Password: `changeme`
3. ระบบบังคับเปลี่ยน email และ password ทันที

### เพิ่ม Proxy Host (ถ้าต้องการใช้ NPM แทน Tunnel)

เมนู **Proxy Hosts** → **Add Proxy Host**

แท็บ **Details**:

| Field | ค่า |
|-------|-----|
| Domain Names | `yourdomain.com` และ `www.yourdomain.com` |
| Scheme | `http` |
| Forward Hostname | `nginx` |
| Forward Port | `80` |
| Block Common Exploits | ✅ |

แท็บ **SSL**:

| Field | ค่า |
|-------|-----|
| SSL Certificate | Request a new SSL Certificate |
| Force SSL | ✅ |
| HTTP/2 Support | ✅ |

กด **Save**

> หากใช้ Cloudflare Tunnel อยู่แล้ว ไม่จำเป็นต้องตั้งค่า NPM สำหรับ domain หลัก

---

## 3. หมายเหตุสำคัญ

- **ห้ามเปิดเผย Tunnel Token** — token ให้ใส่ใน `.env.production` เท่านั้น
- Cloudflare Tunnel จัดการ HTTPS ให้อัตโนมัติ ไม่ต้องออก Let's Encrypt เอง
- ถ้าใช้ Tunnel แล้ว ไม่ต้องเปิด port 80/443 บน firewall ของ VPS
- NPM Admin UI (port 81) ควรปิดด้วย firewall หลัง setup เสร็จ หรือจำกัด IP

---

## 4. ทดสอบ

```bash
# ทดสอบ API
curl https://yourdomain.com/api/health

# ทดสอบ Frontend
curl -I https://yourdomain.com

# ดู log cloudflared
docker logs thaitechzone-cloudflared --tail 20
```

PROD=-f docker-compose.prod.yml

# ═══════════════════════════════════════
#  DEVELOPMENT
# ═══════════════════════════════════════

dev-up:        ## รัน development ทั้งหมด
	docker compose up -d

dev-down:      ## หยุด development (ข้อมูล DB ยังอยู่)
	docker compose down

dev-logs:      ## ดู logs ทุก service
	docker compose logs -f

dev-update-backend:   ## อัปเดต backend อย่างเดียว (DB ไม่กระทบ)
	docker compose up -d --build --no-deps backend

dev-update-frontend:  ## อัปเดต frontend อย่างเดียว (DB ไม่กระทบ)
	docker compose up -d --build --no-deps frontend

# ═══════════════════════════════════════
#  PRODUCTION
# ═══════════════════════════════════════

prod-up:       ## รัน production ทั้งหมด (ครั้งแรก)
	docker compose $(PROD) up -d --build

prod-down:     ## หยุด production (ข้อมูล DB ยังอยู่)
	docker compose $(PROD) down

prod-logs:     ## ดู logs production
	docker compose $(PROD) logs -f

prod-update-backend:  ## ✅ อัปเดต backend (DB + frontend ไม่กระทบ)
	docker compose $(PROD) up -d --build --no-deps backend

prod-update-frontend: ## ✅ อัปเดต frontend (DB + backend ไม่กระทบ)
	docker compose $(PROD) up -d --build --no-deps frontend

prod-status:   ## ดูสถานะ containers ทั้งหมด
	docker compose $(PROD) ps

# ═══════════════════════════════════════
#  DATABASE — ระวัง!
# ═══════════════════════════════════════

db-backup:     ## Backup ข้อมูล DB → backup.sql
	docker exec thaitechzone-db pg_dump -U thaitechzone thaitechzone_db > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "✅ Backup สำเร็จ"

db-restore:    ## Restore จาก backup: make db-restore FILE=backup.sql
	docker exec -i thaitechzone-db psql -U thaitechzone thaitechzone_db < $(FILE)
	@echo "✅ Restore สำเร็จ"

db-shell:      ## เปิด psql shell
	docker exec -it thaitechzone-db psql -U thaitechzone thaitechzone_db

# ═══════════════════════════════════════
#  ⚠️  DANGER ZONE
# ═══════════════════════════════════════

reset-dev:     ## ⚠️  ลบทุกอย่างรวม DB (dev) — ข้อมูลหาย!
	@echo "⚠️  จะลบข้อมูล DB ทั้งหมด ยืนยัน? (Ctrl+C เพื่อยกเลิก)" && sleep 3
	docker compose down -v

reset-prod:    ## ⚠️  ลบทุกอย่างรวม DB (prod) — ข้อมูลหาย!
	@echo "⚠️  จะลบข้อมูล DB ทั้งหมด ยืนยัน? (Ctrl+C เพื่อยกเลิก)" && sleep 5
	docker compose $(PROD) down -v

.PHONY: dev-up dev-down dev-logs dev-update-backend dev-update-frontend \
        prod-up prod-down prod-logs prod-update-backend prod-update-frontend prod-status \
        db-backup db-restore db-shell reset-dev reset-prod

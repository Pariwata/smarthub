# Legal Compliance Tracker

ระบบติดตามการเปลี่ยนแปลงของกฎหมายและกฎเกณฑ์ ตามโครงสร้างของ Archer IRM (Integrated Risk Management)

## 📋 ภาพรวม

Legal Compliance Tracker เป็นระบบจัดการและติดตามการปฏิบัติตามกฎหมาย กฎระเบียบ และมาตรฐานต่างๆ ที่องค์กรต้องปฏิบัติตาม ระบบออกแบบตามโครงสร้างของ Archer IRM โดยมีโมดูลหลัก ดังนี้:

### ✨ คุณสมบัติหลัก

- **📚 Regulatory Library**: คลังกฎหมาย กฎระเบียบ และมาตรฐาน พร้อมติดตามการเปลี่ยนแปลง
- **📋 Compliance Obligations**: จัดการข้อปฏิบัติตามกฎหมายและกฎเกณฑ์
- **🛡️ Controls Management**: กำหนดและติดตาม controls ที่ใช้ในการปฏิบัติตาม
- **✅ Actions Tracking**: ติดตามงานและกิจกรรมที่ต้องดำเนินการ
- **📊 Compliance Status**: ประเมินและติดตามสถานะการปฏิบัติตาม
- **🔍 Audit Management**: จัดการการตรวจสอบและ findings
- **📑 Evidence Repository**: จัดเก็บหลักฐานการปฏิบัติตาม
- **⚠️ Risk Assessment**: ประเมินความเสี่ยงจากการไม่ปฏิบัติตาม
- **📈 Dashboard & Reporting**: รายงานและแดชบอร์ดแบบ Real-time

## 🏗️ สถาปัตยกรรมระบบ

### Technology Stack

**Backend**
- Node.js + Express + TypeScript
- PostgreSQL Database
- Prisma ORM
- RESTful API

**Frontend**
- React 18 + TypeScript
- Vite
- TailwindCSS
- React Query (TanStack Query)
- React Router
- Recharts (สำหรับกราฟ)

**DevOps**
- Docker & Docker Compose
- Nginx

### โครงสร้างโปรเจกต์

```
smarthub/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # API controllers
│   │   ├── services/       # Business logic
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   └── server.ts       # Entry point
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── Dockerfile
│   └── package.json
│
├── frontend/               # Frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities & API client
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
└── docker-compose.yml     # Docker orchestration
```

## 🚀 การติดตั้งและใช้งาน

### ข้อกำหนดเบื้องต้น

- Node.js 20+
- PostgreSQL 16+
- Docker & Docker Compose (สำหรับการ deploy)

### วิธีการติดตั้ง

#### 1. ใช้ Docker (แนะนำ)

```bash
# Clone repository
git clone <repository-url>
cd smarthub

# สร้างไฟล์ .env
cp backend/.env.example backend/.env

# Start all services
docker-compose up -d

# ตรวจสอบสถานะ
docker-compose ps
```

เข้าใช้งาน:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

#### 2. ติดตั้งแบบ Manual

**Backend**

```bash
cd backend

# ติดตั้ง dependencies
npm install

# สร้างไฟล์ .env
cp .env.example .env

# แก้ไข DATABASE_URL ใน .env
# DATABASE_URL="postgresql://postgres:password@localhost:5432/compliance_tracker?schema=public"

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Start development server
npm run dev
```

**Frontend**

```bash
cd frontend

# ติดตั้ง dependencies
npm install

# Start development server
npm run dev
```

## 📊 โครงสร้างฐานข้อมูล

ระบบใช้ PostgreSQL โดยมีตารางหลัก ดังนี้:

### โมดูล Regulatory Library
- `compliance_frameworks` - กรอบการปฏิบัติตาม (GDPR, PDPA, SOC2, etc.)
- `regulatory_library` - กฎหมายและกฎระเบียบ
- `regulatory_changes` - ประวัติการเปลี่ยนแปลงกฎหมาย

### โมดูล Compliance Management
- `compliance_obligations` - ข้อปฏิบัติตามกฎหมาย
- `compliance_controls` - Controls สำหรับปฏิบัติตาม
- `control_test_results` - ผลการทดสอบ controls
- `compliance_actions` - งานที่ต้องดำเนินการ
- `action_updates` - ประวัติการอัปเดตงาน
- `compliance_status` - สถานะการปฏิบัติตาม

### โมดูล Audit
- `audits` - การตรวจสอบ
- `audit_findings` - ข้อค้นพบจากการตรวจสอบ

### โมดูล Support
- `evidences` - หลักฐานการปฏิบัติตาม
- `risk_assessments` - การประเมินความเสี่ยง

## 🔌 API Endpoints

### Dashboard
```
GET /api/v1/dashboard/overview
GET /api/v1/dashboard/metrics
GET /api/v1/dashboard/deadlines?days=30
GET /api/v1/dashboard/recent-changes?limit=10
GET /api/v1/dashboard/compliance-by-framework
GET /api/v1/dashboard/risk-heatmap
```

### Frameworks
```
GET    /api/v1/frameworks
GET    /api/v1/frameworks/:id
POST   /api/v1/frameworks
PUT    /api/v1/frameworks/:id
DELETE /api/v1/frameworks/:id
GET    /api/v1/frameworks/:id/stats
```

### Regulations
```
GET    /api/v1/regulations
GET    /api/v1/regulations/:id
POST   /api/v1/regulations
PUT    /api/v1/regulations/:id
DELETE /api/v1/regulations/:id
GET    /api/v1/regulations/:id/changes
POST   /api/v1/regulations/:id/changes
```

### Obligations
```
GET    /api/v1/obligations
GET    /api/v1/obligations/:id
POST   /api/v1/obligations
PUT    /api/v1/obligations/:id
DELETE /api/v1/obligations/:id
GET    /api/v1/obligations/:id/compliance
```

### Actions
```
GET    /api/v1/actions
GET    /api/v1/actions/:id
POST   /api/v1/actions
PUT    /api/v1/actions/:id
DELETE /api/v1/actions/:id
PATCH  /api/v1/actions/:id/status
```

## 📱 ฟีเจอร์หน้าจอ

### 1. Dashboard
- ภาพรวมสถานะการปฏิบัติตาม
- กำหนดเวลาที่ใกล้จะถึง
- การเปลี่ยนแปลงกฎหมายล่าสุด
- Compliance rate ตาม framework
- แจ้งเตือนงานที่เกินกำหนด

### 2. Frameworks
- รายการ compliance frameworks
- สถิติ regulations และ audits แต่ละ framework
- จัดการ frameworks

### 3. Regulations
- คลังกฎหมายและกฎระเบียบ
- ติดตามการเปลี่ยนแปลง
- กรองตามสถานะและประเภท

### 4. Obligations
- ข้อปฏิบัติตามกฎหมาย
- ระดับความสำคัญ
- ความถี่ในการปฏิบัติ
- สถานะการปฏิบัติตาม

### 5. Actions
- งานที่ต้องดำเนินการ
- ความคืบหน้า
- ผู้รับผิดชอบ
- กำหนดเวลา

### 6. Audits
- การตรวจสอบ
- Findings และ recommendations
- สถานะการแก้ไข

## 🔐 Security Features

- Helmet.js สำหรับ security headers
- CORS configuration
- Input validation
- SQL injection protection (Prisma ORM)
- Environment variables สำหรับ sensitive data

## 🛠️ Development

### การรัน Tests
```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

### Database Management

```bash
cd backend

# Open Prisma Studio
npm run prisma:studio

# Create new migration
npm run prisma:migrate

# Reset database
npx prisma migrate reset
```

### Code Style

```bash
# Backend
npm run lint

# Frontend
npm run lint
```

## 📚 การใช้งานตามมาตรฐาน Archer IRM

ระบบนี้ออกแบบตามโครงสร้างของ Archer IRM ซึ่งเป็น Leading GRC Platform โดยมีโมดูลที่สอดคล้องกับ:

1. **Regulatory Management** - จัดการกฎหมายและกฎระเบียบ
2. **Compliance Management** - จัดการข้อปฏิบัติตามและ controls
3. **Issues Management** - ติดตามปัญหาและ findings จาก audit
4. **Policy Management** - จัดการนโยบายและขั้นตอน
5. **Risk Management** - ประเมินและจัดการความเสี่ยง
6. **Audit Management** - จัดการการตรวจสอบ

## 🎯 Use Cases

### 1. การติดตาม PDPA (Personal Data Protection Act)
- สร้าง framework สำหรับ PDPA
- เพิ่มกฎหมาย PDPA พ.ศ. 2562
- กำหนดข้อปฏิบัติตามมาตรา
- สร้าง controls และ actions
- ติดตามสถานะการปฏิบัติตาม

### 2. การเตรียมตรวจสอบ ISO 27001
- สร้าง framework สำหรับ ISO 27001
- กำหนด controls ตาม Annex A
- ติดตามหลักฐาน
- จัดการ audit และ findings

### 3. การปฏิบัติตาม SOX (Sarbanes-Oxley Act)
- กำหนด financial controls
- ติดตาม quarterly compliance
- จัดการ evidence และ documentation

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License

## 👥 Authors

- Development Team

## 🙏 Acknowledgments

- Archer IRM for the compliance framework structure
- Open source community

## 📞 Support

For support, please contact the development team or create an issue in the repository.

---

**หมายเหตุ**: ระบบนี้เป็น proof of concept สำหรับการจัดการ legal compliance ในองค์กร ควรปรับแต่งให้เหมาะสมกับความต้องการเฉพาะของแต่ละองค์กรก่อนนำไปใช้งานจริง

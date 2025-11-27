# SmartHub - Compliance Risk Assessment System

A comprehensive Compliance Risk Assessment system built with TypeScript, Express, PostgreSQL, and vanilla JavaScript frontend. This system implements a 5×5 risk matrix for evaluating compliance risks based on Impact and Likelihood, with Quality of Risk Management (QRM) assessment to determine Net Risk.

## 🎯 Features

### Core Functionality

- **5×5 Risk Matrix**: Assessment based on Impact (1-5) × Likelihood (1-5)
- **4-Level Net Risk**: Low, Medium, Quite High, High
- **5-Level QRM (Quality of Risk Management)**: Weak, Somewhat Weak, Fair, Good, Excellent
- **Risk Description Indicators**: Checkboxes for specific risk characteristics
- **Automatic Risk Calculation**: Inherent Risk and Net Risk auto-calculated
- **Regulation Group Management**: Organize risks by regulation categories (กลุ่มกฎเกณฑ์)
- **Compliance Risk Areas**: Manage specific compliance risk areas under each regulation group
- **Risk Assessment CRUD**: Full Create, Read, Update, Delete operations
- **Dashboard & Statistics**: Visual representation of risk distribution
- **Interactive Web UI**: User-friendly interface for risk assessment

### Risk Description Indicators

The system includes checkboxes to capture specific risk characteristics:

1. **Incomplete Action Plan for New/Changed Regulations**
   - ยังมี action plan สำหรับกฎเกณฑ์ออกใหม่/เปลี่ยนแปลงที่ยังดำเนินการไม่ครบถ้วน

2. **Incomplete Corrective/Preventive Action Plans**
   - ยังมี Action plan (corrective action plan และ/หรือ Preventive Action Plan) สำหรับประเด็น Non-compliance ที่พบที่ยังดำเนินการไม่แล้วเสร็จ

3. **New/Complex Regulations Requiring Special Attention**
   - มีกฎเกณฑ์ที่เพิ่งออกใหม่ หรือมีความซับซ้อน หรือมีผลกระทบ/ความเสี่ยงสำคัญที่อาจพบการปฏิบัติไม่เป็นไปตามกฎเกณฑ์ที่ธนาคารต้องติดตามดูแลเป็นพิเศษ

4. **Other Risk Descriptions** (free text field)

### Risk Calculation Logic

#### Inherent Risk Calculation (5×5 Matrix)

The system calculates Inherent Risk based on the intersection of Likelihood and Impact:

```
Likelihood Levels:
1 = น้อยมาก (Very Low) - ≤2% probability, <1 occurrence/year
2 = น้อย (Low) - 2%-5% probability, 1-3 occurrences
3 = ปานกลาง (Medium) - 5%-10% probability, 4-6 occurrences
4 = ค่อนข้างสูง (High) - 10%-20% probability, 7-9 occurrences
5 = รุนแรงที่สุด (Very High) - >20% probability, >10 occurrences

Impact Levels:
1 = น้อยมาก (Very Low)
2 = น้อย (Low)
3 = ปานกลาง (Medium)
4 = ค่อนข้างสูง (High)
5 = สูงมาก (Very High)

Net Risk Levels (4 levels):
1 = ต่ำ (Low) - Green
2 = ปานกลาง (Medium) - Yellow
3 = ค่อนข้างสูง (Quite High) - Orange
4 = สูง (High) - Red
```

#### Net Risk Calculation

Net Risk is calculated by adjusting Inherent Risk based on QRM level:

- **Excellent QRM (5)**: Reduces risk by 2 levels
- **Good QRM (4)**: Reduces risk by 1 level
- **Fair QRM (3)**: No change
- **Somewhat Weak QRM (2)**: Increases risk by 1 level
- **Weak QRM (1)**: Increases risk by 1 level

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd smarthub
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure your database settings:
```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=smarthub_compliance
DB_USER=postgres
DB_PASSWORD=your_password

API_PREFIX=/api/v1
```

4. Create the database:
```bash
createdb smarthub_compliance
```

5. Run database migrations:
```bash
npm run db:migrate
```

6. (Optional) Seed the database with sample data:
```bash
npx ts-node src/database/seed.ts
```

### Running the Application

#### Development Mode

```bash
npm run dev
```

The application will be available at:
- Web UI: http://localhost:3000
- API: http://localhost:3000/api/v1
- Health Check: http://localhost:3000/health

#### Production Mode

```bash
npm run build
npm start
```

## 📊 Database Schema

### Tables

#### 1. regulation_groups (กลุ่มกฎเกณฑ์)
```sql
- id: INTEGER (PK)
- code: STRING (Unique)
- nameTh: STRING
- nameEn: STRING
- description: TEXT
- isActive: BOOLEAN
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP
```

#### 2. compliance_risk_areas
```sql
- id: INTEGER (PK)
- regulationGroupId: INTEGER (FK → regulation_groups)
- code: STRING (Unique)
- nameTh: STRING
- nameEn: STRING
- description: TEXT
- isActive: BOOLEAN
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP
```

#### 3. risk_assessments
```sql
- id: INTEGER (PK)
- riskAreaId: INTEGER (FK → compliance_risk_areas)
- assessmentPeriod: STRING (e.g., "2024-Q1", "2024-H1")
- likelihoodLevel: INTEGER (1-5)
- impactLevel: INTEGER (1-5)
- inherentRisk: INTEGER (1-4, auto-calculated)
- qrmLevel: INTEGER (1-5)
- netRisk: INTEGER (1-4, auto-calculated)
- hasIncompleteActionPlanForNewRegulation: BOOLEAN
- hasIncompleteCorrectiveActionPlan: BOOLEAN
- hasNewOrComplexRegulation: BOOLEAN
- riskDescriptionOther: TEXT
- likelihoodJustification: TEXT
- impactJustification: TEXT
- qrmJustification: TEXT
- mitigationActions: TEXT
- assessedBy: STRING
- assessedDate: TIMESTAMP
- reviewedBy: STRING
- reviewedDate: TIMESTAMP
- status: ENUM ('draft', 'submitted', 'approved', 'rejected')
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP
```

## 🔌 API Endpoints

### Regulation Groups

- `GET /api/v1/regulation-groups` - Get all regulation groups
- `GET /api/v1/regulation-groups/:id` - Get regulation group by ID
- `POST /api/v1/regulation-groups` - Create new regulation group
- `PUT /api/v1/regulation-groups/:id` - Update regulation group
- `DELETE /api/v1/regulation-groups/:id` - Delete regulation group

### Compliance Risk Areas

- `GET /api/v1/compliance-risk-areas` - Get all risk areas
- `GET /api/v1/compliance-risk-areas/:id` - Get risk area by ID
- `POST /api/v1/compliance-risk-areas` - Create new risk area
- `PUT /api/v1/compliance-risk-areas/:id` - Update risk area
- `DELETE /api/v1/compliance-risk-areas/:id` - Delete risk area

### Risk Assessments

- `GET /api/v1/risk-assessments` - Get all risk assessments
- `GET /api/v1/risk-assessments/:id` - Get risk assessment by ID
- `POST /api/v1/risk-assessments` - Create new risk assessment
- `PUT /api/v1/risk-assessments/:id` - Update risk assessment
- `DELETE /api/v1/risk-assessments/:id` - Delete risk assessment
- `GET /api/v1/risk-assessments/matrix` - Get risk matrix data
- `GET /api/v1/risk-assessments/statistics` - Get dashboard statistics

### Example API Requests

#### Create Risk Assessment
```bash
curl -X POST http://localhost:3000/api/v1/risk-assessments \
  -H "Content-Type: application/json" \
  -d '{
    "riskAreaId": 1,
    "assessmentPeriod": "2024-Q1",
    "likelihoodLevel": 3,
    "impactLevel": 4,
    "qrmLevel": 4,
    "hasIncompleteActionPlanForNewRegulation": true,
    "hasIncompleteCorrectiveActionPlan": false,
    "hasNewOrComplexRegulation": true,
    "riskDescriptionOther": "Additional risk factors...",
    "likelihoodJustification": "มีการตรวจพบบางกรณี",
    "impactJustification": "อาจส่งผลกระทบต่อชื่อเสียงและค่าปรับ",
    "qrmJustification": "มีระบบควบคุมที่ดี",
    "mitigationActions": "ปรับปรุงระบบควบคุม",
    "assessedBy": "Compliance Officer",
    "status": "draft"
  }'
```

#### Get Risk Matrix
```bash
curl http://localhost:3000/api/v1/risk-assessments/matrix
```

#### Get Statistics
```bash
curl http://localhost:3000/api/v1/risk-assessments/statistics
```

## 🎨 Web Interface

The system includes a responsive web interface with the following features:

1. **Risk Matrix Tab**: Visual 5×5 risk matrix with color-coded risk levels
2. **Risk Assessments Tab**: List of all risk assessments with details and risk indicators
3. **Dashboard & Statistics Tab**: Overview of risk distribution and high-risk areas
4. **Create Assessment Tab**: Form to create new risk assessments with risk indicator checkboxes

Access the web interface at: http://localhost:3000

## 🏗️ Project Structure

```
smarthub/
├── src/
│   ├── config/
│   │   └── database.ts           # Database configuration
│   ├── controllers/
│   │   ├── regulationGroup.controller.ts
│   │   ├── complianceRiskArea.controller.ts
│   │   └── riskAssessment.controller.ts
│   ├── database/
│   │   ├── migrate.ts            # Database migration script
│   │   └── seed.ts               # Seed data script
│   ├── middleware/
│   │   └── validate.ts           # Validation middleware
│   ├── models/
│   │   ├── RegulationGroup.ts
│   │   ├── ComplianceRiskArea.ts
│   │   ├── RiskAssessment.ts
│   │   └── index.ts
│   ├── routes/
│   │   ├── regulationGroup.routes.ts
│   │   ├── complianceRiskArea.routes.ts
│   │   ├── riskAssessment.routes.ts
│   │   └── index.ts
│   ├── types/
│   │   └── enums.ts              # Enumerations and constants
│   ├── validators/
│   │   └── riskAssessment.validator.ts
│   └── server.ts                 # Main server file
├── public/
│   ├── index.html                # Web UI
│   └── app.js                    # Frontend JavaScript
├── .env.example                  # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 📝 Business Logic

### Risk Assessment Workflow

1. **Risk Identification**: Identify compliance risks under specific regulation groups
2. **Likelihood Assessment**: Evaluate the probability of the risk occurring (1-5)
3. **Impact Assessment**: Evaluate the potential impact if the risk occurs (1-5)
4. **Inherent Risk Calculation**: System automatically calculates based on 5×5 matrix
5. **QRM Evaluation**: Assess the quality of existing risk management controls (1-5)
6. **Risk Indicators**: Select applicable risk description indicators
7. **Net Risk Calculation**: System automatically adjusts inherent risk by QRM level
8. **Documentation**: Record justifications and mitigation actions
9. **Review & Approval**: Submit for review and approval

### Sample Use Cases

#### Banking Compliance Scenarios

1. **Anti-Money Laundering (AML)**
   - Regulation Group: AML Laws and Regulations
   - Risk Area: KYC (Know Your Customer)
   - Typical Assessment: Medium-High Likelihood, High Impact, Good QRM
   - Risk Indicators: May have incomplete corrective action plans

2. **Personal Data Protection**
   - Regulation Group: PDPA Regulations
   - Risk Area: Data Protection Compliance
   - Typical Assessment: Medium Likelihood, High Impact, Fair-Good QRM
   - Risk Indicators: New/complex regulations requiring special attention

3. **Credit Risk Management**
   - Regulation Group: Banking Supervision
   - Risk Area: Credit Risk Compliance
   - Typical Assessment: Low-Medium Likelihood, High Impact, Excellent QRM
   - Risk Indicators: May have incomplete action plans for new regulations

## 🧪 Testing

The system validates:
- Assessment period format (YYYY-Q1, YYYY-H1, YYYY-M01)
- Likelihood level (1-5)
- Impact level (1-5)
- QRM level (1-5)
- Risk indicator checkboxes (boolean)
- Automatic calculation of inherent and net risk

## 🔒 Security Considerations

- Input validation using Joi
- SQL injection prevention via Sequelize ORM
- CORS enabled for API access
- Environment-based configuration
- Error handling and logging

## 📈 Future Enhancements

- User authentication and authorization
- Role-based access control (RBAC)
- Audit trail and history tracking
- Email notifications for high-risk assessments
- Export functionality (PDF, Excel)
- Advanced analytics and trending
- Risk heat map visualization
- Integration with external compliance systems
- Multi-language support
- Mobile responsive design improvements

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT

## 👥 Authors

SmartHub Compliance Team

## 📞 Support

For support, please contact the development team or create an issue in the repository.

---

**Note**: This system is designed for compliance risk assessment in banking and financial institutions, following Thai banking regulations and international best practices including the 5x5 risk matrix methodology.

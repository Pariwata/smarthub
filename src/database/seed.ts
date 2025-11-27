import sequelize from '../config/database';
import { RegulationGroup, ComplianceRiskArea, RiskAssessment } from '../models';
import { LikelihoodLevel, ImpactLevel, QRMLevel } from '../types/enums';

async function seed() {
  try {
    console.log('Starting database seeding...');

    await sequelize.authenticate();
    console.log('Database connection established.');

    // Create Regulation Groups
    const regulationGroups = await RegulationGroup.bulkCreate([
      {
        code: 'REG001',
        nameTh: 'กฎหมายและระเบียบข้อบังคับทั่วไป',
        nameEn: 'General Laws and Regulations',
        description: 'กฎหมายและระเบียบข้อบังคับทั่วไปที่ธนาคารต้องปฏิบัติตาม',
        isActive: true
      },
      {
        code: 'REG002',
        nameTh: 'กฎหมายและระเบียบเกี่ยวกับการป้องกันและปราบปรามการฟอกเงิน',
        nameEn: 'Anti-Money Laundering (AML) Laws and Regulations',
        description: 'กฎหมายและระเบียบเกี่ยวกับ AML/CFT',
        isActive: true
      },
      {
        code: 'REG003',
        nameTh: 'กฎหมายและระเบียบเกี่ยวกับการคุ้มครองข้อมูลส่วนบุคคล',
        nameEn: 'Personal Data Protection Laws and Regulations',
        description: 'กฎหมายและระเบียบเกี่ยวกับ PDPA',
        isActive: true
      },
      {
        code: 'REG004',
        nameTh: 'กฎหมายและระเบียบเกี่ยวกับการกำกับดูแลธนาคารพาณิชย์',
        nameEn: 'Banking Supervision Laws and Regulations',
        description: 'กฎหมายและระเบียบจาก ธปท.',
        isActive: true
      }
    ]);

    console.log(`Created ${regulationGroups.length} regulation groups.`);

    // Create Compliance Risk Areas
    const riskAreas = await ComplianceRiskArea.bulkCreate([
      {
        regulationGroupId: regulationGroups[0].id,
        code: 'RISK001',
        nameTh: 'การปฏิบัติตามกฎหมายทั่วไป',
        nameEn: 'General Legal Compliance',
        description: 'ความเสี่ยงจากการไม่ปฏิบัติตามกฎหมายทั่วไป',
        isActive: true
      },
      {
        regulationGroupId: regulationGroups[1].id,
        code: 'RISK002',
        nameTh: 'การตรวจสอบลูกค้า (KYC)',
        nameEn: 'Know Your Customer (KYC)',
        description: 'ความเสี่ยงจากการตรวจสอบลูกค้าไม่เพียงพอ',
        isActive: true
      },
      {
        regulationGroupId: regulationGroups[1].id,
        code: 'RISK003',
        nameTh: 'การรายงานธุรกรรมต้องสงสัย (STR)',
        nameEn: 'Suspicious Transaction Reporting (STR)',
        description: 'ความเสี่ยงจากการรายงาน STR ล่าช้าหรือไม่ครบถ้วน',
        isActive: true
      },
      {
        regulationGroupId: regulationGroups[2].id,
        code: 'RISK004',
        nameTh: 'การคุ้มครองข้อมูลส่วนบุคคล',
        nameEn: 'Personal Data Protection',
        description: 'ความเสี่ยงจากการละเมิด PDPA',
        isActive: true
      },
      {
        regulationGroupId: regulationGroups[3].id,
        code: 'RISK005',
        nameTh: 'การบริหารความเสี่ยงด้านสินเชื่อ',
        nameEn: 'Credit Risk Management',
        description: 'ความเสี่ยงจากการบริหารสินเชื่อไม่เป็นไปตามหลักเกณฑ์',
        isActive: true
      }
    ]);

    console.log(`Created ${riskAreas.length} compliance risk areas.`);

    // Create sample Risk Assessments
    const assessments = await RiskAssessment.bulkCreate([
      {
        riskAreaId: riskAreas[0].id,
        assessmentPeriod: '2024-Q1',
        likelihoodLevel: LikelihoodLevel.LOW,
        impactLevel: ImpactLevel.MEDIUM,
        qrmLevel: QRMLevel.GOOD,
        likelihoodJustification: 'มีระบบควบคุมภายในที่ดี มีการตรวจสอบเป็นประจำ',
        impactJustification: 'หากเกิดขึ้นอาจส่งผลกระทบต่อชื่อเสียงและค่าปรับ',
        qrmJustification: 'มีการจัดการความเสี่ยงที่ดี มีนโยบายและขั้นตอนที่ชัดเจน',
        mitigationActions: 'ติดตามและทบทวนนโยบายอย่างสม่ำเสมอ',
        assessedBy: 'Compliance Officer',
        assessedDate: new Date(),
        status: 'approved'
      },
      {
        riskAreaId: riskAreas[1].id,
        assessmentPeriod: '2024-Q1',
        likelihoodLevel: LikelihoodLevel.MEDIUM,
        impactLevel: ImpactLevel.HIGH,
        qrmLevel: QRMLevel.FAIR,
        likelihoodJustification: 'พบบางกรณีที่การตรวจสอบ KYC ไม่ครบถ้วน',
        impactJustification: 'หากเกิดขึ้นอาจส่งผลให้ถูกดำเนินการจาก ธปท. และ ปปง.',
        qrmJustification: 'มีระบบ KYC แต่ยังต้องปรับปรุงในบางส่วน',
        mitigationActions: 'อบรมพนักงาน ปรับปรุงระบบ KYC',
        assessedBy: 'Compliance Officer',
        assessedDate: new Date(),
        status: 'approved'
      },
      {
        riskAreaId: riskAreas[2].id,
        assessmentPeriod: '2024-Q1',
        likelihoodLevel: LikelihoodLevel.HIGH,
        impactLevel: ImpactLevel.VERY_HIGH,
        qrmLevel: QRMLevel.SOMEWHAT_WEAK,
        likelihoodJustification: 'พบหลายกรณีที่การรายงาน STR ล่าช้า',
        impactJustification: 'อาจถูกปรับจำนวนมากและสูญเสียใบอนุญาต',
        qrmJustification: 'ระบบการตรวจจับและรายงานยังไม่มีประสิทธิภาพเพียงพอ',
        mitigationActions: 'นำระบบ AI มาช่วยตรวจจับ ปรับปรุงกระบวนการรายงาน',
        assessedBy: 'Compliance Officer',
        assessedDate: new Date(),
        status: 'submitted'
      },
      {
        riskAreaId: riskAreas[3].id,
        assessmentPeriod: '2024-Q1',
        likelihoodLevel: LikelihoodLevel.MEDIUM,
        impactLevel: ImpactLevel.HIGH,
        qrmLevel: QRMLevel.GOOD,
        likelihoodJustification: 'มีมาตรการคุ้มครองข้อมูลที่ดี แต่ยังมีความเสี่ยงจากพนักงาน',
        impactJustification: 'หากเกิดการรั่วไหลข้อมูล อาจถูกปรับสูงสุด 5% ของรายได้',
        qrmJustification: 'มี Data Governance และ Security Controls ที่ดี',
        mitigationActions: 'อบรมพนักงาน เพิ่ม Access Control',
        assessedBy: 'Compliance Officer',
        assessedDate: new Date(),
        status: 'approved'
      }
    ]);

    console.log(`Created ${assessments.length} risk assessments.`);

    await sequelize.close();
    console.log('Seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seed();
}

export default seed;

/**
 * Enums for Compliance Risk Assessment System
 * Based on Thai banking regulations and risk management standards
 */

// Likelihood levels (ความถี่ในการเกิดเหตุการณ์)
export enum LikelihoodLevel {
  VERY_LOW = 1,    // น้อยมาก (≤2%, <1 occurrence per year)
  LOW = 2,         // น้อย (2%-5%, 1-3 occurrences)
  MEDIUM = 3,      // ปานกลาง (5%-10%, 4-6 occurrences)
  HIGH = 4,        // ค่อนข้างสูง (10%-20%, 7-9 occurrences)
  VERY_HIGH = 5    // รุนแรงที่สุด (>20%, >10 occurrences)
}

// Impact levels (ผลกระทบ)
export enum ImpactLevel {
  VERY_LOW = 1,    // น้อยมาก
  LOW = 2,         // น้อย
  MEDIUM = 3,      // ปานกลาง
  HIGH = 4,        // ค่อนข้างสูง
  VERY_HIGH = 5    // สูงมาก
}

// Net Risk levels (4 levels as per requirement)
export enum NetRiskLevel {
  LOW = 1,              // ต่ำ (Green)
  MEDIUM = 2,           // ปานกลาง (Yellow)
  QUITE_HIGH = 3,       // ค่อนข้างสูง (Orange)
  HIGH = 4              // สูง (Red)
}

// Quality of Risk Management (QRM) - 5 levels
export enum QRMLevel {
  WEAK = 1,                // อ่อน (Red)
  SOMEWHAT_WEAK = 2,       // ค่อนข้างอ่อน (Orange)
  FAIR = 3,                // พอใช้ (Yellow)
  GOOD = 4,                // ค่อนข้างดี (Light Green)
  EXCELLENT = 5            // ดี (Dark Green)
}

// Mappings for display
export const LikelihoodLabels = {
  [LikelihoodLevel.VERY_LOW]: { th: 'น้อยมาก', en: 'Very Low', percentage: '≤2%', occurrences: '<1 ครั้ง/ปี' },
  [LikelihoodLevel.LOW]: { th: 'น้อย', en: 'Low', percentage: '2%-5%', occurrences: '1-3 ครั้ง' },
  [LikelihoodLevel.MEDIUM]: { th: 'ปานกลาง', en: 'Medium', percentage: '5%-10%', occurrences: '4-6 ครั้ง' },
  [LikelihoodLevel.HIGH]: { th: 'ค่อนข้างสูง', en: 'High', percentage: '10%-20%', occurrences: '7-9 ครั้ง' },
  [LikelihoodLevel.VERY_HIGH]: { th: 'รุนแรงที่สุด', en: 'Very High', percentage: '>20%', occurrences: '>10 ครั้ง' }
};

export const ImpactLabels = {
  [ImpactLevel.VERY_LOW]: { th: 'น้อยมาก', en: 'Very Low' },
  [ImpactLevel.LOW]: { th: 'น้อย', en: 'Low' },
  [ImpactLevel.MEDIUM]: { th: 'ปานกลาง', en: 'Medium' },
  [ImpactLevel.HIGH]: { th: 'ค่อนข้างสูง', en: 'High' },
  [ImpactLevel.VERY_HIGH]: { th: 'สูงมาก', en: 'Very High' }
};

export const NetRiskLabels = {
  [NetRiskLevel.LOW]: { th: 'ต่ำ', en: 'Low', color: 'green' },
  [NetRiskLevel.MEDIUM]: { th: 'ปานกลาง', en: 'Medium', color: 'yellow' },
  [NetRiskLevel.QUITE_HIGH]: { th: 'ค่อนข้างสูง', en: 'Quite High', color: 'orange' },
  [NetRiskLevel.HIGH]: { th: 'สูง', en: 'High', color: 'red' }
};

export const QRMLabels = {
  [QRMLevel.WEAK]: { th: 'อ่อน', en: 'Weak', color: 'red' },
  [QRMLevel.SOMEWHAT_WEAK]: { th: 'ค่อนข้างอ่อน', en: 'Somewhat Weak', color: 'orange' },
  [QRMLevel.FAIR]: { th: 'พอใช้', en: 'Fair', color: 'yellow' },
  [QRMLevel.GOOD]: { th: 'ค่อนข้างดี', en: 'Good', color: 'lightgreen' },
  [QRMLevel.EXCELLENT]: { th: 'ดี', en: 'Excellent', color: 'darkgreen' }
};

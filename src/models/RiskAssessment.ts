import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import ComplianceRiskArea from './ComplianceRiskArea';
import { LikelihoodLevel, ImpactLevel, NetRiskLevel, QRMLevel } from '../types/enums';

interface RiskAssessmentAttributes {
  id: number;
  riskAreaId: number;
  assessmentPeriod: string;
  likelihoodLevel: LikelihoodLevel;
  impactLevel: ImpactLevel;
  inherentRisk: NetRiskLevel;
  qrmLevel: QRMLevel;
  netRisk: NetRiskLevel;
  // Risk Description Indicators
  hasIncompleteActionPlanForNewRegulation?: boolean;
  hasIncompleteCorrectiveActionPlan?: boolean;
  hasNewOrComplexRegulation?: boolean;
  riskDescriptionOther?: string;
  likelihoodJustification?: string;
  impactJustification?: string;
  qrmJustification?: string;
  mitigationActions?: string;
  assessedBy?: string;
  assessedDate?: Date;
  reviewedBy?: string;
  reviewedDate?: Date;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  createdAt?: Date;
  updatedAt?: Date;
}

interface RiskAssessmentCreationAttributes extends Optional<RiskAssessmentAttributes, 'id' | 'inherentRisk' | 'netRisk' | 'status' | 'createdAt' | 'updatedAt'> {}

class RiskAssessment extends Model<RiskAssessmentAttributes, RiskAssessmentCreationAttributes> implements RiskAssessmentAttributes {
  public id!: number;
  public riskAreaId!: number;
  public assessmentPeriod!: string;
  public likelihoodLevel!: LikelihoodLevel;
  public impactLevel!: ImpactLevel;
  public inherentRisk!: NetRiskLevel;
  public qrmLevel!: QRMLevel;
  public netRisk!: NetRiskLevel;
  public hasIncompleteActionPlanForNewRegulation?: boolean;
  public hasIncompleteCorrectiveActionPlan?: boolean;
  public hasNewOrComplexRegulation?: boolean;
  public riskDescriptionOther?: string;
  public likelihoodJustification?: string;
  public impactJustification?: string;
  public qrmJustification?: string;
  public mitigationActions?: string;
  public assessedBy?: string;
  public assessedDate?: Date;
  public reviewedBy?: string;
  public reviewedDate?: Date;
  public status!: 'draft' | 'submitted' | 'approved' | 'rejected';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RiskAssessment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    riskAreaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'compliance_risk_areas',
        key: 'id'
      },
      comment: 'Foreign key to compliance_risk_areas table'
    },
    assessmentPeriod: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Assessment period (e.g., 2024-Q1, 2024-H1)'
    },
    likelihoodLevel: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      },
      comment: 'Likelihood level (1-5): 1=Very Low, 2=Low, 3=Medium, 4=High, 5=Very High'
    },
    impactLevel: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      },
      comment: 'Impact level (1-5): 1=Very Low, 2=Low, 3=Medium, 4=High, 5=Very High'
    },
    inherentRisk: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 4
      },
      comment: 'Inherent Risk (calculated from Likelihood x Impact): 1=Low, 2=Medium, 3=Quite High, 4=High'
    },
    qrmLevel: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      },
      comment: 'Quality of Risk Management (1-5): 1=Weak, 2=Somewhat Weak, 3=Fair, 4=Good, 5=Excellent'
    },
    netRisk: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 4
      },
      comment: 'Net Risk (adjusted from Inherent Risk by QRM): 1=Low, 2=Medium, 3=Quite High, 4=High'
    },
    hasIncompleteActionPlanForNewRegulation: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      comment: 'ยังมี action plan สำหรับกฎเกณฑ์ออกใหม่/เปลี่ยนแปลงที่ยังดำเนินการไม่ครบถ้วน'
    },
    hasIncompleteCorrectiveActionPlan: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      comment: 'ยังมี Action plan (corrective action plan และ/หรือ Preventive Action Plan) สำหรับประเด็น Non-compliance ที่พบที่ยังดำเนินการไม่แล้วเสร็จ'
    },
    hasNewOrComplexRegulation: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
      comment: 'มีกฎเกณฑ์ที่เพิ่งออกใหม่ หรือมีความซับซ้อน หรือมีผลกระทบ/ความเสี่ยงสำคัญที่อาจพบการปฏิบัติไม่เป็นไปตามกฎเกณฑ์ที่ธนาคารต้องติดตามดูแลเป็นพิเศษ'
    },
    riskDescriptionOther: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Other risk description (free text)'
    },
    likelihoodJustification: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Justification for likelihood assessment'
    },
    impactJustification: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Justification for impact assessment'
    },
    qrmJustification: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Justification for QRM level'
    },
    mitigationActions: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Actions taken or planned to mitigate the risk'
    },
    assessedBy: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Name/ID of the person who assessed'
    },
    assessedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date when the assessment was made'
    },
    reviewedBy: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Name/ID of the reviewer'
    },
    reviewedDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Date when the assessment was reviewed'
    },
    status: {
      type: DataTypes.ENUM('draft', 'submitted', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'draft',
      comment: 'Status of the risk assessment'
    }
  },
  {
    sequelize,
    tableName: 'risk_assessments',
    timestamps: true,
    indexes: [
      {
        fields: ['riskAreaId', 'assessmentPeriod']
      },
      {
        fields: ['status']
      }
    ],
    hooks: {
      beforeValidate: (assessment) => {
        // Auto-calculate inherent risk based on 5x5 matrix
        if (assessment.likelihoodLevel && assessment.impactLevel) {
          assessment.inherentRisk = calculateInherentRisk(assessment.likelihoodLevel, assessment.impactLevel);
        }
        // Auto-calculate net risk based on inherent risk and QRM
        if (assessment.inherentRisk && assessment.qrmLevel) {
          assessment.netRisk = calculateNetRisk(assessment.inherentRisk, assessment.qrmLevel);
        }
      }
    }
  }
);

/**
 * Calculate Inherent Risk from Likelihood x Impact using 5x5 matrix
 * Returns NetRiskLevel (1-4)
 *
 * Matrix mapping (based on the image):
 * - Low (1): Green cells
 * - Medium (2): Yellow cells
 * - Quite High (3): Orange cells
 * - High (4): Red cells
 */
function calculateInherentRisk(likelihood: LikelihoodLevel, impact: ImpactLevel): NetRiskLevel {
  // 5x5 Risk Matrix
  const riskMatrix: NetRiskLevel[][] = [
    // Impact:   1(VL)              2(L)                3(M)                4(H)                5(VH)
    [NetRiskLevel.LOW,      NetRiskLevel.LOW,       NetRiskLevel.MEDIUM,    NetRiskLevel.MEDIUM,    NetRiskLevel.QUITE_HIGH],  // Likelihood 1 (VL)
    [NetRiskLevel.LOW,      NetRiskLevel.MEDIUM,    NetRiskLevel.MEDIUM,    NetRiskLevel.QUITE_HIGH, NetRiskLevel.HIGH],         // Likelihood 2 (L)
    [NetRiskLevel.MEDIUM,   NetRiskLevel.MEDIUM,    NetRiskLevel.QUITE_HIGH, NetRiskLevel.QUITE_HIGH, NetRiskLevel.HIGH],         // Likelihood 3 (M)
    [NetRiskLevel.MEDIUM,   NetRiskLevel.QUITE_HIGH, NetRiskLevel.QUITE_HIGH, NetRiskLevel.HIGH,      NetRiskLevel.HIGH],         // Likelihood 4 (H)
    [NetRiskLevel.QUITE_HIGH, NetRiskLevel.QUITE_HIGH, NetRiskLevel.HIGH,      NetRiskLevel.HIGH,      NetRiskLevel.HIGH]          // Likelihood 5 (VH)
  ];

  return riskMatrix[likelihood - 1][impact - 1];
}

/**
 * Calculate Net Risk from Inherent Risk adjusted by QRM level
 * Better QRM can reduce the net risk
 *
 * Logic:
 * - Excellent QRM (5): Can reduce risk by 2 levels
 * - Good QRM (4): Can reduce risk by 1 level
 * - Fair QRM (3): No change
 * - Somewhat Weak QRM (2): May increase risk by 1 level
 * - Weak QRM (1): May increase risk by 1 level
 */
function calculateNetRisk(inherentRisk: NetRiskLevel, qrm: QRMLevel): NetRiskLevel {
  let netRisk = inherentRisk;

  if (qrm === QRMLevel.EXCELLENT) {
    netRisk = Math.max(NetRiskLevel.LOW, inherentRisk - 2);
  } else if (qrm === QRMLevel.GOOD) {
    netRisk = Math.max(NetRiskLevel.LOW, inherentRisk - 1);
  } else if (qrm === QRMLevel.FAIR) {
    netRisk = inherentRisk;
  } else if (qrm === QRMLevel.SOMEWHAT_WEAK || qrm === QRMLevel.WEAK) {
    netRisk = Math.min(NetRiskLevel.HIGH, inherentRisk + 1);
  }

  return netRisk;
}

// Define associations
RiskAssessment.belongsTo(ComplianceRiskArea, {
  foreignKey: 'riskAreaId',
  as: 'riskArea'
});

ComplianceRiskArea.hasMany(RiskAssessment, {
  foreignKey: 'riskAreaId',
  as: 'assessments'
});

export default RiskAssessment;
export { calculateInherentRisk, calculateNetRisk };

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import RegulationGroup from './RegulationGroup';

interface ComplianceRiskAreaAttributes {
  id: number;
  regulationGroupId: number;
  code: string;
  nameTh: string;
  nameEn: string;
  description?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ComplianceRiskAreaCreationAttributes extends Optional<ComplianceRiskAreaAttributes, 'id' | 'isActive' | 'createdAt' | 'updatedAt'> {}

class ComplianceRiskArea extends Model<ComplianceRiskAreaAttributes, ComplianceRiskAreaCreationAttributes> implements ComplianceRiskAreaAttributes {
  public id!: number;
  public regulationGroupId!: number;
  public code!: string;
  public nameTh!: string;
  public nameEn!: string;
  public description?: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ComplianceRiskArea.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    regulationGroupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'regulation_groups',
        key: 'id'
      },
      comment: 'Foreign key to regulation_groups table'
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'Risk area code (e.g., RISK001)'
    },
    nameTh: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Thai name for compliance risk area'
    },
    nameEn: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'English name for compliance risk area'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Detailed description of the compliance risk area'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether this risk area is active'
    }
  },
  {
    sequelize,
    tableName: 'compliance_risk_areas',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['code']
      },
      {
        fields: ['regulationGroupId']
      }
    ]
  }
);

// Define associations
ComplianceRiskArea.belongsTo(RegulationGroup, {
  foreignKey: 'regulationGroupId',
  as: 'regulationGroup'
});

RegulationGroup.hasMany(ComplianceRiskArea, {
  foreignKey: 'regulationGroupId',
  as: 'riskAreas'
});

export default ComplianceRiskArea;

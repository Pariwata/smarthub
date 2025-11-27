import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface RegulationGroupAttributes {
  id: number;
  code: string;
  nameTh: string;
  nameEn: string;
  description?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface RegulationGroupCreationAttributes extends Optional<RegulationGroupAttributes, 'id' | 'isActive' | 'createdAt' | 'updatedAt'> {}

class RegulationGroup extends Model<RegulationGroupAttributes, RegulationGroupCreationAttributes> implements RegulationGroupAttributes {
  public id!: number;
  public code!: string;
  public nameTh!: string;
  public nameEn!: string;
  public description?: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RegulationGroup.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: 'Regulation group code (e.g., REG001)'
    },
    nameTh: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Thai name for regulation group (กลุ่มกฎเกณฑ์)'
    },
    nameEn: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'English name for regulation group'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Detailed description of the regulation group'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether this regulation group is active'
    }
  },
  {
    sequelize,
    tableName: 'regulation_groups',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['code']
      }
    ]
  }
);

export default RegulationGroup;

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const CompanyMaster = sequelize.define(
  'CompanyMaster',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    company_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    country_code: {
      type: DataTypes.CHAR(2),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('Active', 'Inactive'),
      allowNull: false,
      defaultValue: 'Active',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'createdAt',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updatedAt',
    },
  },
  {
    tableName: 'company_master',
    timestamps: true,
  }
);

export default CompanyMaster;
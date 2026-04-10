import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const CompanyMaster = sequelize.define('CompanyMaster', {
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
}, {
  tableName: 'company_master',
  timestamps: false,
});

export default CompanyMaster;
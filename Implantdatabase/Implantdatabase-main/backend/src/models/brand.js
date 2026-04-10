import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Brand = sequelize.define('Brand', {
  idbrand: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  brand_name: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  manufacturer_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  website: {
    type: DataTypes.STRING(300),
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'brand',
  timestamps: false,
});

export default Brand;
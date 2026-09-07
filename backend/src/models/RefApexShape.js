import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const RefApexShape = sequelize.define(
  'RefApexShape',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'name',
    },
    status: {
      type: DataTypes.ENUM('Active', 'Inactive'),
      allowNull: false,
      defaultValue: 'Active',
      field: 'status',
    },
  },
  {
    tableName: 'ref_apex_shape',
    timestamps: false,
  }
);  

export default RefApexShape;
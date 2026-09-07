import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const RefBodyShape = sequelize.define(
  'RefBodyShape',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
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
    tableName: 'ref_body_shape',
    timestamps: false,
  }
);

export default RefBodyShape;
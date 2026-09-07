import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const RefConnectionShape = sequelize.define(
  'RefConnectionShape',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'connection_shape_name',
    },
    status: {
      type: DataTypes.ENUM('Active', 'Inactive'),
      allowNull: false,
      defaultValue: 'Active',
      field: 'status',
    },
  },
  {
    tableName: 'ref_connection_shape',
    timestamps: false,
  }
);

export default RefConnectionShape;
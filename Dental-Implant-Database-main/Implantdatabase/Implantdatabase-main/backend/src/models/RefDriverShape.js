import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const RefDriverShape = sequelize.define(
  'RefDriverShape',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'driver_shape_name',
    },
    status: {
      type: DataTypes.ENUM('Active', 'Inactive'),
      allowNull: false,
      defaultValue: 'Active',
      field: 'status',
    },
  },
  {
    tableName: 'ref_driver_shape',
    timestamps: false,
  }
);

export default RefDriverShape;
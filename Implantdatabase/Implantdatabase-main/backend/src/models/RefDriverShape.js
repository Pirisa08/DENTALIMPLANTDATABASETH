import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const RefDriverShape = sequelize.define('RefDriverShape', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  driver_shape_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
}, {
  tableName: 'ref_driver_shape',
  timestamps: false,
});

export default RefDriverShape;
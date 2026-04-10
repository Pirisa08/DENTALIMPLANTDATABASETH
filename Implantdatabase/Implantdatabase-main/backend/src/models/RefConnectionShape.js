import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const RefConnectionShape = sequelize.define('RefConnectionShape', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  connection_shape_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
}, {
  tableName: 'ref_connection_shape',
  timestamps: false,
});

export default RefConnectionShape;
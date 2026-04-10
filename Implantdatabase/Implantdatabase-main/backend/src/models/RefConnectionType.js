import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const RefConnectionType = sequelize.define('RefConnectionType', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
}, {
  tableName: 'ref_connection_type',
  timestamps: false,
});

export default RefConnectionType;
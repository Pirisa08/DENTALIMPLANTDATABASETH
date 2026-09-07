import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const RefReadTime = sequelize.define('RefReadTime', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  label: {
    type: DataTypes.STRING(40),
    allowNull: false,
  },
}, {
  tableName: 'ref_read_time',
  timestamps: false,
});

export default RefReadTime;
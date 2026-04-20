import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const RefJobTitle = sequelize.define('RefJobTitle', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(80),
    allowNull: false,
  },
}, {
  tableName: 'ref_job_title',
  timestamps: false,
});

export default RefJobTitle;
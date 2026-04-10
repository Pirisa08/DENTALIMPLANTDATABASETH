import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const RefApexShape = sequelize.define('RefApexShape', {
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
  tableName: 'ref_apex_shape',
  timestamps: false,
});

export default RefApexShape;
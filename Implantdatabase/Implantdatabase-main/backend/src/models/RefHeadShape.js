import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const RefHeadShape = sequelize.define('RefHeadShape', {
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
  tableName: 'ref_head_shape',
  timestamps: false,
});

export default RefHeadShape;
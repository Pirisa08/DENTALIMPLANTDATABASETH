import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const RefRole = sequelize.define('RefRole', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
}, {
  tableName: 'ref_role',
  timestamps: false,
});

export default RefRole;
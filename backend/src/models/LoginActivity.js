import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const LoginActivity = sequelize.define('LoginActivity', {
  login_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  login_time: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
}, {
  tableName: 'login_activity',
  timestamps: false,
});

export default LoginActivity;
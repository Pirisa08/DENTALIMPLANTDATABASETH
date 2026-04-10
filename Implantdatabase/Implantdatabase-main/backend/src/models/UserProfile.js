import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const UserProfile = sequelize.define('UserProfile', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  surname: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  level_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  job_title_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  image_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'user_profile',
  timestamps: false,
});

export default UserProfile;
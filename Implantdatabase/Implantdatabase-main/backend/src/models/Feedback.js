import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Feedback = sequelize.define('Feedback', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(120),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(160),
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  subject: {
    type: DataTypes.STRING(160),
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('new', 'in_progress', 'resolved'),
    allowNull: false,
    defaultValue: 'new',
  },
  adminReply: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  responder: {
    type: DataTypes.STRING(120),
    allowNull: true,
  },
  respondedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'feedbacks',
  underscored: false,
  timestamps: true,
});

export default Feedback;

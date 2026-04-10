import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Blog = sequelize.define('Blog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  content: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  author: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  publishedDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  readTime: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ctaLabel: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ctaUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  manualUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  referenceUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  image: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
  },
  imageDataUrl: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('Active', 'Inactive'),
    defaultValue: 'Active',
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'blogs',
  timestamps: true,
});

export default Blog;

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Implant = sequelize.define('Implant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  website: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  brandDescription: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
  },
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  levelId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  countryId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  countryText: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  connectionType: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  connectionShape: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  screwdriverShape: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  headShape: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  bodyShape: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
  },
  apexShape: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  officialDistributor: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('Active', 'Inactive'),
    defaultValue: 'Active',
  },
  image1: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
  },
  image2: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
  },
  image3: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
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
  tableName: 'implants',
  timestamps: true,
});

export default Implant;

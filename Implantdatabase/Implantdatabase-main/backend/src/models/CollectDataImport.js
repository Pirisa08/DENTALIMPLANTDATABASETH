import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const CollectDataImport = sequelize.define('CollectDataImport', {
  Name: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  Level: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  Company: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  Country: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  ConnectionType: {
    field: 'Connection Type',
    type: DataTypes.TEXT,
    allowNull: true,
  },
  ConnectionShape: {
    field: 'Connection Shape',
    type: DataTypes.TEXT,
    allowNull: true,
  },
  ScrewdriverShape: {
    field: 'Screwdriver Shape',
    type: DataTypes.TEXT,
    allowNull: true,
  },
  HeadShape: {
    field: 'Head Shape',
    type: DataTypes.TEXT,
    allowNull: true,
  },
  BodyShape: {
    field: 'Body Shape',
    type: DataTypes.TEXT,
    allowNull: true,
  },
  ApexShape: {
    field: 'Apex Shape',
    type: DataTypes.TEXT,
    allowNull: true,
  },
  OfficialDistributor: {
    field: 'Official Distributor',
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: '_collectdata_import',
  timestamps: false,
});

export default CollectDataImport;
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const DistributorMaster = sequelize.define('DistributorMaster', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  distributor_name: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  website: {
    type: DataTypes.STRING(300),
    allowNull: true,
  },
}, {
  tableName: 'distributor_master',
  timestamps: false,
});

export default DistributorMaster;
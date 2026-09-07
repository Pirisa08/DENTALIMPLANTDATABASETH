import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ModelMaster = sequelize.define('ModelMaster', {
  model_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  model_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  brand_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'model_master',
  timestamps: false,
});

export default ModelMaster;
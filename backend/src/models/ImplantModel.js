import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ImplantModel = sequelize.define('ImplantModel', {
  idmodel: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  brand_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  model_code: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  connection_type: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  material_code: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  diameter_mm: {
    type: DataTypes.DECIMAL(4,2),
    allowNull: true,
  },
  length_mm: {
    type: DataTypes.DECIMAL(4,1),
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'implant_model',
  timestamps: false,
});

export default ImplantModel;
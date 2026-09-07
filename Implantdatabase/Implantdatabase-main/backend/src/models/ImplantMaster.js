import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ImplantMaster = sequelize.define(
  'ImplantMaster',
  {
    implant_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    implant_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    level_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    brand_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    model_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    connection_type_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    connection_shape_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    driver_shape_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    head_shape_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    body_shape_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    apex_shape_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    distributor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    image_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('Active', 'Inactive'),
      allowNull: false,
      defaultValue: 'Active',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: 'implant_master',
    timestamps: false,
  }
);

export default ImplantMaster;
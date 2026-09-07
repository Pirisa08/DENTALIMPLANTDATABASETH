import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Manufacturer = sequelize.define('Manufacturer', {
  idmanufacturer: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name_th: {
    type: DataTypes.STRING(45),
    allowNull: false,
  },
  country: {
    type: DataTypes.STRING(45),
    allowNull: true,
  },
  website: {
    type: DataTypes.STRING(45),
    allowNull: true,
  },
  created_at: {
    type: DataTypes.STRING(45),
    allowNull: true,
  },
}, {
  tableName: 'manufacturer',
  timestamps: false,
});

export default Manufacturer;
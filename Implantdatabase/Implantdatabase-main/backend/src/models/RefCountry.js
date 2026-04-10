import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const RefCountry = sequelize.define('RefCountry', {
  code: {
    type: DataTypes.STRING(4),
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
}, {
  tableName: 'ref_country',
  timestamps: false,
});

export default RefCountry;
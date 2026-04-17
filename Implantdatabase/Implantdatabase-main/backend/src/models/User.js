import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import bcrypt from 'bcryptjs';

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    role: {
      type: DataTypes.ENUM('admin', 'user'),
      defaultValue: 'user',
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (!user.password) return;

        const value = String(user.password);

        const looksHashed =
          value.startsWith('$2a$') ||
          value.startsWith('$2b$') ||
          value.startsWith('$2y$');

        if (!looksHashed) {
          user.password = await bcrypt.hash(value, 10);
        }
      },

      beforeUpdate: async (user) => {
        if (!user.changed('password')) return;

        const value = String(user.password || '');

        const looksHashed =
          value.startsWith('$2a$') ||
          value.startsWith('$2b$') ||
          value.startsWith('$2y$');

        if (!looksHashed) {
          user.password = await bcrypt.hash(value, 10);
        }
      },
    },
  }
);

User.prototype.comparePassword = async function (plainPassword) {
  const storedPassword = String(this.password || '');
  const inputPassword = String(plainPassword || '');

  const looksHashed =
    storedPassword.startsWith('$2a$') ||
    storedPassword.startsWith('$2b$') ||
    storedPassword.startsWith('$2y$');

  if (looksHashed) {
    return bcrypt.compare(inputPassword, storedPassword);
  }

  return storedPassword === inputPassword;
};

export default User;
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import sequelize from '../src/config/database.js';
import { User } from '../src/models/index.js';

const ADMIN_USER = {
  username: 'dent',
  email: 'admindent@lamduan.mfu.ac.th',
  password: 'admindent',
  role: 'admin',
};

const DEMO_ADMIN_EMAIL = 'admin@demo.com';

const createAdminUser = async () => {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connected');

    await User.sync({ alter: true });
    console.log('User table synced');

    const hashedPassword = await bcrypt.hash(ADMIN_USER.password, 10);

    const existingAdmin = await User.findOne({
      where: {
        [Op.or]: [
          { email: ADMIN_USER.email },
          { username: ADMIN_USER.username },
        ],
      },
    });

    if (existingAdmin) {
      existingAdmin.username = ADMIN_USER.username;
      existingAdmin.email = ADMIN_USER.email;
      existingAdmin.password = hashedPassword;
      existingAdmin.role = ADMIN_USER.role;
      await existingAdmin.save();

      await User.destroy({ where: { email: DEMO_ADMIN_EMAIL } });

      console.log('\nAdmin user updated successfully!');
      console.log('Email:', existingAdmin.email);
      console.log('Username:', existingAdmin.username);
      console.log('Password: stored as bcrypt hash');
      process.exit(0);
    }

    const admin = await User.create({
      username: ADMIN_USER.username,
      email: ADMIN_USER.email,
      password: hashedPassword,
      role: ADMIN_USER.role,
    });

    console.log('\nAdmin user created successfully!');
    console.log('Email:', admin.email);
    console.log('Username:', admin.username);
    console.log('Password: stored as bcrypt hash');
    console.log('Role:', admin.role);
    console.log('\nYou can now login at: http://localhost:3000/admin/login');

    await User.destroy({ where: { email: DEMO_ADMIN_EMAIL } });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createAdminUser();

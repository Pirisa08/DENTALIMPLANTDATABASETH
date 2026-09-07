import bcrypt from 'bcryptjs';
import sequelize from '../src/config/database.js';
import { User } from '../src/models/index.js';

const createAdminUser = async () => {
  try {
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Sync User model
    await User.sync({ alter: true });
    console.log('✅ User table synced');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      where: { email: 'admin@lamduan.mfu.ac.th' } 
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('   Email:', existingAdmin.email);
      console.log('   Username:', existingAdmin.username);
      
      // Ask if want to update password
      console.log('\n💡 To update password, delete the user first or run UPDATE query');
      process.exit(0);
    }

    // Create admin user
    const password = 'ilovedentalverymuch';
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      username: 'admin',
      email: 'admin@lamduan.mfu.ac.th',
      password: hashedPassword,
      role: 'admin',
      status: 'Active'
    });

    console.log('\n✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', admin.email);
    console.log('👤 Username:', admin.username);
    console.log('🔑 Password:', password);
    console.log('👑 Role:', admin.role);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🔐 You can now login at: http://localhost:3000/admin/login');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createAdminUser();

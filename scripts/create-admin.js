const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    const adminData = {
      firstName: 'System',
      lastName: 'Admin',
      email: 'admin@familyalbum.com',
      phone: '0782651854',
      role: 'admin',
      password: await bcrypt.hash('Admin@1234', 10), // Hashing the password
      isActive: true,
    };

    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        OR: [
          { email: adminData.email },
          { phone: adminData.phone }
        ]
      }
    });

    if (existingAdmin) {
      console.log('Admin user already exists:');
      console.log({
        id: existingAdmin.id,
        email: existingAdmin.email,
        phone: existingAdmin.phone,
        role: existingAdmin.role
      });
      return;
    }

    // Create new admin user
    const admin = await prisma.user.create({
      data: adminData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    console.log('✅ Admin user created successfully:');
    console.log(JSON.stringify(admin, null, 2));
    console.log('\nYou can now login with:');
    console.log(`Email: ${admin.email}`);
    console.log('Password: Admin@1234');
    console.log('\nPlease change the password after first login!');

  } catch (error) {
    console.error('❌ Error creating admin user:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();

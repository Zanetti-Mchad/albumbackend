const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const plainPassword = 'password123';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  await prisma.user.upsert({
    where: { email: 'mahadnyanzi@gmail.com' },
    update: {},
    create: {
      firstName: 'Admin',
      email: 'mahadnyanzi@gmail.com',
      phone: '0782651854',
      password: hashedPassword,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
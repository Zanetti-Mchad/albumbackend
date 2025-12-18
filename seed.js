const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // TODO: add initial seed data here if you want
  // e.g. create default roles or an admin user
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
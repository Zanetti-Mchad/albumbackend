const cleanupDatabase = require("./tests/utils/cleanup");
const prisma = require("./src/config/prisma");

beforeAll(async () => {
	await cleanupDatabase();
	await prisma.$disconnect();
});

afterAll(async () => {
	await cleanupDatabase();
	await prisma.$disconnect();
});

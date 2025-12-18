const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  try {
    // Check if role already exists
    let role = await prisma.role.findFirst({
      where: { name: "user" }
    });
    
    if (!role) {
      // Role doesn't exist, create it
      console.log("Creating 'user' role...");
      role = await prisma.role.create({
        data: {
          name: "user",
          description: "Default user role",
          permissions: JSON.stringify([])
        }
      });
      console.log("Created role:", role);
    } else {
      console.log("Using existing role:", role);
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: "mahadnyanzi@gmail.com" }
    });
    
    if (existingUser) {
      console.log("User already exists:", {
        id: existingUser.id,
        email: existingUser.email,
        isActive: existingUser.isActive
      });
      
      // Update user password
      const hashedPassword = await bcrypt.hash("password123", 10);
      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          password: hashedPassword,
          isActive: true
        }
      });
      
      console.log("Updated user password and set as active.");
      return;
    }

    // Create the test user
    const hashedPassword = await bcrypt.hash("password123", 10);
    const user = await prisma.user.create({
      data: {
        email: "mahadnyanzi@gmail.com",
        firstName: "Test",
        lastName: "User",
        password: hashedPassword,
        roleId: role.id,
        isActive: true
      }
    });
    
    console.log("Created test user:", {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      roleId: user.roleId
    });
    
    console.log("Test user created successfully!");
  } catch (error) {
    console.error("Error creating test user:", error.message);
    if (error.meta) console.error("Error details:", error.meta);
    if (error.stack) console.error("Stack trace:", error.stack.split('\n').slice(0, 3).join('\n'));
  } finally {
    await prisma.$disconnect();
  }
}

main();

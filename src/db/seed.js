const { PrismaClient } = require('../generated/prisma');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  try {
    const email = 'kbtcsuperchat@admin.com';

    
    // Check if user already exists
    const existing = await prisma.user.findUnique({ 
      where: { email } 
    });
    
    if (!existing) {
      const hashedPassword = await bcrypt.hash('password', 10);
      
      await prisma.user.create({
        data: {
          name: 'Super Admin',
          email,
          password: hashedPassword,
          role: 'SUPERADMIN',
        },
      });
      
      console.log('✅ Superadmin created successfully');
    } else {
      console.log('ℹ️ Superadmin already exists');
    }
  } catch (error) {
    console.error('❌ Error in main function:', error);
    throw error; // Re-throw to be caught by the outer catch
  }
}

main()
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

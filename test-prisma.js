
const { prisma } = require('./src/lib/prisma');

async function testPrisma() {
  console.log('Testing Prisma/Neon connectivity...');
  try {
    const count = await prisma.analysisResult.count();
    console.log('Successfully connected! Current record count:', count);
  } catch (err) {
    console.error('Prisma Error:', err.message);
    if (err.stack) console.error(err.stack);
  } finally {
    process.exit();
  }
}

testPrisma();

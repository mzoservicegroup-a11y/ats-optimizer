import { PrismaClient } from '@prisma/client';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';

const connectionString = process.env.DATABASE_URL;

console.log('🔍 DATABASE_URL loaded:', connectionString ? 'YES ✅' : 'NO ❌');

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined.');
}

// IMPORTANT: Must set webSocketConstructor BEFORE creating Pool
if (typeof window === 'undefined') {
  try {
    const ws = require('ws');
    neonConfig.webSocketConstructor = ws;
    neonConfig.poolQueryViaFetch = false;
  } catch (e) {
    console.error('ws module not found:', e);
  }
}

// Pass connectionString explicitly - do NOT rely on env inside Pool
const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool);

declare global {
  var __prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({ adapter });
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({ adapter });
    console.log('✅ Prisma Neon Adapter Initialized');
  }
  prisma = global.__prisma;
}

export { prisma };

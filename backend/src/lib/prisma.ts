import { PrismaClient } from '../../generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from '../config';

// Create a connection pool
const pool = new Pool({ connectionString: config.database.url });

// Create Prisma adapter
const adapter = new PrismaPg(pool);

// Create Prisma Client with the adapter
export const prisma = new PrismaClient({ adapter });

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  await pool.end();
});

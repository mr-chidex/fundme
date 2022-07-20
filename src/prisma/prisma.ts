import { PrismaClient } from '@prisma/client';

const globalWithPrisma = global as typeof globalThis & {
  prisma: PrismaClient;
};
const prisma: PrismaClient = globalWithPrisma.prisma || new PrismaClient({ log: ['query'] });

if (process.env.NODE_ENV === 'development') {
  if (!globalWithPrisma.prisma) {
    globalWithPrisma.prisma = prisma;
    globalWithPrisma.prisma.$connect().then(() => {
      console.log('Database connected successfully');
    });
  }
} else {
  prisma.$connect().then(() => {
    console.log('Database connected successfully');
  });
}

export default prisma;

import { PrismaClient } from '@prisma/client';

const prisma: PrismaClient = global.prisma || new PrismaClient({ log: ['query'] });

if (process.env.NODE_ENV === 'development') {
  if (!global.prisma) {
    global.prisma = prisma;
    global.prisma.$connect().then(() => {
      console.log('Database connected successfully');
    });
  }
} else {
  prisma.$connect().then(() => {
    console.log('Database connected successfully');
  });
}

export default prisma;

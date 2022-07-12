import { PrismaClient } from '@prisma/client';

const prisma: PrismaClient = global.prisma || new PrismaClient({ rejectOnNotFound: true });

if (process.env.NODE_ENV === 'development') {
  if (!global.prisma) {
    global.prisma = prisma;
    global.prisma.then(() => {
      console.log('Database connected successfully');
    });
  }
} else {
  prisma.$connect().then(() => {
    console.log('Database connected successfully');
  });
}

export default prisma;

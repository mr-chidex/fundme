import { RequestHandler } from 'express';
// import { PrismaClient } from '@prisma/client';
// import prisma from '../prisma/prisma';

export const signup: RequestHandler = async (req, res) => {
  const { name, email, password } = req.body as { email: string; name: string; password: string };
  console.log(name, email, password);
  console.log(process.env.NODE_ENV);
  res.json({ message: 'here' });
};

import { RequestHandler } from 'express';
import bcrypt from 'bcrypt';

import { User } from '../libs/types';
import { validateSignup } from '../utils/auth.util';
import prisma from '../prisma/prisma';

export const signup: RequestHandler = async (req, res) => {
  // validate request body
  const { error, value } = validateSignup(req.body as User);
  if (error) return res.status(422).json({ message: error.details[0].message });

  const { name, email, password } = value;

  // check if email is already in use
  const userExist = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (userExist) return res.status(400).json({ status: 'error', message: 'email already in use', code: 400 });

  // if user email is new
  const salt = await bcrypt.genSalt(12);
  const hasPassword = await bcrypt.hash(password, salt);

  const user = await prisma.user.create({
    data: { name, email, password: hasPassword },
    select: { email: true, name: true },
  });

  res.status(201).json({ status: 'success', message: 'user signed up successfully', data: { user } });
};

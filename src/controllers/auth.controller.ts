import { RequestHandler } from 'express';
import bcrypt from 'bcrypt';

import { User } from '../libs/types';
import { getToken, validateAuth } from '../utils/auth.util';
import prisma from '../prisma/prisma';

/**
 * @route POST /api/v1/auth
 * @desc - signin user with email and password
 * @acces Public
 */
export const signin: RequestHandler = async (req, res) => {
  const { error, value } = validateAuth(req.body as User);
  if (error) return res.status(422).json({ status: 'error', message: error.details[0].message, code: 422 });

  const { email, password } = value;

  // check if user exist
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (!user) return res.status(400).json({ status: 'error', message: 'email or password is incorrect', code: 400 });

  // check if password is correct
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ status: 'error', message: 'email or password is incorrect', code: 400 });

  const token = getToken(user);
  res.json({ status: 'success', message: 'user logged in successfully', data: { token } });
};

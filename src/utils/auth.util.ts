import joi from 'joi';
import jwt from 'jsonwebtoken';

import { User } from '../libs/types';

export const validateAuth = (user: User) => {
  return joi
    .object({
      email: joi.string().trim().required().email().normalize(),
      password: joi.string().trim().required(),
    })
    .validate(user);
};

export const getToken = (user: User) => {
  return jwt.sign(
    {
      iat: Date.now(),
      iss: 'mr-chidex',
      id: user.id,
      email: user.email,
      name: user.name,
    },
    process.env.JWT_SECRET as string,
    { expiresIn: '24h' },
  );
};

import joi from 'joi';

import { User } from '../libs/types';

export const validateAuth = (user: User) => {
  return joi
    .object({
      email: joi.string().trim().required().email().normalize(),
      password: joi.string().trim().required(),
    })
    .validate(user);
};

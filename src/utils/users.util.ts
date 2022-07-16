import joi from 'joi';

import { Beneficiary, PayData, User } from '../libs/types';

export const validateSignup = (user: User) => {
  return joi
    .object({
      name: joi.string().min(3).trim().required(),
      email: joi.string().trim().required().email().normalize(),
      password: joi.string().min(5).trim().required(),
    })
    .validate(user);
};

export const validateFundMe = (data: { amount: number }) => {
  return joi
    .object({
      amount: joi.number().required(),
    })
    .validate(data);
};

export const validatePayData = (data: PayData) => {
  return joi
    .object({
      email: joi.string().trim().required().email().normalize(),
      amount: joi.number().required(),
    })
    .validate(data);
};

export const validateBeneficiary = (beneficiary: Beneficiary) => {
  return joi
    .object({
      name: joi.string().min(3).trim().required(),
      email: joi.string().trim().required().email().normalize(),
    })
    .validate(beneficiary);
};

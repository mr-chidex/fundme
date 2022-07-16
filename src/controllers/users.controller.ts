import { Request, RequestHandler } from 'express';
import bcrypt from 'bcrypt';

import { Beneficiary, PayData, User } from '../libs/types';
import { validateBeneficiary, validatePayData, validateSignup } from '../utils/users.util';
import prisma from '../prisma/prisma';
import { initializePayment } from '../config/paystack';
import { Prisma } from '@prisma/client';

/**
 *
 * @route POST /api/v1/users
 * @desc - signup a new user
 * @acces Public
 */
export const signup: RequestHandler = async (req, res) => {
  // validate request body
  const { error, value } = validateSignup(req.body as User);
  if (error) return res.status(422).json({ status: 'error', message: error.details[0].message, code: 422 });

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

/**
 *
 * @route GET /api/v1/users/:id
 * @desc - see user profile
 * @acces Private
 */
export const getProfile: RequestHandler = async (req: Request | any, res) => {
  const userId = req?.user?.id;

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      account: true,
      beneficiaries: true,
    },
  });

  res.json({ status: 'success', data: { user } });
};

export const addBeneficiary: RequestHandler = async (req: Request | any, res, next) => {
  const userId = req?.user?.id;

  // validate request body
  const { error, value } = validateBeneficiary(req.body as Beneficiary);
  if (error) return res.status(422).json({ status: 'error', message: error.details[0].message, code: 422 });

  const { email, name } = value;
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        beneficiaries: {
          create: {
            name,
            email,
          },
        },
      },
      include: { beneficiaries: true },
    });

    res.json({ status: 'success', message: 'beneficiary successfully added', data: { user } });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error?.code === 'P2002') {
        error.message = 'user already added as a beneficiary';
        error.code = '400';
        return next(error);
      }
    }

    next(error);
  }
};

export const fundAccount: RequestHandler = async (req, res) => {
  // validate request body
  const { error, value } = validatePayData(req.body as PayData);
  if (error) return res.status(422).json({ status: 'error', message: error.details[0].message, code: 422 });

  const { email, amount } = value;
  const data = await initializePayment({ email, amount: amount * 100 });

  res.json({ status: 'success', message: 'payment initialised successfully', data });
};

export const getUsers: RequestHandler = async (req, res) => {
  const users = await prisma.user.findMany();

  res.json({ users });
};

export const webHookVerifyPayment: RequestHandler = async (req, res) => {
  console.log('WebHook::::>', req.body);

  res.sendStatus(200);
};

/*
// callback verification function
export const verifyPayment: RequestHandler = async (req, res) => {
  const trxref = req.query.trxref as string;

  if (!trxref) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid verification request. Transaction reference not specified',
      code: 400,
    });
  }

  const data = await verifyPay(trxref);
  res.json({ message: 'verify status', data });
};

*/

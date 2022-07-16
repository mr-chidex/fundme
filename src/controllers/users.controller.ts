import { RequestHandler } from 'express';
import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

import { Beneficiary, IRequest, User } from '../libs/types';
import { validateBeneficiary, validateFundMe, validateSignup } from '../utils/users.util';
import prisma from '../prisma/prisma';
import { initializePayment } from '../config/paystack';

/**
 *
 * @route POST /api/v1/users
 * @desc - signup a new user
 * @acces Public
 */
export const signup: RequestHandler = async (req, res) => {
  // validate request body
  const { error, value } = validateSignup(req.body);
  if (error) return res.status(422).json({ status: 'error', message: error.details[0].message, code: 422 });

  const { name, email, password } = value as User;

  // check if email is already in use
  const userExist = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (userExist) return res.status(400).json({ status: 'error', message: 'Email already in use', code: 400 });

  // if user email is new
  const salt = await bcrypt.genSalt(12);
  const hasPassword = await bcrypt.hash(password, salt);

  const user = await prisma.user.create({
    data: { name, email, password: hasPassword },
    select: { email: true, name: true },
  });

  res.status(201).json({ status: 'success', message: 'User signed up successfully', data: { user } });
};

/**
 *
 * @route GET /api/v1/users/profile
 * @desc - see user profile
 * @acces Private
 */
export const getProfile: RequestHandler = async (req: IRequest, res) => {
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

/**
 *
 * @route GET /api/v1/users/beneficiary
 * @desc - see user profile
 * @acces Private
 */
export const addBeneficiary: RequestHandler = async (req: IRequest, res, next) => {
  const userId = req?.user?.id;

  // validate request body
  const { error, value } = validateBeneficiary(req.body as Beneficiary);
  if (error) return res.status(422).json({ status: 'error', message: error.details[0].message, code: 422 });

  const { email, name } = value;

  // check if intended beneficiary is a member the application
  const isUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  // if beneficiary user not found
  if (!isUser) {
    return res.status(400).json({ status: 'error', message: 'Intended beneficiary is not registered user', code: 400 });
  }

  try {
    // add to beneficiary list
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

export const fundMyAccount: RequestHandler = async (req: IRequest, res) => {
  const userId = req?.user?.id;

  // validate request body
  const { error, value } = validateFundMe(req.body);
  if (error) return res.status(422).json({ status: 'error', message: error.details[0].message, code: 422 });

  const { amount } = value as { amount: number };

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) return res.status(400).json({ status: 'error', message: 'Not a valid account', code: 400 });

  const data = await initializePayment({ email: user.email, amount: amount * 100 });

  res.json({ status: 'success', message: 'Payment initialised successfully', data });
};

export const webHookVerifyPayment: RequestHandler = async (req, res) => {
  res.sendStatus(200);

  const { data } = req.body;

  const email = data?.customer?.email;
  if (data?.status === 'success') {
    // get user
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        account: {
          select: {
            totalFund: true,
          },
        },
      },
    });

    // if user is valid
    if (user) {
      // update total funds and account history
      await prisma.user.update({
        where: {
          email,
        },
        data: {
          account: {
            create: {
              totalFund: (user.account?.totalFund || 0) + Math.floor(data?.amount / 100),
              history: {
                create: {
                  name: user.name,
                  sentBy: user.email,
                },
              },
            },
          },
        },
      });
    }
  }
  console.log('WebHook::::>', req.body);
};

export const getUsers: RequestHandler = async (req, res) => {
  const users = await prisma.user.findMany();

  res.json({ users });
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

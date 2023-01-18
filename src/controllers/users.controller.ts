import { RequestHandler } from 'express';
import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

import { Beneficiary, IRequest, PayData, User } from '../libs/types';
import { validateBeneficiary, validatePayData, validateSignup } from '../utils/users.util';
import prisma from '../prisma/prisma';
import { initializePayment } from '../config/paystack';
import { logger } from './error.controller';

/**
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
 * @route GET /api/v1/users/profile
 * @desc - see user profile
 * @acces Private
 */
export const getProfile: RequestHandler = async (req: IRequest, res) => {
  const userId = req?.userId;

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      totalFunds: true,
      beneficiaries: true,
    },
  });

  res.json({ status: 'success', data: { user } });
};

/**
 * @route PATCH /api/v1/users/beneficiary
 * @desc - add a user as beneficiary
 * @acces Private
 */
export const addBeneficiary: RequestHandler = async (req: IRequest, res, next) => {
  const userId = req?.userId;

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: { email: true },
  });

  const userEmail = user?.email;

  // validate request body
  const { error, value } = validateBeneficiary(req.body as Beneficiary);
  if (error) return res.status(422).json({ status: 'error', message: error.details[0].message, code: 422 });

  const { email, name } = value;

  // check if intended beneficiary is current user
  if (userEmail === email) {
    return res.status(400).json({ status: 'error', message: 'Cannot add yourself as a beneficiary', code: 400 });
  }

  // check if intended beneficiary is a user
  const isUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (!isUser) {
    return res
      .status(400)
      .json({ status: 'error', message: 'Intended beneficiary is not a registered user', code: 400 });
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
      select: { beneficiaries: true, email: true, name: true },
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

/**
 * @route POST /api/v1/users/transfer
 * @desc - transfer money
 * @acces Private
 */
export const sendMoney: RequestHandler = async (req: IRequest, res) => {
  const userId = req?.userId;

  // validate request body
  const { error, value } = validatePayData(req.body);
  if (error) return res.status(422).json({ status: 'error', message: error.details[0].message, code: 422 });

  const { email, amount } = value as PayData;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      beneficiaries: {
        select: {
          email: true,
        },
      },
    },
  });

  if (!user) return res.status(400).json({ status: 'error', message: 'Not a valid account', code: 400 });

  const userBeneficiaries = user?.beneficiaries;
  const userEmail = user?.email;

  // if email is passed & its not the email of logged in user:: user is trnasfering money to beneficiary
  if (email && email !== userEmail) {
    const isBeneficiary = userBeneficiaries?.some((beneficiary) => beneficiary.email === email);

    // if user not a beneficiary
    if (!isBeneficiary) {
      return res.status(400).json({ status: 'error', message: 'Can only make transfers to beneficiaries', code: 400 });
    }

    const data = await initializePayment({ email, amount: amount * 100 });

    res.json({ status: 'success', message: 'Payment initialised successfully', data });
  } else {
    // when email is not passed:: user is funding his/her self
    const data = await initializePayment({ email: userEmail, amount: amount * 100 });

    res.json({ status: 'success', message: 'Payment initialised successfully', data });
  }
};

// Verify payment with paystack webhook
// route should not be publicly available
export const webHookVerifyPayment: RequestHandler = async (req, res) => {
  const { data } = req.body;

  const email = data?.customer?.email;

  if (data?.status === 'success') {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        totalFunds: true,
      },
    });

    if (user) {
      await prisma.user.update({
        where: {
          email,
        },
        data: {
          totalFunds: (user?.totalFunds || 0) + Math.floor(data?.amount / 100),
        },
      });
    }
    
     res.sendStatus(200);
  }
  logger.log('info', 'WebHook verification');
};

// for testing purpose
export const getUsers: RequestHandler = async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      name: true,
      email: true,
      totalFunds: true,
      beneficiaries: true,
    },
  });

  res.json({ users });
};

/*
// callback verification function
export const verifyPayment: RequestHandler = async (req, res) => {
  const {trxref} = req.query as string;

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

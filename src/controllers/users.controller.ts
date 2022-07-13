import { RequestHandler } from 'express';
import bcrypt from 'bcrypt';

import { PayData, User } from '../libs/types';
import { validatePayData, validateSignup } from '../utils/users.util';
import prisma from '../prisma/prisma';
import { initializePayment, verifyPay } from '../config/paystack';

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

export const fundAccount: RequestHandler = async (req, res) => {
  // validate request body
  const { error, value } = validatePayData(req.body as PayData);
  if (error) return res.status(422).json({ status: 'error', message: error.details[0].message, code: 422 });

  const { email, amount } = value;
  const data = await initializePayment({ email, amount: amount * 100 });

  res.json({ status: 'success', message: 'payment initialised successfully', data });
};

export const verifyPayment: RequestHandler = async (req, res) => {
  const { ref } = req.body;
  const txref = req.query.txref;
  console.log('reff::: >', { ref, txref });

  const data = await verifyPay(ref || txref);
  res.json({ message: 'verify', data });
};

export const webHookVerify: RequestHandler = async (req, res) => {
  console.log('WebHook::::>', req.body);

  res.sendStatus(200);
};

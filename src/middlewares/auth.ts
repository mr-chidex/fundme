import { RequestHandler, Request } from 'express';
import jwt from 'jsonwebtoken';
import { DecodedToken } from '../libs/types';
import prisma from '../prisma/prisma';
// import { UserDoc } from "../libs/types";
// import { User } from "../models";

export const authUser: RequestHandler = async (req: Request | any, res, next) => {
  const { authorization } = req.headers;

  if (!authorization?.startsWith('Bearer')) {
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized access: Invalid token format',
      code: 401,
    });
  }

  const token = authorization.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized access: Token not found',
      code: 401,
    });
  }

  try {
    const decodeToken = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;

    const user = await prisma.user.findUnique({
      where: {
        id: decodeToken.id,
      },
    });

    if (!user) {
      res.status(403).json({ status: 'error', message: 'Forbidden access', code: 403 });
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};

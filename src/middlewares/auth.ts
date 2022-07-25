import { RequestHandler, Request } from 'express';
import jwt from 'jsonwebtoken';
import { DecodedToken } from '../libs/types';

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

  let decodeToken: any;
  try {
    decodeToken = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
  } catch (error: any) {
    error.statusCode = 403;
    return next(error);
  }
  req.userId = decodeToken.id;
  next();
};

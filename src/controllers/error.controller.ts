import { format, createLogger, transports } from 'winston';
import { Request, Response, NextFunction } from 'express';
import { Err } from '../libs/types';
const { combine, timestamp, label, prettyPrint } = format;

export const logger = createLogger({
  level: 'info',
  format: combine(label({ label: 'error occurred' }), timestamp(), prettyPrint()),
  defaultMeta: { service: 'user-service' },
  transports: [
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' }),
  ],
});

export const error = (err: Err, _req: Request, res: Response, _next: NextFunction) => {
  logger.log({
    level: 'info',
    message: err.message,
  });
  logger.log({
    level: 'error',
    message: err.message,
  });

  const code = err.statusCode || 500;

  if (process.env.NODE_ENV !== 'production') {
    logger.add(
      new transports.Console({
        format: format.simple(),
      }),
    );

    return res.status(code).json({ status: 'error', message: err.message, error: true, stack: err.stack, code });
  }

  res.status(code).json({ status: 'error', message: err.message, code });
};

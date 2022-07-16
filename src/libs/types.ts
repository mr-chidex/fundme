import { Request } from 'express';
export interface User {
  id?: number;
  name: string;
  email: string;
  password: string;
}

export interface PayData {
  email: string;
  amount: number;
}

export interface DecodedToken {
  id: number;
  email: String;
  name: String;
}

export interface Err extends Error {
  statusCode?: number;
  code?: number;
}

export type Beneficiary = {
  email: string;
  name: string;
};

export interface IRequest extends Request {
  user?: { id: number };
}

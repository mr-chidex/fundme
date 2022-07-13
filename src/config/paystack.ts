import fetch from 'node-fetch';

import { Err } from '../libs/types';

const SECRET = `Bearer ${process.env.PAYSTACK_SECRET}`;

export const initializePayment = async (data: any) => {
  try {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Authorization: SECRET,
        'content-type': 'application/json',
        'cache-control': 'no-cache',
      },
    });

    const resData = await response.json();
    return resData;
  } catch (err: any) {
    const error: Err = new Error('Failed to initialize payment. Please try again');
    error.statusCode = 502;
    throw error;
  }
};

// verify payment with callback
export const verifyPay = async (ref: string) => {
  try {
    const response = await fetch('https://api.paystack.co/transaction/verify/' + encodeURIComponent(ref), {
      method: 'GET',
      headers: {
        Authorization: SECRET,
        'content-type': 'application/json',
        'cache-control': 'no-cache',
      },
    });

    const resData = await response.json();
    return resData;
  } catch (err) {
    const error: Err = new Error('Payment verification failed');
    error.statusCode = 502;
    throw error;
  }
};

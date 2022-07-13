import fetch from 'node-fetch';

const SECRET = `Bearer ${process.env.PAYSTACK_SECRET}`;

export const initializePayment = async (data: any) => {
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
};

export const verifyPay = async (ref: string) => {
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
};

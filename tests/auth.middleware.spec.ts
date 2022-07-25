import request from 'supertest';
import { Server } from 'http';

import app from '../src/app';
import mockUser from './mocks/user.mock';
import prisma from '../src/prisma/prisma';
import { getToken } from '../src/utils/auth.util';
import { User } from '../src/libs/types';

describe('Auth User Middleware', () => {
  let token: string;
  let user: User;
  let server: Server;

  beforeAll(async () => {
    server = app.listen(4000);
    user = await prisma.user.create({
      data: {
        email: mockUser.email,
        password: mockUser.password,
        name: mockUser.name,
      },
    });
    token = getToken(user);
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { email: mockUser.email } });
    prisma.$disconnect();
    server.close();
  });

  it('should return a 401 code with token format error if token is not provided', async () => {
    const res = await request(server).get('/api/v1/users/profile').set('Authorization', '');

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toContain('token format');
  });

  it('should return a code of 401 with token format error if token does not starts with Bearer', async () => {
    const res = await request(server).get('/api/v1/users/profile').set('Authorization', 'xyz');

    expect(res.body.message).toContain('token format');
    expect(res.statusCode).toBe(401);
  });

  it('should return a 401 code with token not found error if token is not of Bearer <token> format', async () => {
    const res = await request(server).get('/api/v1/users/profile').set('Authorization', 'Bearer');

    expect(res.body.message).toContain('not found');
    expect(res.statusCode).toBe(401);
  });

  it('should return a 403 error code with invalid jwt', async () => {
    const res = await request(server).get('/api/v1/users/profile').set('Authorization', `Bearer token`);

    expect(res.body.message).toContain('jwt');
    expect(res.statusCode).toBe(403);
  });

  it('should return a 200 code after successfully decoding valid token and getting profile', async () => {
    const res = await request(server).get('/api/v1/users/profile').set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
  });
});

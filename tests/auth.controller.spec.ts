import request from 'supertest';
import { Server } from 'http';

import app from '../src/app';
import mockUser from './mocks/user.mock';
import prisma from '../src/prisma/prisma';
import { User } from '../src/libs/types';

describe('Auth - User login', () => {
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
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { email: mockUser.email } });
    prisma.$disconnect();
    server.close();
  });

  it('should return error on using invalid email type', async () => {
    const response = await request(server).post('/api/v1/auth').send({
      email: 'email',
      password: 'password',
    });
    expect(response.statusCode).toBe(422);
  });

  it('should return error on using wrong password', async () => {
    const response = await request(server).post('/api/v1/auth').send({
      email: mockUser.email,
      password: '!password',
    });

    expect(response.body.message).toMatch(/email or password/);
    expect(response.statusCode).toBe(400);
  });

  it('should return error on using wrong email', async () => {
    const response = await request(server).post('/api/v1/auth').send({
      email: 'test@email.com',
      password: 'password',
    });

    expect(response.body.message).toMatch(/email or password/);
    expect(response.statusCode).toBe(400);
  });

  it('should return user token on successful sign in', async () => {
    const response = await request(server).post('/api/v1/auth').send({
      email: mockUser.email,
      password: 'password',
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('success');
    expect(response.body.data.token).toBeDefined();
  });
});
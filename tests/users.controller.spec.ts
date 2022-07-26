import request from 'supertest';
import { Server } from 'http';

import app from '../src/app';
import mockUser from './mocks/user.mock';
import prisma from '../src/prisma/prisma';
import { User } from '../src/libs/types';

describe('Users Controller', () => {
  let user: User;
  let server: Server;

  beforeEach(async () => {
    server = await app.listen(4000);
    user = await prisma.user.create({
      data: {
        email: mockUser.email,
        password: mockUser.password,
        name: mockUser.name,
      },
    });
  });

  afterEach(async () => {
    await prisma.user.delete({ where: { email: mockUser.email } });
    prisma.$disconnect();
    server.close();
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { email: 'testUser2@email.com' } });
  });

  describe('user sign up', () => {
    it('should return error code 422 on invalid sign up details', async () => {
      const response = await request(server).post('/api/v1/users').send({ email: '', name: '', password: '' });

      expect(response.statusCode).toBe(422);
    });

    it('should return error code 400 on using already existing email', async () => {
      const response = await request(server)
        .post('/api/v1/users')
        .send({ email: 'testUser@email.com', name: 'test', password: 'tester' });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toContain('in use');
    });

    it('should return code 201 on successful sign up', async () => {
      const response = await request(server)
        .post('/api/v1/users')
        .send({ email: 'testUser2@email.com', name: 'test', password: 'tester' });
      expect(response.statusCode).toBe(201);
    });
  });
});

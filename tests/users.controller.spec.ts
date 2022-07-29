import request from 'supertest';
import { Server } from 'http';

import app from '../src/app';
import mockUser from './mocks/user.mock';
import prisma from '../src/prisma/prisma';
import { User } from '../src/libs/types';
import { getToken } from '../src/utils/auth.util';

describe('Users Controller', () => {
  let token: string;
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
    token = getToken(user);
  });

  afterEach(async () => {
    await prisma.user.delete({ where: { email: user.email } });
    prisma.$disconnect();
    server.close();
  });

  afterEach(async () => {
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

  describe(' User Profile', () => {
    it("should return user's profile", async () => {
      const response = await request(server).get('/api/v1/users/profile').set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.data).toHaveProperty('user');
    });
  });

  describe('Adding beneficiary', () => {
    it('should return error 422 on invalid beneficiary data', async () => {
      const response = await request(server)
        .patch('/api/v1/users/beneficiary')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '' });

      expect(response.statusCode).toBe(422);
    });

    it('should return error on adding yourself as beneficiary', async () => {
      const response = await request(server)
        .patch('/api/v1/users/beneficiary')
        .set('Authorization', `Bearer ${token}`)
        .send({ email: user.email, name: 'carter' });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Cannot add yourself as a beneficiary');
    });

    it('should return error if intended beneficiary is not a user', async () => {
      const response = await request(server).patch('/api/v1/users/beneficiary').set('Authorization', `Bearer ${token}`);
      // .send({ email: 'testUser22@email.com', name: 'carter' });

      console.log(response.body);
      // expect(response.statusCode).toBe(400);
      // expect(response.body.message).toBe('Cannot add yourself as a beneficiary');
    });
  });
});

import request from 'supertest';

import app from '../src/app';
import mockUser, { mockUser2 } from './mocks/user.mock';
import prisma from '../src/prisma/prisma';
import { User } from '../src/libs/types';
import { getToken } from '../src/utils/auth.util';

describe('Users Controller', () => {
  let token: string;
  let user: User;

  beforeAll(async () => {
    await prisma.beneficiary.deleteMany();
    await prisma.user.deleteMany();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
    // creating user for testing
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
    await prisma.beneficiary.deleteMany();
    // deleting created user
    await prisma.user.deleteMany();

    prisma.$disconnect();
  });

  describe('user sign up', () => {
    it('should return error code 422 on invalid sign up details', async () => {
      const response = await request(app).post('/api/v1/users').send({ email: '', name: '', password: '' });

      expect(response.statusCode).toBe(422);
    });

    it('should return error code 400 on using already existing email', async () => {
      const response = await request(app)
        .post('/api/v1/users')
        .send({ email: mockUser.email, name: 'test', password: 'password' });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toContain('in use');
    });

    it('should return code 201 on successful sign up', async () => {
      const response = await request(app)
        .post('/api/v1/users')
        .send({ email: mockUser2.email, name: mockUser2.name, password: 'password' });
      expect(response.statusCode).toBe(201);
    });
  });

  describe(' User Profile', () => {
    it("should return user's profile", async () => {
      const response = await request(app).get('/api/v1/users/profile').set('Authorization', `Bearer ${token}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.data).toHaveProperty('user');
    });
  });

  describe('Adding beneficiary', () => {
    it('should return error 422 if name is not provided', async () => {
      const response = await request(app)
        .patch('/api/v1/users/beneficiary')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '' });

      expect(response.statusCode).toBe(422);
    });

    it('should return error on adding yourself as beneficiary (your email)', async () => {
      const response = await request(app)
        .patch('/api/v1/users/beneficiary')
        .set('Authorization', `Bearer ${token}`)
        .send({ email: user.email, name: 'carter' });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Cannot add yourself as a beneficiary');
    });

    it('should return error if intended beneficiary is not a user', async () => {
      const response = await request(app)
        .patch('/api/v1/users/beneficiary')
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'testUser22@email.com', name: 'carter' });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toContain('not a registered user');
    });

    it('should add a new valid beneficiary with code 200', async () => {
      const userTwo = await prisma.user.create({
        data: {
          email: mockUser2.email,
          password: mockUser2.password,
          name: mockUser2.name,
        },
      });

      console.log(userTwo);

      const response = await request(app)
        .patch('/api/v1/users/beneficiary')
        .set('Authorization', `Bearer ${token}`)
        .send({ email: userTwo.email, name: userTwo.name });

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toEqual('success');
    });
  });
});

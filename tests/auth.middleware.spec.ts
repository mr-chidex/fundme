import request from 'supertest';

import app from '../src/app';
import mockUser from './mocks/user.mock';
import { getToken } from '../src/utils/auth.util';

describe('Auth User Middleware', () => {
  let token: string;

  beforeAll(() => {
    //getting token for testing
    token = getToken({
      id: 123,
      email: mockUser.email,
      password: mockUser.password,
      name: mockUser.name,
    });
  });

  it('should return a 401 code with token format error if token is not provided', async () => {
    const res = await request(app).get('/api/v1/users/profile').set('Authorization', '');

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toContain('token format');
  });

  it('should return a code of 401 with token format error if token does not starts with Bearer', async () => {
    const res = await request(app).get('/api/v1/users/profile').set('Authorization', 'xyz');

    expect(res.body.message).toContain('token format');
    expect(res.statusCode).toBe(401);
  });

  it('should return a 401 code with token not found error if token is not of Bearer <token> format', async () => {
    const res = await request(app).get('/api/v1/users/profile').set('Authorization', 'Bearer');

    expect(res.body.message).toContain('not found');
    expect(res.statusCode).toBe(401);
  });

  it('should return a 403 error code with invalid jwt', async () => {
    const res = await request(app).get('/api/v1/users/profile').set('Authorization', `Bearer token`);

    expect(res.body.message).toContain('jwt');
    expect(res.statusCode).toBe(403);
  });

  it('should return a 200 code after successfully decoding valid token and getting profile', async () => {
    const res = await request(app).get('/api/v1/users/profile').set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
  });
});

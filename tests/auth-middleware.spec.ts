import request from 'supertest';

import server from '../src/index';

describe('Auth User Middleware', () => {
  afterAll(() => {
    server.close();
  });

  it('should return a code of 401 if token is not provided', async () => {
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
});

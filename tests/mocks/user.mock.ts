import bcrypt from 'bcrypt';

export default {
  name: 'test user',
  email: 'testuser@email.com',
  password: bcrypt.hashSync('password', 12),
};

export const mockUser2 = {
  name: 'test user 2',
  email: 'testuser2@email.com',
  password: bcrypt.hashSync('password', 12),
};

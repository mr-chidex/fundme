import bcrypt from 'bcrypt';

export default {
  id: 0.0,
  name: 'test user',
  email: 'testuser@email.com',
  password: bcrypt.hashSync('password', 12),
};

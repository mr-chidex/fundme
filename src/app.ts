import express, { Application } from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.route';
import usersRoutes from './routes/users.route';

const app: Application = express();
dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cors());
app.use(helmet());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);

export default app;

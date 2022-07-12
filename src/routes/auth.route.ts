import expressRouter from 'express-promise-router';

import { signup } from './../controllers/auth.controller';

const router = expressRouter();

router.route('/auth/signup').post(signup);

export default router;

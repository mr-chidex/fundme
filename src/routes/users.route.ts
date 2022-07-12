import expressRouter from 'express-promise-router';

import { signup } from './../controllers/users.controller';

const router = expressRouter();

router.route('/').post(signup);

export default router;

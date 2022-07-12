import expressRouter from 'express-promise-router';

import { signin } from './../controllers/auth.controller';

const router = expressRouter();

router.route('/').post(signin);

export default router;

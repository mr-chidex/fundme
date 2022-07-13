import expressRouter from 'express-promise-router';

import { fundAccount, signup, verifyPayment, webHookVerify } from './../controllers/users.controller';

const router = expressRouter();

router.route('/').post(signup);
router.route('/fund-account').post(fundAccount);
router.route('/verify-pay').get(verifyPayment);
router.route('/web-hook').post(webHookVerify);

export default router;

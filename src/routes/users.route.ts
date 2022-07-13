import expressRouter from 'express-promise-router';

import { fundAccount, signup, webHookVerifyPayment } from './../controllers/users.controller';

const router = expressRouter();

router.route('/').post(signup);
router.route('/fund-account').post(fundAccount);
// router.route('/verify-pay').get(verifyPayment);
router.route('/web-hook').post(webHookVerifyPayment);

export default router;

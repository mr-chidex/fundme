import expressRouter from 'express-promise-router';
import { authUser } from '../middlewares/auth';

import { addBeneficiary, fundAccount, getUsers, signup, webHookVerifyPayment } from './../controllers/users.controller';

const router = expressRouter();

router.route('/').post(signup);
router.route('/fund-account').post(fundAccount);
// router.route('/verify-pay').get(verifyPayment);
router.route('/web-hook').post(webHookVerifyPayment);
router.route('/').get(getUsers);
router.route('/beneficiary').post(authUser, addBeneficiary);

export default router;

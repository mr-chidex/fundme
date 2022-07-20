import expressRouter from 'express-promise-router';
import { authUser } from '../middlewares/auth';

import { addBeneficiary, sendMoney, getProfile, signup, webHookVerifyPayment } from './../controllers/users.controller';

const router = expressRouter();

router.route('/').post(signup);
router.route('/profile').get(authUser, getProfile);
router.route('/beneficiary').patch(authUser, addBeneficiary);
router.route('/transfer').post(authUser, sendMoney);
router.route('/web-hook').post(webHookVerifyPayment);

export default router;

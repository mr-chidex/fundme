import expressRouter from 'express-promise-router';
import { authUser } from '../middlewares/auth';

import {
  addBeneficiary,
  fundMyAccount,
  getProfile,
  getUsers,
  signup,
  webHookVerifyPayment,
} from './../controllers/users.controller';

const router = expressRouter();

router.route('/').post(signup).get(getUsers);
router.route('/fund-account').post(authUser, fundMyAccount);
// router.route('/verify-pay').get(verifyPayment);
router.route('/web-hook').post(webHookVerifyPayment);
router.route('/beneficiary').post(authUser, addBeneficiary);
router.route('/:id').get(authUser, getProfile);

export default router;

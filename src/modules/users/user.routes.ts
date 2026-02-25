import { Router } from 'express';
import { getProfile, updateProfile, updatePassword, deleteAccount} from './controllers/user.controller';
import { ensureAuthenticated } from '../../shared/middlewares/auth.middleware';

const router = Router();

router.use(ensureAuthenticated);

router.get('/me', getProfile);
router.put('/me', updateProfile);
router.put('/me/password', updatePassword);
router.delete('/me', deleteAccount);

export default router;
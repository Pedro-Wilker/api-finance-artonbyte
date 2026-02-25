import { Router } from 'express';
import { login, register, verifyEmail } from './controllers/auth.controller';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);

export default router;
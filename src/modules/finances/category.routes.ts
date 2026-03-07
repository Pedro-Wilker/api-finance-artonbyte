import { Router } from 'express';
import { listCategories, createCategory } from './controllers/category.controller';
import { ensureAuthenticated } from '../../shared/middlewares/auth.middleware';

const router = Router();

router.use(ensureAuthenticated);

router.get('/', listCategories);
router.post('/', createCategory);

export default router;
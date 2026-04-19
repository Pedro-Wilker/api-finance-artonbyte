import { Router } from 'express';
import { ensureAuthenticated } from '../../shared/middlewares/auth.middleware';
import { GoalController } from './controllers/goal.controller';

const router = Router();
const goalController = new GoalController();

router.use(ensureAuthenticated);

router.get('/', goalController.index);
router.post('/', goalController.create);
router.delete('/:id', goalController.delete);
router.post('/sync-system-goals', goalController.syncSystemGoals);

export default router;
import { Router } from 'express';
import { ensureAuthenticated } from '../../shared/middlewares/auth.middleware';
import { RoutineController } from './controllers/routine.controller';

const router = Router();
const routineController = new RoutineController();

router.use(ensureAuthenticated);

router.get('/', routineController.index);
router.post('/', routineController.create);

router.get('/agenda', routineController.getDailyAgenda);

router.post('/tasks', routineController.createTask);

router.patch('/tasks/:id/status', routineController.checkTask);

export default router;
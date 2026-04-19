import { Router } from 'express';
import { ensureAuthenticated } from '../../shared/middlewares/auth.middleware';
import { DemandController } from './controllers/demand.controller';

const router = Router();
const demandController = new DemandController();

router.use(ensureAuthenticated);

router.get('/', demandController.index);
router.post('/', demandController.create);

router.put('/:id', demandController.update);

router.patch('/:id/status', demandController.changeStatus);

router.delete('/:id', demandController.delete);

export default router;
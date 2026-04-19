import { Router } from 'express';
import { ensureAuthenticated } from '../../shared/middlewares/auth.middleware';
import { RoutineController } from './controllers/routine.controller';

const router = Router();
const routineController = new RoutineController();

// Blindagem de autenticação
router.use(ensureAuthenticated);

// Rotas de Rotinas Mestra
router.get('/', routineController.index);
router.post('/', routineController.create);

// 🚀 A Rota de Ouro (Cockpit Diário)
// Exemplo de uso no Front: GET /v1/routines/agenda?date=2026-04-20
router.get('/agenda', routineController.getDailyAgenda);

// Atualizar status da tarefa (Check/Uncheck)
router.patch('/tasks/:id/status', routineController.checkTask);

export default router;
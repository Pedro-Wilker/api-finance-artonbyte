import { Request, Response } from 'express';
import { RoutineService } from '../services/routine.service';
import { TaskStatus } from '@prisma/client';

export class RoutineController {

  async index(req: Request, res: Response): Promise<void> {
    try {
      const routines = await RoutineService.getUserRoutines(req.user!.id);
      res.json(routines);
    } catch (error) {
      res.status(500).json({ error: 'Erro interno ao buscar rotinas.' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const routine = await RoutineService.createRoutine(req.user!.id, req.body);
      res.status(201).json(routine);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Erro ao criar rotina.' });
    }
  }

  async createTask(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Usuário não autenticado.' });
      }

      const userId = req.user.id;
      const data = req.body;
      const task = await RoutineService.createTask(userId, data);
      return res.status(201).json(task);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getDailyAgenda(req: Request, res: Response): Promise<void> {
    try {
      const dateParam = (req.query.date as string) || new Date().toISOString();

      const cockpitData = await RoutineService.getDailyCockpit(req.user!.id, dateParam);
      res.json(cockpitData);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao montar a agenda do dia.' });
    }
  }

  async checkTask(req: Request<{ id: string }, {}, { status: TaskStatus }>, res: Response): Promise<void> {
    try {
      const { status } = req.body;
      const updatedTask = await RoutineService.updateTaskStatus(req.user!.id, req.params.id, status);
      res.json(updatedTask);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
import { Request, Response } from 'express';
import { GoalService } from '../services/goal.service';
import { prisma } from '../../../shared/prisma';

export class GoalController {

    async index(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.id;
            const goals = await GoalService.getUserGoals(userId);
            res.json(goals);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro interno ao buscar metas.' });
        }
    }

    async create(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.id;
            const goal = await GoalService.createGoal(userId, req.body);
            res.status(201).json(goal);
        } catch (error: any) {
            res.status(400).json({ error: error.message || 'Erro ao criar meta.' });
        }
    }

    async delete(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.id;
            const goalId = req.params.id as string;

            await GoalService.deleteGoal(userId, goalId);
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ error: error.message || 'Erro ao deletar meta.' });
        }
    }

    async syncSystemGoals(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.id;

            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { monthly_income: true }
            });

            const income = Number(user?.monthly_income || 0);

            await GoalService.createSystemGoals(userId, income);

            res.json({ message: 'Metas do sistema sincronizadas com sucesso!' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro interno ao sincronizar metas.' });
        }
    }
}
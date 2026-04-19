import { Request, Response } from 'express';
import { DemandService } from '../services/demand.service';
import { DemandStatus } from '@prisma/client';

export class DemandController {
  
  async index(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id; 
      const demands = await DemandService.getUserDemands(userId);
      res.json(demands);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro interno ao buscar demandas.' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const demand = await DemandService.createDemand(userId, req.body);
      res.status(201).json(demand);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Erro ao criar demanda.' });
    }
  }

  async changeStatus(req: Request<{ id: string }, {}, { status: DemandStatus }>, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const demandId = req.params.id;
      const { status } = req.body;

      if (!status) {
        res.status(400).json({ error: 'O novo status é obrigatório.' });
        return;
      }

      const updatedDemand = await DemandService.updateStatus(userId, demandId, status);
      res.json(updatedDemand);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Erro ao atualizar status.' });
    }
  }

  async update(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const demandId = req.params.id;
      const updatedDemand = await DemandService.updateDemand(userId, demandId, req.body);
      res.json(updatedDemand);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Erro ao atualizar demanda.' });
    }
  }

  async delete(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const demandId = req.params.id;
      await DemandService.deleteDemand(userId, demandId);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Erro ao deletar demanda.' });
    }
  }
}
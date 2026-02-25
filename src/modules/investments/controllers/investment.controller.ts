import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../../shared/prisma';

const createInvestmentSchema = z.object({
  type: z.enum(['stocks', 'fiis', 'etf', 'crypto', 'cdb', 'lci', 'lca', 'tesouro', 'poupanca', 'other']),
  name: z.string(),
  amount_invested: z.number(),
  quantity: z.number(),
  purchase_price: z.number(),
  purchase_date: z.string().datetime(),
  maturity_date: z.string().datetime().optional(),
  interest_rate: z.number().optional(),
  index_type: z.enum(['prefixado', 'CDI', 'IPCA', 'SELIC', 'outro']).optional(),
  broker: z.string().optional(),
});

export const createInvestment = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = createInvestmentSchema.parse(req.body);
    const investment = await prisma.investment.create({
      data: { ...data, user_id: req.user!.id }
    });
    res.status(201).json(investment);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao registrar investimento' });
  }
};

export const listPortfolio = async (req: Request, res: Response): Promise<void> => {
  const investments = await prisma.investment.findMany({
    where: { user_id: req.user!.id, is_active: true }
  });
  res.status(200).json(investments);
};
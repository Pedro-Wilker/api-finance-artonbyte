import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../../shared/prisma';
import { NotificationService } from '../../news/services/notification.service';

const createTransactionSchema = z.object({
  category_id: z.string().uuid(),
  type: z.enum(['income', 'expense']),
  amount: z.number().positive(),
  description: z.string().optional(),
  date: z.string().datetime(),
  is_recurring: z.boolean().default(false),
  recurrence_period: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  tags: z.array(z.string()).optional(),
});

export const createTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { category_id, amount, type, date } = req.body;

    const transaction = await prisma.transaction.create({
      data: { ...req.body, user_id: userId }
    });

    if (type === 'expense') {
      const transactionDate = new Date(date);
      const budget = await prisma.budget.findFirst({
        where: {
          user_id: userId,
          category_id,
          month: transactionDate.getMonth() + 1,
          year: transactionDate.getFullYear()
        },
        include: { category: true }
      });

      if (budget) {
        const totalExpenses = await prisma.transaction.aggregate({
          where: {
            user_id: userId,
            category_id,
            type: 'expense',
            date: {
              gte: new Date(transactionDate.getFullYear(), transactionDate.getMonth(), 1),
              lte: new Date(transactionDate.getFullYear(), transactionDate.getMonth() + 1, 0)
            }
          },
          _sum: { amount: true }
        });

        const totalSpent = Number(totalExpenses._sum.amount) || 0;
        const limit = Number(budget.limit_amount);
        const percentUsed = (totalSpent / limit) * 100;

        if (percentUsed >= 100) {
          NotificationService.sendBudgetLimitAlert(userId, budget.category.name, 100);
        } else if (percentUsed >= 80) {
          NotificationService.sendBudgetLimitAlert(userId, budget.category.name, 80);
        }
      }
    }

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao processar transação' });
  }
};

export const listTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { type, category_id, startDate, endDate } = req.query;

    const transactions = await prisma.transaction.findMany({
      where: {
        user_id: userId,
        type: type as any,
        category_id: category_id as string,
        date: {
          gte: startDate ? new Date(startDate as string) : undefined,
          lte: endDate ? new Date(endDate as string) : undefined,
        },
      },
      orderBy: { date: 'desc' },
      include: { category: true },
    });

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar transações' });
  }
};

export const getMonthlySummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const transactions = await prisma.transaction.findMany({
      where: {
        user_id: userId,
        date: { gte: firstDay, lte: lastDay },
      },
    });

    const summary = transactions.reduce(
      (acc, curr) => {
        const val = Number(curr.amount);
        if (curr.type === 'income') acc.income += val;
        else acc.expense += val;
        acc.balance = acc.income - acc.expense;
        return acc;
      },
      { income: 0, expense: 0, balance: 0 }
    );

    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar resumo' });
  }
};
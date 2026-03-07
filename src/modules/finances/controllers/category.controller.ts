import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../../shared/prisma';

const createCategorySchema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  type: z.enum(['income', 'expense']),
  color: z.string().optional(),
  icon: z.string().optional()
});

export const listCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    // Busca categorias que pertencem ao usuário (ou categorias globais onde user_id é null)
    let categories = await prisma.category.findMany({
      where: {
        OR: [
          { user_id: userId },
          { user_id: null }
        ]
      },
      orderBy: { name: 'asc' }
    });

    if (categories.length === 0) {
      const defaultCategories = [
        { name: 'Alimentação', type: 'expense' as const, icon: '🛒', user_id: userId },
        { name: 'Moradia', type: 'expense' as const, icon: '🏠', user_id: userId },
        { name: 'Transporte', type: 'expense' as const, icon: '🚗', user_id: userId },
        { name: 'Saúde', type: 'expense' as const, icon: '💊', user_id: userId },
        { name: 'Salário', type: 'income' as const, icon: '💼', user_id: userId },
        { name: 'Freelance', type: 'income' as const, icon: '💻', user_id: userId },
        { name: 'Investimentos', type: 'income' as const, icon: '📈', user_id: userId },
      ];

      await prisma.category.createMany({ data: defaultCategories });

      categories = await prisma.category.findMany({
        where: { user_id: userId },
        orderBy: { name: 'asc' }
      });
    }

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar categorias' });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const data = createCategorySchema.parse(req.body);

    const category = await prisma.category.create({
      data: {
        ...data,
        user_id: userId
      }
    });

    res.status(201).json(category);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues });
      return;
    }
    res.status(500).json({ error: 'Erro ao criar categoria' });
  }
};
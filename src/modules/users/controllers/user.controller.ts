import { Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../shared/prisma';

const updateProfileSchema = z.object({
  full_name: z.string().min(3).optional(),
  cpf: z.string().length(11).optional(),
  birth_date: z.string().datetime().optional(),
  monthly_income: z.number().min(0).optional(),
  dependents_count: z.number().min(0).optional(),
  tax_regime: z.enum(['CLT', 'MEI', 'PJ', 'Autonomo']).optional(),
});

const updatePasswordSchema = z.object({
  old_password: z.string().min(6),
  new_password: z.string().min(6),
});

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      select: {
        id: true,
        full_name: true,
        email: true,
        cpf: true,
        birth_date: true,
        monthly_income: true,
        dependents_count: true,
        tax_regime: true,
        created_at: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = updateProfileSchema.parse(req.body);

    const updatedUser = await prisma.user.update({
      where: { id: req.user?.id },
      data,
      select: {
        id: true,
        full_name: true,
        email: true,
        cpf: true,
        monthly_income: true,
        tax_regime: true,
        updated_at: true,
      },
    });

    res.status(200).json({ message: 'Perfil atualizado', user: updatedUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues });
      return;
    }
    if ((error as any).code === 'P2002') {
      res.status(409).json({ error: 'CPF já cadastrado por outro usuário' });
      return;
    }
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
};

export const updatePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { old_password, new_password } = updatePasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: req.user?.id } });
    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    const isValid = await bcrypt.compare(old_password, user.password_hash);
    if (!isValid) {
      res.status(401).json({ error: 'Senha atual incorreta' });
      return;
    }

    const password_hash = await bcrypt.hash(new_password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { password_hash },
    });

    res.status(200).json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues });
      return;
    }
    res.status(500).json({ error: 'Erro ao alterar senha' });
  }
};

export const deleteAccount = async (req: Request, res: Response): Promise<void> => {
  try {
  
    await prisma.user.delete({
      where: { id: req.user?.id },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir conta' });
  }
};
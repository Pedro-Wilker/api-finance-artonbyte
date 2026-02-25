import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../../../shared/prisma';
import { MailService } from '../../../shared/services/mail.service';

// ==========================================
// SCHEMAS DE VALIDAÇÃO (ZOD)
// ==========================================

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
});

const registerSchema = z.object({
  full_name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
});

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

// ==========================================
// CONTROLLERS DE AUTENTICAÇÃO
// ==========================================

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      res.status(401).json({ error: 'Credenciais inválidas' });
      return;
    }

    if (!user.email_verified) {
      res.status(403).json({ error: 'Por favor, verifique seu e-mail antes de fazer login.' });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      res.status(401).json({ error: 'Credenciais inválidas' });
      return;
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email, role: 'user' },
      process.env.JWT_SECRET || 'secret_dev_key',
      { expiresIn: '15m' }
    );

    res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues });
      return;
    }
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { full_name, email, password } = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ error: 'E-mail já cadastrado' });
      return;
    }

    const password_hash = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        full_name,
        email,
        password_hash,
        email_verified: false,
      },
      select: {
        id: true,
        full_name: true,
        email: true,
        created_at: true,
      }
    });

    const rawToken = uuidv4();
    const token_hash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000); 

    await prisma.verificationToken.create({
      data: {
        user_id: newUser.id,
        token_hash,
        expires_at
      }
    });

    MailService.sendVerificationEmail(newUser.email, rawToken);

    res.status(201).json({
      message: 'Usuário registrado com sucesso. Verifique seu e-mail para ativar a conta.',
      user: newUser
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues });
      return;
    }
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.params.token as string;
    
    const token_hash = crypto.createHash('sha256').update(token).digest('hex');

    const verificationRecord = await prisma.verificationToken.findUnique({
      where: { token_hash }
    });

    if (!verificationRecord || verificationRecord.expires_at < new Date()) {
      res.status(400).json({ error: 'Link de verificação inválido ou expirado.' });
      return;
    }

    await prisma.user.update({
      where: { id: verificationRecord.user_id },
      data: { email_verified: true }
    });

    await prisma.verificationToken.delete({
      where: { id: verificationRecord.id }
    });

    res.status(200).json({ message: 'E-mail verificado com sucesso! Agora você pode fazer login.' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao verificar e-mail' });
  }
};

// ==========================================
// CONTROLLERS DE PERFIL
// ==========================================

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
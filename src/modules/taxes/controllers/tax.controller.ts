import { Request, Response } from 'express';
import { TaxService } from '../services/tax.service';
import { prisma } from '../../../shared/prisma';

export const calculateTaxes = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    
    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    const grossIncome = Number(user.monthly_income);
    const inss = TaxService.calculateINSS(grossIncome);
    const taxableIncome = grossIncome - inss;
    const irpf = TaxService.calculateIRPF(taxableIncome, user.dependents_count);

    const calculation = await prisma.taxCalculation.create({
      data: {
        user_id: user.id,
        year: new Date().getFullYear(),
        gross_income: grossIncome,
        deductions: inss, 
        taxable_income: taxableIncome,
        irpf_amount: irpf,
        inss_amount: inss
      }
    });

    res.status(200).json(calculation);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao calcular impostos' });
  }
};

export const getIRPFReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear() - 1;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    const incomeResult = await prisma.transaction.aggregate({
      where: {
        user_id: userId,
        type: 'income',
        date: {
          gte: new Date(`${year}-01-01T00:00:00.000Z`),
          lte: new Date(`${year}-12-31T23:59:59.999Z`),
        }
      },
      _sum: { amount: true }
    });
    const grossIncome = Number(incomeResult._sum.amount || 0);

    const deductionsResult = await prisma.transaction.aggregate({
      where: {
        user_id: userId,
        type: 'expense',
        tags: { hasSome: ['saude', 'educação', 'previdencia', 'dedutivel'] },
        date: {
          gte: new Date(`${year}-01-01T00:00:00.000Z`),
          lte: new Date(`${year}-12-31T23:59:59.999Z`),
        }
      },
      _sum: { amount: true }
    });
    const deductions = Number(deductionsResult._sum.amount || 0);

    const taxableIncome = Math.max(0, grossIncome - deductions);

  
    const monthlyBase = taxableIncome / 12;
    const monthlyIRPF = TaxService.calculateIRPF(monthlyBase, user.dependents_count);
    const annualIRPF = monthlyIRPF * 12;

    const calculation = await prisma.taxCalculation.create({
      data: {
        user_id: userId,
        year,
        gross_income: grossIncome,
        deductions,
        taxable_income: taxableIncome,
        irpf_amount: annualIRPF,
        inss_amount: 0, 
      }
    });

    res.status(200).json({
      message: `Relatório de IRPF gerado para o ano-calendário ${year}`,
      report: {
        year,
        dependents: user.dependents_count,
        gross_income: grossIncome,
        total_deductions: deductions,
        taxable_base: taxableIncome,
        estimated_tax: annualIRPF
      },
      metadata: { calculation_id: calculation.id }
    });

  } catch (error) {
    console.error('Erro ao gerar relatório IRPF:', error);
    res.status(500).json({ error: 'Erro interno ao gerar relatório de IRPF' });
  }
};
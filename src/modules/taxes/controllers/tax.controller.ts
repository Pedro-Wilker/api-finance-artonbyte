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
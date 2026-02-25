import { Request, Response } from 'express';
import { AmortizationService } from '../services/amortization.service';

export const simulateFinancing = async (req: Request, res: Response) => {
    const { amount, rateAnnual, months, system } = req.body;
    const rateMonth = Math.pow(1 + rateAnnual / 100, 1 / 12) - 1;

    const results = system === 'SAC'
        ? AmortizationService.calculateSAC(amount, rateMonth, months)
        : AmortizationService.calculatePRICE(amount, rateMonth, months);

    res.status(200).json({
        totalInterest: results.reduce((acc, curr) => acc + curr.interest, 0),
        totalPaid: results.reduce((acc, curr) => acc + curr.installmentValue, 0),
        installments: results
    });
};
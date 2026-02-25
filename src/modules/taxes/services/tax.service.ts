export class TaxService {
  static calculateINSS(grossSalary: number) {
    let inss = 0;
    if (grossSalary <= 1412) inss = grossSalary * 0.075;
    else if (grossSalary <= 2666.68) inss = grossSalary * 0.09;
    else if (grossSalary <= 4000.03) inss = grossSalary * 0.12;
    else inss = Math.min(grossSalary * 0.14, 908.85); 
    return Number(inss.toFixed(2));
  }

  static calculateIRPF(taxableIncome: number, dependents: number) {
    const deductionPerDependent = 189.59;
    const baseCalculation = taxableIncome - (dependents * deductionPerDependent);
    
    let tax = 0;
    if (baseCalculation <= 2259.20) tax = 0;
    else if (baseCalculation <= 2826.65) tax = (baseCalculation * 0.075) - 169.44;
    else if (baseCalculation <= 3751.05) tax = (baseCalculation * 0.15) - 381.44;
    else if (baseCalculation <= 4664.68) tax = (baseCalculation * 0.225) - 662.77;
    else tax = (baseCalculation * 0.275) - 896.00;

    return Math.max(0, Number(tax.toFixed(2)));
  }
}
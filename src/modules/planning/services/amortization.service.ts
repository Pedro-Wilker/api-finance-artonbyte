export class AmortizationService {
  static calculateSAC(value: number, rateMonth: number, months: number) {
    const amortization = value / months;
    let balance = value;
    const installments = [];

    for (let i = 1; i <= months; i++) {
      const interest = balance * rateMonth;
      const installmentValue = amortization + interest;
      balance -= amortization;
      installments.push({ month: i, installmentValue, interest, amortization, balance: Math.max(0, balance) });
    }
    return installments;
  }

  static calculatePRICE(value: number, rateMonth: number, months: number) {
    const installmentValue = (value * rateMonth) / (1 - Math.pow(1 + rateMonth, -months));
    let balance = value;
    const installments = [];

    for (let i = 1; i <= months; i++) {
      const interest = balance * rateMonth;
      const amortization = installmentValue - interest;
      balance -= amortization;
      installments.push({ month: i, installmentValue, interest, amortization, balance: Math.max(0, balance) });
    }
    return installments;
  }
}
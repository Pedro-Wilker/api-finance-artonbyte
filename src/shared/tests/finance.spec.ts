import { TaxService } from '../../modules/taxes/services/tax.service';
import { AmortizationService } from '../../modules/planning/services/amortization.service';

describe('Cálculos Financeiros (Motores de Precisão)', () => {

    test('Deve calcular o INSS corretamente para salário CLT', () => {
        const inss = TaxService.calculateINSS(3000);
        expect(inss).toBeGreaterThan(0);
        expect(inss).toBeLessThan(3000 * 0.14);
    });

    test('Deve calcular IRPF como Isento para base baixa', () => {
        const irpf = TaxService.calculateIRPF(2000, 0);
        expect(irpf).toBe(0);
    });

    test('Simulação SAC deve reduzir o valor da parcela ao longo do tempo', () => {
        const results = AmortizationService.calculateSAC(100000, 0.01, 12);
        expect(results[0].installmentValue).toBeGreaterThan(results[11].installmentValue);

        expect(results[11].balance).toBeCloseTo(0, 2);
    });

    test('Simulação PRICE deve manter parcelas fixas', () => {
        const results = AmortizationService.calculatePRICE(100000, 0.01, 12);
        expect(results[0].installmentValue).toBeCloseTo(results[5].installmentValue, 2);
    });
});
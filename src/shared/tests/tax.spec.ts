import request from 'supertest';
import { app } from '../../server';
import { prisma } from '../prisma';
import { redis } from '../infra/redis';

describe('Taxes Endpoints (Integration)', () => {
  let token: string;
  let userId: string;
  let categoryId: string;

  beforeAll(async () => {
    // 1. Limpeza rigorosa
    await prisma.transaction.deleteMany();
    await prisma.category.deleteMany();
    await prisma.taxCalculation.deleteMany();
    await prisma.verificationToken.deleteMany();
    await prisma.user.deleteMany();

    // 2. Registra o usuário
    await request(app).post('/v1/auth/register').send({
      full_name: 'Contribuinte Teste',
      email: 'irpf@teste.com',
      password: 'SenhaForte123'
    });

    // 3. Ativa a conta e seta dependentes
    const user = await prisma.user.update({
      where: { email: 'irpf@teste.com' },
      data: { email_verified: true, dependents_count: 1 }
    });
    userId = user.id;

    // 4. Faz o Login 
    const authRes = await request(app).post('/v1/auth/login').send({
      email: 'irpf@teste.com',
      password: 'SenhaForte123'
    });
    
    if (authRes.statusCode !== 200) {
      throw new Error(`Erro ao logar no teste: ${JSON.stringify(authRes.body)}`);
    }
    token = authRes.body.token;

    // 5. Injeta Dados Financeiros
    const category = await prisma.category.create({
      data: { name: 'Geral', type: 'income' }
    });
    categoryId = category.id;

    await prisma.transaction.createMany({
      data: [
        { user_id: userId, category_id: categoryId, type: 'income', amount: 50000, date: new Date('2025-05-10') },
        { user_id: userId, category_id: categoryId, type: 'income', amount: 30000, date: new Date('2025-08-20') },
        { user_id: userId, category_id: categoryId, type: 'expense', amount: 5000, date: new Date('2025-06-15'), tags: ['saude'] },
        { user_id: userId, category_id: categoryId, type: 'expense', amount: 3000, date: new Date('2025-09-10'), tags: ['educação'] },
        { user_id: userId, category_id: categoryId, type: 'expense', amount: 2000, date: new Date('2025-10-05'), tags: ['lazer'] },
      ]
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await redis.quit();
  });

  it('Deve gerar o relatório de IRPF agregando corretamente receitas e deduções', async () => {
    const res = await request(app)
      .get('/v1/taxes/irpf/report?year=2025')
      .set('Authorization', `Bearer ${token}`);

    if (res.statusCode !== 200) console.error(res.body);
    expect(res.statusCode).toEqual(200);
    
    expect(res.body.report.year).toEqual(2025);
    expect(res.body.report.gross_income).toEqual(80000); 
    expect(res.body.report.total_deductions).toEqual(8000); 
    expect(res.body.report.taxable_base).toEqual(72000);
    expect(res.body.report.dependents).toEqual(1);
    
    const calcDb = await prisma.taxCalculation.findFirst({ 
      where: { user_id: userId, year: 2025 } 
    });
    
    expect(calcDb).not.toBeNull();
    expect(Number(calcDb?.taxable_income)).toEqual(72000);
  });
});
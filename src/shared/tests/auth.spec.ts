import request from 'supertest';
import { app } from '../../server';
import { prisma } from '../prisma';
import { redis } from '../infra/redis';

describe('Auth Endpoints (Integration)', () => {
  beforeAll(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await redis.quit(); 
  });

  const testUser = {
    full_name: 'Usuário Teste E2E',
    email: 'testee2e@example.com',
    password: 'senhaSegura123',
  };

  it('Deve registrar um novo usuário com sucesso', async () => {
    const res = await request(app)
      .post('/v1/auth/register')
      .send(testUser);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user.email).toEqual(testUser.email);
  });

  it('Não deve permitir registrar o mesmo e-mail duas vezes', async () => {
    const res = await request(app)
      .post('/v1/auth/register')
      .send(testUser);

    expect(res.statusCode).toEqual(409);
    expect(res.body).toHaveProperty('error');
  });

  it('Deve fazer login e retornar um JWT', async () => {
    const res = await request(app)
      .post('/v1/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    
    const tokenParts = res.body.token.split('.');
    expect(tokenParts.length).toBe(3);
  });
});
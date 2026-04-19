import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API - Gestão Financeira',
    version: '1.0.0',
    description: 'Documentação oficial da API de Gestão Financeira Pessoal',
  },
  servers: [{ url: 'http://localhost:3000', description: 'Servidor Local' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/v1/auth/register': {
      post: {
        summary: 'Registra um novo usuário',
        tags: ['Auth'],
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  full_name: { type: 'string', example: 'João Silva' },
                  email: { type: 'string', example: 'joao@email.com' },
                  password: { type: 'string', example: 'Senha123' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Criado com sucesso' },
          409: { description: 'E-mail já cadastrado' },
        },
      },
    },
    '/v1/auth/login': {
      post: {
        summary: 'Autentica o usuário',
        tags: ['Auth'],
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', example: 'irpf@teste.com' },
                  password: { type: 'string', example: 'SenhaForte123' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login realizado com sucesso' },
          401: { description: 'Credenciais inválidas' },
        },
      },
    },
    
    '/v1/transactions': {
      get: {
        summary: 'Lista as transações do usuário',
        tags: ['Transações'],
        responses: { 200: { description: 'Sucesso' } },
      },
      post: {
        summary: 'Cria uma transação',
        tags: ['Transações'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  category_id: { type: 'string' },
                  type: { type: 'string', example: 'income' },
                  amount: { type: 'number', example: 1500 },
                  date: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Transação criada' } },
      },
    },
    '/v1/transactions/summary/monthly': {
      get: {
        summary: 'Resumo mensal',
        tags: ['Transações'],
        responses: { 200: { description: 'Sucesso' } },
      },
    },

    '/v1/investments': {
      get: {
        summary: 'Lista portfólio',
        tags: ['Investimentos'],
        responses: { 200: { description: 'Sucesso' } },
      },
      post: {
        summary: 'Adiciona investimento',
        tags: ['Investimentos'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  type: { type: 'string', example: 'stocks' },
                  name: { type: 'string', example: 'PETR4' },
                  amount_invested: { type: 'number', example: 5000 },
                  quantity: { type: 'number', example: 100 },
                  purchase_price: { type: 'number', example: 50 },
                  purchase_date: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Criado' } },
      },
    },

    '/v1/taxes/irpf/report': {
      get: {
        summary: 'Gera relatório de IRPF',
        tags: ['Impostos'],
        parameters: [
          { name: 'year', in: 'query', schema: { type: 'integer' }, example: 2025 }
        ],
        responses: { 200: { description: 'Relatório gerado' } },
      },
    },
    '/v1/planning/financing/simulate': {
      post: {
        summary: 'Simula financiamento',
        tags: ['Planejamento'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  amount: { type: 'number', example: 100000 },
                  months: { type: 'number', example: 120 },
                  annual_interest_rate: { type: 'number', example: 10.5 },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Simulação gerada' } },
      },
    },
  },
};

const options: swaggerJsdoc.Options = {
  definition: swaggerDefinition,
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
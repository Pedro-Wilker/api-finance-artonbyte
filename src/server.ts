import express from 'express';
import http from 'http';
import helmet from 'helmet';
import cors from 'cors';

import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import transactionRoutes from './modules/finances/transaction.routes';
import investmentRoutes from './modules/investments/investment.routes';
import planningRoutes from './modules/planning/planning.routes';
import taxRoutes from './modules/taxes/tax.routes';
import marketRoutes from './modules/news/news.routes'; 
import categoryRoutes from './modules/finances/category.routes';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './shared/docs/swagger';
import { setupWebSocket } from './shared/infra/socket';
import { setupJobs } from './shared/infra/cron';

const app = express();
const server = http.createServer(app);

if (process.env.NODE_ENV !== 'test') {
  setupWebSocket(server);
  setupJobs();
}

app.use(helmet());
app.use(cors());
app.use(express.json()); 

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', version: '1.0.0', uptime: process.uptime() });
});

app.use('/v1/auth', authRoutes);
app.use('/v1/users', userRoutes);
app.use('/v1/transactions', transactionRoutes);
app.use('/v1/categories', categoryRoutes);
app.use('/v1/investments', investmentRoutes);
app.use('/v1/planning', planningRoutes);
app.use('/v1/taxes', taxRoutes);
app.use('/v1/market', marketRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "Docs - Gestão Financeira"
}));

const PORT = process.env.PORT || 3000;

export { app };

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`🚀 API e WebSocket rodando na porta ${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  });
}
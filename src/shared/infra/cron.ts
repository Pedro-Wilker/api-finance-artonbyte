import cron from 'node-cron';
import { MarketService } from '../../modules/news/services/market.service';
import { io } from './socket';

export const setupJobs = () => {
    cron.schedule('0 * * * *', async () => {
        try {
            const selic = await MarketService.getSelicRate();

            io.of('/market').emit('market:rates', {
                selic: `${selic}%`,
                updatedAt: new Date()
            });

            console.log('✅ [Cron] Taxas de mercado atualizadas (1h).');
        } catch (error) {
            console.error('❌ [Cron] Erro ao buscar taxas:', error);
        }
    });

    cron.schedule('*/15 * * * *', async () => {
        try {
            const news = await MarketService.getLatestNews();
            io.of('/market').emit('market:news', news);
            console.log('✅ [Cron] Notícias enviadas via WebSocket.');
        } catch (error) {
            console.error('❌ [Cron] Erro no job de notícias:', error);
        }
    });
};
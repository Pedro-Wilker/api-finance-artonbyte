import { Router } from 'express';
import { ensureAuthenticated } from '../../shared/middlewares/auth.middleware';
import { MarketService } from './services/market.service';

const router = Router();

router.get('/news', ensureAuthenticated, async (req, res) => {
  try {
    // Busca tudo em paralelo para ser super rápido!
    const [news, selic, currencies] = await Promise.all([
      MarketService.getLatestNews(),
      MarketService.getSelicRate(),
      MarketService.getCurrencies()
    ]);

    res.json({
      news: news || [],
      selic: selic || '---',
      currencies: currencies || {}
    });
  } catch (error) {
    console.error('Erro na rota de notícias:', error);
    res.status(500).json({ error: "Erro ao carregar dados do mercado" });
  }
});

export default router;
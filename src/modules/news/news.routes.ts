import { Router } from 'express';
import { ensureAuthenticated } from '../../shared/middlewares/auth.middleware';

const router = Router();

router.get('/news', ensureAuthenticated, async (req, res) => {
  try {
    const news = [{ title: "Mercado reage à Selic", source: "BCB", date: new Date() }];
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: "Erro ao carregar notícias" });
  }
});

export default router;
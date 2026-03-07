import axios from 'axios';
import { redis } from '../../../shared/infra/redis';

export class MarketService {
  private static apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  private static newsApiKey = process.env.NEWS_API_KEY;
  private static bcbUrl = process.env.BCB_API_URL || 'https://api.bcb.gov.br/dados/serie/bcdata.sgs';

  static async getSelicRate() {
    const cacheKey = 'market:rates:selic';
    const cached = await redis.get(cacheKey);
    if (cached) return cached;

    try {
      const url = `${this.bcbUrl}/11/dados/ultimos/1?formato=json`;
      const response = await axios.get(url);
      const selic = response.data[0]?.valor;

      if (selic) await redis.setex(cacheKey, 3600, selic);
      return selic;
    } catch (e) {
      return null;
    }
  }

  static async getCurrencies() {
    const cacheKey = 'market:currencies';
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    try {
      const url = 'https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,BTC-BRL';
      const response = await axios.get(url);
      
      if (response.data) {
        await redis.setex(cacheKey, 300, JSON.stringify(response.data)); 
        return response.data;
      }
    } catch (e) {
      return null;
    }
  }

static async getLatestNews() {
    const cacheKey = 'market:news:br_mixed'; 
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    try {
      const businessUrl = `https://newsapi.org/v2/top-headlines?country=br&category=business&apiKey=${this.newsApiKey}`;
      
      const politicsUrl = `https://newsapi.org/v2/everything?q="STF" OR "Câmara dos Deputados" OR "Senado" OR "Governo"&language=pt&sortBy=publishedAt&apiKey=${this.newsApiKey}`;

      const [businessRes, politicsRes] = await Promise.all([
        axios.get(businessUrl).catch(() => ({ data: { articles: [] } })),
        axios.get(politicsUrl).catch(() => ({ data: { articles: [] } }))
      ]);

      const combinedNews = [
        ...(businessRes.data.articles || []), 
        ...(politicsRes.data.articles || [])
      ];

      const validNews = combinedNews.filter(a => a.title && a.title !== '[Removed]');
      const uniqueNews = Array.from(new Map(validNews.map(item => [item.title, item])).values());

      uniqueNews.sort((a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

      const finalNews = uniqueNews.slice(0, 20);

      if (finalNews.length > 0) {
        await redis.setex(cacheKey, 900, JSON.stringify(finalNews));
      }
      
      return finalNews;
    } catch (e) {
      console.error("Erro ao buscar notícias combinadas:", e);
      return [];
    }
  }
}
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

    const url = `${this.bcbUrl}/11/dados/ultimos/1?formato=json`;
    const response = await axios.get(url);
    const selic = response.data[0]?.valor;

    if (selic) {
      await redis.setex(cacheKey, 3600, selic);
    }

    return selic;
  }

  static async getStockQuote(ticker: string) {
    const cacheKey = `market:stock:${ticker}`;
    
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}.SAO&apikey=${this.apiKey}`;
    const response = await axios.get(url);
    const data = response.data['Global Quote'];

    if (data) {
      await redis.setex(cacheKey, 300, JSON.stringify(data));
    }

    return data;
  }

  static async getLatestNews() {
  const cacheKey = 'market:news:latest';
  
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const url = `https://newsapi.org/v2/top-headlines?category=business&apiKey=${this.newsApiKey}`;
  const response = await axios.get(url);
  const news = response.data.articles;

  if (news) {
    await redis.setex(cacheKey, 900, JSON.stringify(news));
  }

  return news;
}
}
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT) || 6379,
  retryStrategy(times) {
    return Math.min(times * 100, 3000);
  }
});

redis.on('error', (err) => {
  console.error('⚠️ [Redis] Aguardando conexão. O servidor Redis não foi encontrado na porta 6379.');
});

export { redis };
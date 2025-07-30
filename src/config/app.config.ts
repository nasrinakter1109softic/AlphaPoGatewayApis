import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  db: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
    name: process.env.DB_NAME,
  },
  alphapo: {
    apiKey: process.env.ALPHAPO_API_KEY,
    secretKey: process.env.ALPHAPO_SECRET_KEY,
    baseUrl:
      process.env.ALPHAPO_BASE_URL ||
      'https://app.sandbox.cryptoprocessing.com',
  },
  s3: {
    bucket: process.env.S3_BUCKET,
    accessKey: process.env.S3_ACCESS_KEY,
    secretKey: process.env.S3_SECRET_KEY,
    region: process.env.S3_REGION,
  },
}));

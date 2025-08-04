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
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
  jwtRefresh: {
    secret: process.env.JWT_REFRESH_SECRET,
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASS,
  },
  mail: {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    username: process.env.MAIL_USERNAME,
    password: process.env.MAIL_PASSWORD,
    from: process.env.MAIL_FROM_ADDRESS,
    fromName: process.env.MAIL_FROM_NAME,
    encryption: process.env.MAIL_ENCRYPTION,
  },
  sms: {
    url: process.env.ALPHA_SMS_URL,
    apiKey: process.env.ALPHA_SMS_API_KEY,
  },
}));

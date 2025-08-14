import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config(); // to load from .env

export default new DataSource({
  type: 'postgres',

  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  url: process.env.DATABASE_URL,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  // logging: true,
});

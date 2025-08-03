import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getTypeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  //  url: configService.get('DATABASE_URL'),
  host: configService.get('DB_HOST'),
  port: +(configService.get<number>('DB_PORT') ?? 5432),
  username: configService.get('DB_USER'),
  password: configService.get('DB_PASS'),
  database: configService.get('DB_NAME'),
  autoLoadEntities: true,
  synchronize: true,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
});

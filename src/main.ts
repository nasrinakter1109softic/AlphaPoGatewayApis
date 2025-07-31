import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe (strict)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove non-whitelisted fields
      forbidNonWhitelisted: true, // Throw error if non-whitelisted fields exist
      transform: true, // Auto-convert types (string → number, etc.)
    }),
  );
  //  Global error handler
  app.useGlobalFilters(app.get(AllExceptionsFilter));

  // Success response formatter (only for success)
  app.useGlobalInterceptors(app.get(ResponseInterceptor));
  
  //  Set global route prefix
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}/api/v1`);
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { BaseException } from './common/exceptions/base.exception';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        const fields = errors.map((err) => {
          let message = 'Invalid value';
          if (err.constraints) {
            message = Object.values(err.constraints).join(', ');
          }
          return {
            path: err.property,
            message,
          };
        });
        return new BaseException(
          'VALIDATION_ERROR',
          'One or more fields are invalid',
          400,
          fields,
        );
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('Budgy_api')
    .setDescription('Budgy app apis')
    .setVersion('1.0')
    .addTag('budgy')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('budgy/api-doc', app, document);
  await app.listen(process.env.PORT);
  console.log(
    `Application is running on: ${await app.getUrl()}/budgy/api \n Swagger Document : http://[::1]:8000/budgy/api-doc`,
  );
}
bootstrap();

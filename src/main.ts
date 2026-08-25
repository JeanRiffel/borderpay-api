import { NestFactory } from '@nestjs/core';
import { GeneralModule } from './general.modules';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(GeneralModule);

  const config = new DocumentBuilder()
    .setTitle('API Example')
    .setDescription('API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.LOCAL_PORT, () =>
    console.log(`Server is running on port ${process.env.LOCAL_PORT} `),
  );
}
bootstrap();

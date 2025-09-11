import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Growtodo API')
    .setDescription('Todo + Auth APIs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Serve swagger JSON at /swagger-json
  app.getHttpAdapter().get('/swagger-json', (_, res) => {
    res.json(document);
  });

  // Serve Redoc UI at /docs
  app.getHttpAdapter().get('/docs', (_, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Growtodo API Docs</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
      </head>
      <body>
        <div id="redoc-container"></div>
        <script>
          Redoc.init('/swagger-json', {
            scrollYOffset: 50
          }, document.getElementById('redoc-container'));
        </script>
      </body>
    </html>
  `);
  });

  await app.listen(3000);
}
bootstrap();

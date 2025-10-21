import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend access
  app.enableCors({
    origin: process.env.FRONTEND_URL || '*', // Restrict to frontend URL in production
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('GrowTodo API')
    .setDescription('Todo + Auth APIs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);

  // Serve OpenAPI JSON at /swagger-json
  app.getHttpAdapter().get('/swagger-json', (_, res) => {
    res.json(document);
  });

  // Serve Redoc UI at /api
  app.getHttpAdapter().get('/api', (_, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>GrowTodo API Docs</title>
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

  // Use dynamic port for Render
  const port = process.env.PORT || 543;
  await app.listen(port);
  console.log(`Server running on port ${port}`);
}
bootstrap();

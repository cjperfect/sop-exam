import 'dotenv/config'
import { NestFactory } from '@nestjs/core'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import cookieParser from 'cookie-parser'
import { AppModule } from './app.module.js'
import { ResponseInterceptor } from './common/response.interceptor.js'
import { ApiExceptionFilter } from './common/exception.filter.js'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Cookie parser
  app.use(cookieParser())

  // 全局统一响应格式 { code, msg, data }
  app.useGlobalInterceptors(new ResponseInterceptor())
  app.useGlobalFilters(new ApiExceptionFilter())

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('SOP 在线学习考核平台 API')
    .setDescription('SOP 问答系统的后端 API 接口文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)

  const port = process.env.PORT || 3001
  await app.listen(port)
  console.log(`🚀 Backend server running on http://localhost:${port}`)
  console.log(`📚 Swagger docs at http://localhost:${port}/api/docs`)
}

bootstrap()

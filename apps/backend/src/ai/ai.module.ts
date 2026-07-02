import { Module } from '@nestjs/common'
import { AiController } from './ai.controller.js'
import { AiService } from './ai.service.js'
import { DeepSeekProvider } from './deepseek.provider.js'

@Module({
  controllers: [AiController],
  providers: [DeepSeekProvider, AiService],
  exports: [AiService],
})
export class AiModule {}

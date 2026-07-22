import { Module } from '@nestjs/common'
import { AiController } from './ai.controller.js'
import { AiService } from './ai.service.js'
import { DeepSeekService } from './deepseek.service.js'
import { SopsModule } from '../sops/sops.module.js'
import { ExamConfigModule } from '../exam-config/exam-config.module.js'
import { ExamsModule } from '../exams/exams.module.js'

@Module({
  imports: [SopsModule, ExamConfigModule, ExamsModule],
  controllers: [AiController],
  providers: [DeepSeekService, AiService],
  exports: [AiService, DeepSeekService],
})
export class AiModule {}

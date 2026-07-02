import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module.js'
import { ExamConfigController } from './exam-config.controller.js'
import { ExamConfigService } from './exam-config.service.js'

@Module({
  imports: [PrismaModule],
  controllers: [ExamConfigController],
  providers: [ExamConfigService],
  exports: [ExamConfigService],
})
export class ExamConfigModule {}

import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module.js'
import { AiModule } from '../ai/ai.module.js'
import { SubmissionsController } from './submissions.controller.js'
import { SubmissionsService } from './submissions.service.js'

@Module({
  imports: [PrismaModule, AiModule],
  controllers: [SubmissionsController],
  providers: [SubmissionsService],
  exports: [SubmissionsService],
})
export class SubmissionsModule {}

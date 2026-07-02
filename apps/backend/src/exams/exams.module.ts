import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module.js'
import { ExamsController } from './exams.controller.js'
import { ExamsService } from './exams.service.js'

@Module({
  imports: [PrismaModule],
  controllers: [ExamsController],
  providers: [ExamsService],
  exports: [ExamsService],
})
export class ExamsModule {}

import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module.js'
import { SopsController } from './sops.controller.js'
import { AdminSopsController } from './admin-sops.controller.js'
import { SopsService } from './sops.service.js'

@Module({
  imports: [PrismaModule],
  controllers: [SopsController, AdminSopsController],
  providers: [SopsService],
  exports: [SopsService],
})
export class SopsModule {}

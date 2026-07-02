import { Module } from '@nestjs/common'
import { AppController } from './app.controller.js'
import { PrismaModule } from './prisma/prisma.module.js'
import { AuthModule } from './auth/auth.module.js'
import { SopsModule } from './sops/sops.module.js'
import { ExamsModule } from './exams/exams.module.js'
import { UsersModule } from './users/users.module.js'
import { NotesModule } from './notes/notes.module.js'
import { DashboardModule } from './dashboard/dashboard.module.js'
import { DepartmentsModule } from './departments/departments.module.js'
import { SubmissionsModule } from './submissions/submissions.module.js'
import { MenusModule } from './menus/menus.module.js'
import { ExamConfigModule } from './exam-config/exam-config.module.js'
import { AiModule } from './ai/ai.module.js'

@Module({
  imports: [PrismaModule, AuthModule, SopsModule, ExamsModule, UsersModule, NotesModule, DashboardModule, DepartmentsModule, SubmissionsModule, MenusModule, ExamConfigModule, AiModule],
  controllers: [AppController],
})
export class AppModule {}

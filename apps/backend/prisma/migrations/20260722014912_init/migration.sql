-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL,
    `employee_id` VARCHAR(50) NOT NULL DEFAULT '',
    `department` VARCHAR(100) NOT NULL DEFAULT '',
    `password` VARCHAR(255) NOT NULL,
    `must_change_password` BOOLEAN NOT NULL DEFAULT true,
    `status` VARCHAR(20) NOT NULL DEFAULT 'active',
    `role` VARCHAR(20) NOT NULL DEFAULT 'user',
    `is_delete` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_username_key`(`username`),
    UNIQUE INDEX `users_employee_id_key`(`employee_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `departments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL DEFAULT '',
    `description` VARCHAR(255) NOT NULL DEFAULT '',
    `is_delete` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sop_documents` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `content` TEXT NOT NULL,
    `department` VARCHAR(50) NOT NULL DEFAULT '',
    `uploaded_by` VARCHAR(100) NOT NULL DEFAULT '',
    `uploaded_by_name` VARCHAR(100) NOT NULL DEFAULT '',
    `file_type` VARCHAR(20) NOT NULL DEFAULT 'markdown',
    `status` VARCHAR(20) NOT NULL DEFAULT 'draft',
    `view_count` INTEGER NOT NULL DEFAULT 0,
    `is_delete` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exams` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sop_id` INTEGER NOT NULL,
    `config_id` INTEGER NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'draft',
    `total_questions` INTEGER NOT NULL DEFAULT 0,
    `total_score` INTEGER NOT NULL DEFAULT 0,
    `created_by` VARCHAR(100) NOT NULL DEFAULT '',
    `is_delete` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `exams_sop_id_idx`(`sop_id`),
    INDEX `exams_config_id_idx`(`config_id`),
    INDEX `exams_status_idx`(`status`),
    INDEX `exams_is_delete_idx`(`is_delete`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `questions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `exam_id` INTEGER NOT NULL,
    `type` VARCHAR(20) NOT NULL,
    `content` TEXT NOT NULL,
    `options` JSON NULL,
    `answer` VARCHAR(500) NOT NULL,
    `explanation` TEXT NULL,
    `score` INTEGER NOT NULL DEFAULT 0,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `sop_source` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `questions_exam_id_idx`(`exam_id`),
    INDEX `questions_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `submissions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `exam_id` INTEGER NOT NULL,
    `sop_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `user_name` VARCHAR(100) NOT NULL DEFAULT '',
    `started_at` DATETIME(3) NOT NULL,
    `submitted_at` DATETIME(3) NULL,
    `time_spent` INTEGER NOT NULL DEFAULT 0,
    `total_score` INTEGER NOT NULL DEFAULT 0,
    `total_max_score` INTEGER NOT NULL DEFAULT 0,
    `is_passed` BOOLEAN NOT NULL DEFAULT false,
    `suggestions` TEXT NULL,
    `is_delete` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `submissions_exam_id_idx`(`exam_id`),
    INDEX `submissions_user_id_idx`(`user_id`),
    INDEX `submissions_sop_id_idx`(`sop_id`),
    INDEX `submissions_is_passed_idx`(`is_passed`),
    INDEX `submissions_is_delete_idx`(`is_delete`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `answer_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `submission_id` INTEGER NOT NULL,
    `question_id` INTEGER NOT NULL,
    `exam_id` INTEGER NOT NULL,
    `user_answer` VARCHAR(500) NULL,
    `correct_answer` VARCHAR(500) NULL,
    `is_correct` BOOLEAN NOT NULL DEFAULT false,
    `ai_score` INTEGER NOT NULL DEFAULT 0,
    `ai_feedback` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `answer_details_submission_id_idx`(`submission_id`),
    INDEX `answer_details_question_id_idx`(`question_id`),
    INDEX `answer_details_exam_id_idx`(`exam_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exam_config` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `passing_score` INTEGER NOT NULL DEFAULT 60,
    `total_score` INTEGER NOT NULL DEFAULT 100,
    `time_limit` INTEGER NOT NULL DEFAULT 30,
    `question_count` INTEGER NOT NULL DEFAULT 10,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sop_id` INTEGER NOT NULL,
    `sop_title` VARCHAR(255) NOT NULL,
    `user_id` INTEGER NOT NULL,
    `user_name` VARCHAR(100) NOT NULL DEFAULT '',
    `content` TEXT NOT NULL,
    `page_ref` VARCHAR(255) NULL,
    `is_delete` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `exams` ADD CONSTRAINT `exams_sop_id_fkey` FOREIGN KEY (`sop_id`) REFERENCES `sop_documents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exams` ADD CONSTRAINT `exams_config_id_fkey` FOREIGN KEY (`config_id`) REFERENCES `exam_config`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `questions` ADD CONSTRAINT `questions_exam_id_fkey` FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `submissions` ADD CONSTRAINT `submissions_exam_id_fkey` FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `submissions` ADD CONSTRAINT `submissions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `answer_details` ADD CONSTRAINT `answer_details_submission_id_fkey` FOREIGN KEY (`submission_id`) REFERENCES `submissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `answer_details` ADD CONSTRAINT `answer_details_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notes` ADD CONSTRAINT `notes_sop_id_fkey` FOREIGN KEY (`sop_id`) REFERENCES `sop_documents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

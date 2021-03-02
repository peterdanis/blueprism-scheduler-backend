import {MigrationInterface, QueryRunner} from "typeorm";

export class migration1611605973590 implements MigrationInterface {
    name = 'migration1611605973590'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "task" ("id" int NOT NULL IDENTITY(1,1), "inputs" ntext, "hardTimeout" int NOT NULL CONSTRAINT "DF_160588fd1350bead9eca441deb3" DEFAULT 86400000, "name" nvarchar(255) NOT NULL, "process" nvarchar(255) NOT NULL, "softTimeout" int NOT NULL CONSTRAINT "DF_c5801334611c11e181ead43c8d0" DEFAULT 86400000, CONSTRAINT "UQ_20f1f21d6853d9d20d501636ebd" UNIQUE ("name"), CONSTRAINT "PK_fb213f79ee45060ba925ecd576e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "schedule_task" ("id" int NOT NULL IDENTITY(1,1), "abortEarly" bit NOT NULL CONSTRAINT "DF_b82f40752e642d959f49f35fd7d" DEFAULT 1, "delayAfter" int NOT NULL CONSTRAINT "DF_093945de396a38b175234741171" DEFAULT 0, "onError" ntext, "step" int NOT NULL, "scheduleId" int NOT NULL, "taskId" int NOT NULL, CONSTRAINT "step_scheduleId" UNIQUE ("step", "scheduleId"), CONSTRAINT "PK_b184187cc1517c0972cedc4f0b6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "schedule" ("id" int NOT NULL IDENTITY(1,1), "force" bit NOT NULL CONSTRAINT "DF_769c26d3041f24540b11c002429" DEFAULT 0, "name" nvarchar(255) NOT NULL, "hardForceTime" int NOT NULL CONSTRAINT "DF_c56488246f5d505349a27a12da8" DEFAULT 1800000, "hardTimeout" int NOT NULL CONSTRAINT "DF_58eaecc7988d3319fe0133c30ca" DEFAULT 86400000, "onError" ntext, "priority" int NOT NULL CONSTRAINT "DF_8453a74d11bea9639f2eee747b6" DEFAULT 50, "rule" nvarchar(255) NOT NULL, "softForceTime" int NOT NULL CONSTRAINT "DF_16803399aec66eed42423c88d30" DEFAULT 900000, "softTimeout" int NOT NULL CONSTRAINT "DF_47de6b8e6561d2046112ca46f1e" DEFAULT 86400000, "validFrom" datetime NOT NULL, "validUntil" datetime NOT NULL CONSTRAINT "DF_e0992f99b44a01fa9d0dc6f4b22" DEFAULT '9999-12-31T00:00:00.000Z', "waitTime" int NOT NULL CONSTRAINT "DF_da29f360c26647dab123dd42616" DEFAULT 86400000, "runtimeResourceId" int NOT NULL, CONSTRAINT "UQ_15663a2014348b782e7058542e1" UNIQUE ("name"), CONSTRAINT "PK_1c05e42aec7371641193e180046" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "runtime_resource" ("id" int NOT NULL IDENTITY(1,1), "apiKey" nvarchar(255), "auth" nvarchar(255) NOT NULL, "friendlyName" nvarchar(255) NOT NULL, "hostname" nvarchar(255) NOT NULL, "https" bit NOT NULL CONSTRAINT "DF_b8eea77fb7067849b48fce04225" DEFAULT 1, "password" nvarchar(255), "port" int NOT NULL, "username" nvarchar(255), CONSTRAINT "PK_efd4a672e32564820f3f9e98d73" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "job" ("id" int NOT NULL IDENTITY(1,1), "addTime" datetime NOT NULL, "endTime" datetime, "message" nvarchar(255), "priority" int NOT NULL CONSTRAINT "DF_053efdab43329ec552a75fee548" DEFAULT 50, "sessionId" nvarchar(255), "startTime" datetime, "startReason" nvarchar(255) NOT NULL, "status" nvarchar(255) NOT NULL, "step" int NOT NULL CONSTRAINT "DF_46d18655bdd4b3fe1bd27482397" DEFAULT 1, "steps" ntext, "stopReason" nvarchar(255), "subStep" int NOT NULL CONSTRAINT "DF_579abc5c9ad7cce5e0581c4273a" DEFAULT 1, "updateTime" datetime NOT NULL CONSTRAINT "DF_26af5cf18aa93140800908872d2" DEFAULT getdate(), "runtimeResourceId" int NOT NULL, "scheduleId" int NOT NULL, CONSTRAINT "PK_98ab1c14ff8d1cf80d18703b92f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "job_log" ("id" int NOT NULL IDENTITY(1,1), "addTime" datetime NOT NULL, "endTime" datetime, "message" nvarchar(255), "priority" int NOT NULL CONSTRAINT "DF_c8593fdd87d4cfd83b0f7499837" DEFAULT 50, "sessionId" nvarchar(255), "startTime" datetime, "startReason" nvarchar(255) NOT NULL, "status" nvarchar(255) NOT NULL, "step" int NOT NULL CONSTRAINT "DF_2e00c34be755f4defe0031bba85" DEFAULT 1, "steps" ntext, "stopReason" nvarchar(255), "subStep" int NOT NULL CONSTRAINT "DF_09ce826b0c773ab18e4c39c1567" DEFAULT 1, "updateTime" datetime NOT NULL CONSTRAINT "DF_bcffc48c12cf6eb1f6af34f9dcb" DEFAULT getdate(), "jobId" int NOT NULL, "scheduleId" int NOT NULL, "runtimeResourceId" int NOT NULL, CONSTRAINT "PK_7fae985f584950ab07d2f7a5712" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" int NOT NULL IDENTITY(1,1), "admin" bit NOT NULL CONSTRAINT "DF_7b2e9d910c214ff466c555d7bcd" DEFAULT 0, "name" nvarchar(255) NOT NULL, CONSTRAINT "UQ_065d4d8f3b5adb4a08841eae3c8" UNIQUE ("name"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "schedule_task" ADD CONSTRAINT "FK_d95bd16410db6dc3e20321934b3" FOREIGN KEY ("scheduleId") REFERENCES "schedule"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "schedule_task" ADD CONSTRAINT "FK_e10cfa597abaf6bb86ed247aca2" FOREIGN KEY ("taskId") REFERENCES "task"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "schedule" ADD CONSTRAINT "FK_22e60336c6248f94e94767f7d91" FOREIGN KEY ("runtimeResourceId") REFERENCES "runtime_resource"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "job" ADD CONSTRAINT "FK_8008dc901f6093ac0861d498b0e" FOREIGN KEY ("runtimeResourceId") REFERENCES "runtime_resource"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "job" ADD CONSTRAINT "FK_de9f5297606ba659814388cdb0c" FOREIGN KEY ("scheduleId") REFERENCES "schedule"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "job" DROP CONSTRAINT "FK_de9f5297606ba659814388cdb0c"`);
        await queryRunner.query(`ALTER TABLE "job" DROP CONSTRAINT "FK_8008dc901f6093ac0861d498b0e"`);
        await queryRunner.query(`ALTER TABLE "schedule" DROP CONSTRAINT "FK_22e60336c6248f94e94767f7d91"`);
        await queryRunner.query(`ALTER TABLE "schedule_task" DROP CONSTRAINT "FK_e10cfa597abaf6bb86ed247aca2"`);
        await queryRunner.query(`ALTER TABLE "schedule_task" DROP CONSTRAINT "FK_d95bd16410db6dc3e20321934b3"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "job_log"`);
        await queryRunner.query(`DROP TABLE "job"`);
        await queryRunner.query(`DROP TABLE "runtime_resource"`);
        await queryRunner.query(`DROP TABLE "schedule"`);
        await queryRunner.query(`DROP TABLE "schedule_task"`);
        await queryRunner.query(`DROP TABLE "task"`);
    }

}

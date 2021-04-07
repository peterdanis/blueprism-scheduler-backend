import {MigrationInterface, QueryRunner} from "typeorm";

export class migration1617805448883 implements MigrationInterface {
    name = 'migration1617805448883'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "schedule" ADD "timezone" nvarchar(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "schedule" DROP COLUMN "timezone"`);
    }

}

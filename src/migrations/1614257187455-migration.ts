import {MigrationInterface, QueryRunner} from "typeorm";

export class migration1614257187455 implements MigrationInterface {
    name = 'migration1614257187455'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "apiKey" nvarchar(255)`);
        await queryRunner.query(`ALTER TABLE "user" ADD "apiKeyHash" nvarchar(255)`);
        await queryRunner.query(`ALTER TABLE "user" ADD "password" nvarchar(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "password"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "apiKeyHash"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "apiKey"`);
    }

}

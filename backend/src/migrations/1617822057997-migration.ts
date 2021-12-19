import {MigrationInterface, QueryRunner} from "typeorm";

export class migration1617822057997 implements MigrationInterface {
    name = 'migration1617822057997'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "setting" ADD CONSTRAINT "UQ_1c4c95d773004250c157a744d6e" UNIQUE ("key")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "setting" DROP CONSTRAINT "UQ_1c4c95d773004250c157a744d6e"`);
    }

}

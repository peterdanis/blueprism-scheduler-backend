import {MigrationInterface, QueryRunner} from "typeorm";

export class migration1615807742307 implements MigrationInterface {
    name = 'migration1615807742307'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "setting" ("id" int NOT NULL IDENTITY(1,1), "key" nvarchar(255) NOT NULL, "value" nvarchar(255) NOT NULL, CONSTRAINT "PK_fcb21187dc6094e24a48f677bed" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "setting"`);
    }

}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixEmailIssue1754455975575 implements MigrationInterface {
  name = 'FixEmailIssue1754455975575';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "otp" ("id" SERIAL NOT NULL, "code" character varying NOT NULL, "expireAt" character varying NOT NULL, "isUsed" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, "userUserId" integer, CONSTRAINT "REL_852ab3d75d34797b4c2ce64ee0" UNIQUE ("userUserId"), CONSTRAINT "PK_32556d9d7b22031d7d0e1fd6723" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "balance"`);
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "email" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD CONSTRAINT "UQ_d0af6f5866201d5cb424767744a" UNIQUE ("email")`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "country" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "businessName" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "kycDocument" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "isAdminCreated" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "otpId" integer`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_a4cf1f4b47aa4fcbae74c7aba9b" UNIQUE ("otpId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ALTER COLUMN "phone" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD CONSTRAINT "UQ_d477050c058ca769d3808caef51" UNIQUE ("phone")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "phone" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "otp" ADD CONSTRAINT "FK_852ab3d75d34797b4c2ce64ee0e" FOREIGN KEY ("userUserId") REFERENCES "users"("userId") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_a4cf1f4b47aa4fcbae74c7aba9b" FOREIGN KEY ("otpId") REFERENCES "otp"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_a4cf1f4b47aa4fcbae74c7aba9b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "otp" DROP CONSTRAINT "FK_852ab3d75d34797b4c2ce64ee0e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "phone" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" DROP CONSTRAINT "UQ_d477050c058ca769d3808caef51"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ALTER COLUMN "phone" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_a4cf1f4b47aa4fcbae74c7aba9b"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "otpId"`);
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "createdAt"`);
    await queryRunner.query(
      `ALTER TABLE "companies" DROP COLUMN "isAdminCreated"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" DROP COLUMN "kycDocument"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" DROP COLUMN "businessName"`,
    );
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "country"`);
    await queryRunner.query(
      `ALTER TABLE "companies" DROP CONSTRAINT "UQ_d0af6f5866201d5cb424767744a"`,
    );
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "email"`);
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "balance" numeric(10,2) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`DROP TABLE "otp"`);
  }
}

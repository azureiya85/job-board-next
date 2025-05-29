/*
  Warnings:

  - You are about to drop the column `city` on the `companies` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `job_postings` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `users` table. All the data in the column will be lost.
  - Made the column `country` on table `companies` required. This step will fail if there are existing NULL values in that column.
  - Made the column `country` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "CityType" AS ENUM ('CITY', 'REGENCY');

-- AlterTable
ALTER TABLE "companies" DROP COLUMN "city",
ADD COLUMN     "cityId" TEXT,
ADD COLUMN     "provinceId" TEXT,
ALTER COLUMN "country" SET NOT NULL,
ALTER COLUMN "country" SET DEFAULT 'Indonesia';

-- AlterTable
ALTER TABLE "job_postings" DROP COLUMN "city",
ADD COLUMN     "cityId" TEXT,
ADD COLUMN     "provinceId" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "city",
ADD COLUMN     "cityId" TEXT,
ADD COLUMN     "provinceId" TEXT,
ALTER COLUMN "country" SET NOT NULL,
ALTER COLUMN "country" SET DEFAULT 'Indonesia';

-- CreateTable
CREATE TABLE "provinces" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provinces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CityType" NOT NULL DEFAULT 'CITY',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "provinceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "provinces_name_key" ON "provinces"("name");

-- CreateIndex
CREATE UNIQUE INDEX "provinces_code_key" ON "provinces"("code");

-- CreateIndex
CREATE UNIQUE INDEX "cities_name_provinceId_key" ON "cities"("name", "provinceId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "provinces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "provinces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "provinces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "provinces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

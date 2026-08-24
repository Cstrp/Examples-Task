/*
  Warnings:

  - You are about to drop the column `endYear` on the `Experience` table. All the data in the column will be lost.
  - You are about to drop the column `startYear` on the `Experience` table. All the data in the column will be lost.
  - Added the required column `startDate` to the `Experience` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Experience_profileId_startYear_idx";

-- AlterTable
ALTER TABLE "Experience" DROP COLUMN "endYear",
DROP COLUMN "startYear",
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "Experience_profileId_startDate_idx" ON "Experience"("profileId", "startDate");

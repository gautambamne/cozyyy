/*
  Warnings:

  - You are about to drop the column `phone` on the `User` table. All the data in the column will be lost.
  - Added the required column `phone` to the `Address` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "phone" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "phone";

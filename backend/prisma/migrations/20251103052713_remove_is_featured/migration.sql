/*
  Warnings:

  - You are about to drop the column `isFeatured` on the `Product` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Product_isFeatured_idx";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "isFeatured";

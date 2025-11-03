/*
  Warnings:

  - You are about to drop the column `slug` on the `Product` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "JewelrySize" AS ENUM ('SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE', 'CUSTOM');

-- DropIndex
DROP INDEX "public"."Product_slug_idx";

-- DropIndex
DROP INDEX "public"."Product_slug_key";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "slug",
ADD COLUMN     "jewelrySize" "JewelrySize";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "street" TEXT;

/*
  Warnings:

  - The `categorie` column on the `posts` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "PostCategory" AS ENUM ('ARTICULOS', 'GUIAS_LEGALES', 'JURISPRUDENCIA_COMENTADA', 'NOTICIAS', 'OPINION', 'RESENAS');

-- AlterTable
ALTER TABLE "posts" DROP COLUMN "categorie",
ADD COLUMN     "categorie" "PostCategory";

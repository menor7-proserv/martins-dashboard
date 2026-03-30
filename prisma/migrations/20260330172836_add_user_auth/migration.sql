/*
  Warnings:

  - Added the required column `userId` to the `Cliente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Despesa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Meta` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "nome" TEXT NOT NULL,
    "empresa" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Cliente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Cliente_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Cliente" ("criadoEm", "id", "nome", "telefone") SELECT "criadoEm", "id", "nome", "telefone" FROM "Cliente";
DROP TABLE "Cliente";
ALTER TABLE "new_Cliente" RENAME TO "Cliente";
CREATE TABLE "new_Despesa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "data" DATETIME NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Despesa_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Despesa" ("categoria", "criadoEm", "data", "descricao", "id", "valor") SELECT "categoria", "criadoEm", "data", "descricao", "id", "valor" FROM "Despesa";
DROP TABLE "Despesa";
ALTER TABLE "new_Despesa" RENAME TO "Despesa";
CREATE TABLE "new_Meta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "mes" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "metaFaturamento" REAL NOT NULL,
    "metaLucro" REAL NOT NULL,
    CONSTRAINT "Meta_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Meta" ("ano", "id", "mes", "metaFaturamento", "metaLucro") SELECT "ano", "id", "mes", "metaFaturamento", "metaLucro" FROM "Meta";
DROP TABLE "Meta";
ALTER TABLE "new_Meta" RENAME TO "Meta";
CREATE UNIQUE INDEX "Meta_mes_ano_userId_key" ON "Meta"("mes", "ano", "userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

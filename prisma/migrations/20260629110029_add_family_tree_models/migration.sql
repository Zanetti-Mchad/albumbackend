-- CreateTable
CREATE TABLE "public"."family_trees" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rootId" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "family_trees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."family_tree_members" (
    "id" TEXT NOT NULL,
    "treeId" TEXT NOT NULL,
    "externalId" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "gender" VARCHAR(10) NOT NULL,
    "birthYear" INTEGER,
    "birthMonth" INTEGER,
    "deathYear" INTEGER,
    "parentIds" JSONB NOT NULL DEFAULT '[]',
    "spouseIds" JSONB NOT NULL DEFAULT '[]',
    "childrenIds" JSONB NOT NULL DEFAULT '[]',
    "relationshipToRoot" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "family_tree_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "family_trees_userId_idx" ON "public"."family_trees"("userId");

-- CreateIndex
CREATE INDEX "family_tree_members_treeId_idx" ON "public"."family_tree_members"("treeId");

-- CreateIndex
CREATE INDEX "family_tree_members_gender_idx" ON "public"."family_tree_members"("gender");

-- CreateIndex
CREATE UNIQUE INDEX "family_tree_members_treeId_externalId_key" ON "public"."family_tree_members"("treeId", "externalId");

-- AddForeignKey
ALTER TABLE "public"."family_trees" ADD CONSTRAINT "family_trees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."family_tree_members" ADD CONSTRAINT "family_tree_members_treeId_fkey" FOREIGN KEY ("treeId") REFERENCES "public"."family_trees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

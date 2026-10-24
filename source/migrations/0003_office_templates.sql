CREATE TABLE "officeTemplates" (
 "id" TEXT PRIMARY KEY NOT NULL,
 "sha256" TEXT NOT NULL,
 "data" TEXT NOT NULL,
 "created" TEXT NOT NULL
);
CREATE UNIQUE INDEX "idx_office_template_sha" ON "officeTemplates"("sha256");

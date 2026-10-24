-- PostgreSQL equivalent of final 0000–0014 SQLite schema. No historical seed DML.
CREATE TABLE "accessUsers" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "email" TEXT NOT NULL,
  "staffId" TEXT NOT NULL,
  "accessRole" TEXT NOT NULL DEFAULT 'employee',
  "active" BIGINT NOT NULL DEFAULT 1,
  "lastLogin" TEXT,
  "created" TEXT NOT NULL
);

CREATE TABLE "accrualPayments" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "invoiceId" TEXT,
  "accrualId" TEXT,
  "amount" BIGINT NOT NULL,
  "date" TEXT NOT NULL,
  "method" TEXT NOT NULL,
  "reference" TEXT NOT NULL DEFAULT '',
  "expenseId" TEXT NOT NULL,
  "created" TEXT NOT NULL
);

CREATE TABLE "accruals" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "description" TEXT NOT NULL,
  "amount" BIGINT NOT NULL,
  "date" TEXT NOT NULL,
  "due" TEXT NOT NULL,
  "created" TEXT NOT NULL
);

CREATE TABLE "activity" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "message" TEXT NOT NULL,
  "created" TEXT NOT NULL
);

CREATE TABLE "assignments" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "clientId" TEXT NOT NULL,
  "staffId" TEXT NOT NULL,
  "created" TEXT NOT NULL
);

CREATE TABLE "clientDossiers" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "clientId" TEXT NOT NULL,
  "data" TEXT NOT NULL,
  "revision" BIGINT NOT NULL DEFAULT 1,
  "created" TEXT NOT NULL,
  "updated" TEXT NOT NULL
);

CREATE TABLE "clientProfiles" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "clientId" TEXT NOT NULL,
  "data" TEXT NOT NULL,
  "revision" BIGINT NOT NULL DEFAULT 1,
  "created" TEXT NOT NULL,
  "updated" TEXT NOT NULL
);

CREATE TABLE "clientSecrets" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "clientId" TEXT NOT NULL,
  "field" TEXT NOT NULL,
  "encrypted" TEXT NOT NULL,
  "revision" BIGINT NOT NULL DEFAULT 1,
  "created" TEXT NOT NULL,
  "updated" TEXT NOT NULL
);

CREATE TABLE "clients" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "name" TEXT NOT NULL,
  "activity" TEXT NOT NULL DEFAULT '',
  "tax" TEXT NOT NULL DEFAULT '',
  "registration" TEXT NOT NULL DEFAULT '',
  "phone" TEXT NOT NULL DEFAULT '',
  "email" TEXT NOT NULL DEFAULT '',
  "address" TEXT NOT NULL DEFAULT '',
  "notes" TEXT NOT NULL DEFAULT '',
  "status" TEXT NOT NULL DEFAULT 'نشط',
  "created" TEXT NOT NULL,
  "taxOffice" TEXT NOT NULL DEFAULT '',
  "taxFile" TEXT NOT NULL DEFAULT '',
  "portalEmail" TEXT NOT NULL DEFAULT '',
  "nationalId" TEXT NOT NULL DEFAULT ''
);

CREATE TABLE "documents" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "clientId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "size" BIGINT NOT NULL,
  "type" TEXT NOT NULL,
  "created" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'other',
  "revision" BIGINT NOT NULL DEFAULT 1
);

CREATE TABLE "expenses" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "description" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "amount" BIGINT NOT NULL,
  "date" TEXT NOT NULL,
  "created" TEXT NOT NULL,
  "subcategory" TEXT NOT NULL DEFAULT ''
);

CREATE TABLE "importRuns" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "clientCount" BIGINT NOT NULL,
  "staffCount" BIGINT NOT NULL,
  "created" TEXT NOT NULL
);

CREATE TABLE "incomeHistory" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "returnId" TEXT NOT NULL,
  "revision" BIGINT NOT NULL,
  "data" TEXT NOT NULL,
  "calculation" TEXT NOT NULL,
  "actor" TEXT NOT NULL,
  "created" TEXT NOT NULL
);

CREATE TABLE "incomeProfiles" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "clientId" TEXT NOT NULL,
  "data" TEXT NOT NULL,
  "revision" BIGINT NOT NULL DEFAULT 1,
  "created" TEXT NOT NULL
);

CREATE TABLE "incomeReturns" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "clientId" TEXT NOT NULL,
  "year" BIGINT NOT NULL,
  "start" TEXT NOT NULL,
  "end" TEXT NOT NULL,
  "data" TEXT NOT NULL,
  "calculation" TEXT NOT NULL,
  "revision" BIGINT NOT NULL DEFAULT 1,
  "created" TEXT NOT NULL,
  "updated" TEXT NOT NULL
);

CREATE TABLE "inspectionCases" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "clientId" TEXT NOT NULL,
  "taxType" TEXT NOT NULL,
  "periodKey" TEXT NOT NULL,
  "staffId" TEXT,
  "reviewerId" TEXT,
  "approverId" TEXT,
  "updateStaffId" TEXT,
  "taskId" TEXT,
  "sourceKey" TEXT,
  "data" TEXT NOT NULL,
  "revision" BIGINT NOT NULL DEFAULT 1,
  "created" TEXT NOT NULL,
  "updated" TEXT NOT NULL
);

CREATE TABLE "inspectionHistory" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "caseId" TEXT NOT NULL,
  "revision" BIGINT NOT NULL,
  "data" TEXT NOT NULL,
  "actor" TEXT NOT NULL,
  "created" TEXT NOT NULL
);

CREATE TABLE "invoices" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "clientId" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "amount" BIGINT NOT NULL,
  "date" TEXT NOT NULL,
  "due" TEXT NOT NULL,
  "created" TEXT NOT NULL,
  "lineItems" TEXT NOT NULL DEFAULT '[]',
  "discount" BIGINT NOT NULL DEFAULT 0,
  "claimText" TEXT NOT NULL DEFAULT '{}'
);

CREATE TABLE "payments" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "invoiceId" TEXT NOT NULL,
  "amount" BIGINT NOT NULL,
  "date" TEXT NOT NULL,
  "method" TEXT NOT NULL,
  "reference" TEXT NOT NULL DEFAULT '',
  "created" TEXT NOT NULL
);

CREATE TABLE "payrollDefaults" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "data" TEXT NOT NULL,
  "revision" BIGINT NOT NULL DEFAULT 1,
  "created" TEXT NOT NULL
);

CREATE TABLE "payrollMonths" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "data" TEXT NOT NULL,
  "revision" BIGINT NOT NULL DEFAULT 1,
  "paidDate" TEXT NOT NULL DEFAULT '',
  "expenseId" TEXT NOT NULL,
  "created" TEXT NOT NULL
);

CREATE TABLE "securityLog" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "actor" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "created" TEXT NOT NULL
);

CREATE TABLE "services" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "name" TEXT NOT NULL,
  "unit" TEXT NOT NULL DEFAULT 'خدمة',
  "price" BIGINT NOT NULL DEFAULT 0,
  "description" TEXT NOT NULL DEFAULT '',
  "status" TEXT NOT NULL DEFAULT 'نشط',
  "created" TEXT NOT NULL
);

CREATE TABLE "staff" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "name" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "phone" TEXT NOT NULL DEFAULT '',
  "email" TEXT NOT NULL DEFAULT '',
  "created" TEXT NOT NULL,
  "code" TEXT NOT NULL DEFAULT ''
);

CREATE TABLE "tasks" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "title" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "staffId" TEXT,
  "service" TEXT NOT NULL,
  "due" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "priority" TEXT NOT NULL,
  "notes" TEXT NOT NULL DEFAULT '',
  "created" TEXT NOT NULL
);

CREATE TABLE "taxConnections" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "clientId" TEXT NOT NULL,
  "environment" TEXT NOT NULL,
  "loginType" TEXT NOT NULL,
  "erpId" TEXT NOT NULL,
  "encryptedSecret" TEXT NOT NULL,
  "state" TEXT NOT NULL DEFAULT 'لم يُختبر',
  "lastChecked" TEXT,
  "created" TEXT NOT NULL
);

CREATE TABLE "vatProfiles" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "clientId" TEXT NOT NULL,
  "data" TEXT NOT NULL,
  "revision" BIGINT NOT NULL DEFAULT 1,
  "created" TEXT NOT NULL
);

CREATE TABLE "vatReturns" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "clientId" TEXT NOT NULL,
  "start" TEXT NOT NULL,
  "end" TEXT NOT NULL,
  "data" TEXT NOT NULL,
  "revision" BIGINT NOT NULL DEFAULT 1,
  "created" TEXT NOT NULL
);

ALTER TABLE "accessUsers" ADD FOREIGN KEY ("staffId") REFERENCES "staff" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION DEFERRABLE INITIALLY IMMEDIATE;

CREATE UNIQUE INDEX "idx_access_staff" ON "accessUsers" ("staffId");

CREATE UNIQUE INDEX "idx_access_email" ON "accessUsers" ("email");

ALTER TABLE "accrualPayments" ADD FOREIGN KEY ("accrualId") REFERENCES "accruals" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "accrualPayments" ADD FOREIGN KEY ("invoiceId") REFERENCES "invoices" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION DEFERRABLE INITIALLY IMMEDIATE;

CREATE UNIQUE INDEX "idx_accrual_expense" ON "accrualPayments" ("expenseId");

CREATE INDEX "idx_accrual_payment_manual" ON "accrualPayments" ("accrualId");

CREATE INDEX "idx_accrual_payment_invoice" ON "accrualPayments" ("invoiceId");

ALTER TABLE "assignments" ADD FOREIGN KEY ("staffId") REFERENCES "staff" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "assignments" ADD FOREIGN KEY ("clientId") REFERENCES "clients" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION DEFERRABLE INITIALLY IMMEDIATE;

CREATE UNIQUE INDEX "idx_assignment_pair" ON "assignments" ("clientId", "staffId");

CREATE INDEX "idx_assignments_client" ON "assignments" ("clientId");

CREATE INDEX "idx_assignments_staff" ON "assignments" ("staffId");

ALTER TABLE "clientDossiers" ADD FOREIGN KEY ("clientId") REFERENCES "clients" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION DEFERRABLE INITIALLY IMMEDIATE;

CREATE UNIQUE INDEX "idx_client_dossier" ON "clientDossiers" ("clientId");

ALTER TABLE "clientProfiles" ADD FOREIGN KEY ("clientId") REFERENCES "clients" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION DEFERRABLE INITIALLY IMMEDIATE;

CREATE UNIQUE INDEX "idx_client_profile" ON "clientProfiles" ("clientId");

ALTER TABLE "clientSecrets" ADD FOREIGN KEY ("clientId") REFERENCES "clients" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION DEFERRABLE INITIALLY IMMEDIATE;

CREATE UNIQUE INDEX "idx_client_secret" ON "clientSecrets" ("clientId", "field");

ALTER TABLE "documents" ADD FOREIGN KEY ("clientId") REFERENCES "clients" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "idx_documents_client" ON "documents" ("clientId");

ALTER TABLE "incomeHistory" ADD FOREIGN KEY ("returnId") REFERENCES "incomeReturns" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION DEFERRABLE INITIALLY IMMEDIATE;

CREATE UNIQUE INDEX "idx_income_history_revision" ON "incomeHistory" ("returnId", "revision");

ALTER TABLE "incomeProfiles" ADD FOREIGN KEY ("clientId") REFERENCES "clients" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION DEFERRABLE INITIALLY IMMEDIATE;

CREATE UNIQUE INDEX "idx_income_profile_client" ON "incomeProfiles" ("clientId");

ALTER TABLE "incomeReturns" ADD FOREIGN KEY ("clientId") REFERENCES "clients" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION DEFERRABLE INITIALLY IMMEDIATE;

CREATE UNIQUE INDEX "idx_income_client_year" ON "incomeReturns" ("clientId", "year");

ALTER TABLE "inspectionCases" ADD FOREIGN KEY ("taskId") REFERENCES "tasks" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "inspectionCases" ADD FOREIGN KEY ("updateStaffId") REFERENCES "staff" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "inspectionCases" ADD FOREIGN KEY ("approverId") REFERENCES "staff" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "inspectionCases" ADD FOREIGN KEY ("reviewerId") REFERENCES "staff" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "inspectionCases" ADD FOREIGN KEY ("staffId") REFERENCES "staff" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "inspectionCases" ADD FOREIGN KEY ("clientId") REFERENCES "clients" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION DEFERRABLE INITIALLY IMMEDIATE;

CREATE UNIQUE INDEX "idx_inspection_source" ON "inspectionCases" ("sourceKey");

CREATE UNIQUE INDEX "idx_inspection_period" ON "inspectionCases" ("clientId", "taxType", "periodKey");

CREATE INDEX "idx_inspection_staff" ON "inspectionCases" ("staffId");

CREATE INDEX "idx_inspection_client" ON "inspectionCases" ("clientId");

ALTER TABLE "inspectionHistory" ADD FOREIGN KEY ("caseId") REFERENCES "inspectionCases" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION DEFERRABLE INITIALLY IMMEDIATE;

CREATE UNIQUE INDEX "idx_inspection_history" ON "inspectionHistory" ("caseId", "revision");

ALTER TABLE "invoices" ADD FOREIGN KEY ("clientId") REFERENCES "clients" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "idx_invoices_client" ON "invoices" ("clientId");

ALTER TABLE "payments" ADD FOREIGN KEY ("invoiceId") REFERENCES "invoices" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "idx_payments_invoice" ON "payments" ("invoiceId");

ALTER TABLE "tasks" ADD FOREIGN KEY ("staffId") REFERENCES "staff" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "tasks" ADD FOREIGN KEY ("clientId") REFERENCES "clients" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "idx_tasks_due" ON "tasks" ("due");

CREATE INDEX "idx_tasks_client" ON "tasks" ("clientId");

ALTER TABLE "taxConnections" ADD FOREIGN KEY ("clientId") REFERENCES "clients" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION DEFERRABLE INITIALLY IMMEDIATE;

CREATE UNIQUE INDEX "idx_tax_client" ON "taxConnections" ("clientId");

ALTER TABLE "vatProfiles" ADD FOREIGN KEY ("clientId") REFERENCES "clients" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION DEFERRABLE INITIALLY IMMEDIATE;

CREATE UNIQUE INDEX "idx_vat_profile_client" ON "vatProfiles" ("clientId");

ALTER TABLE "vatReturns" ADD FOREIGN KEY ("clientId") REFERENCES "clients" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION DEFERRABLE INITIALLY IMMEDIATE;

CREATE UNIQUE INDEX "idx_vat_return_period" ON "vatReturns" ("clientId", "start", "end");

CREATE INDEX "idx_vat_return_client" ON "vatReturns" ("clientId");

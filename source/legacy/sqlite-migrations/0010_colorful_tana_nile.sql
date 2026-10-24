CREATE TABLE `accrualPayments` (
	`id` text PRIMARY KEY NOT NULL,
	`invoiceId` text,
	`accrualId` text,
	`amount` integer NOT NULL,
	`date` text NOT NULL,
	`method` text NOT NULL,
	`reference` text DEFAULT '' NOT NULL,
	`expenseId` text NOT NULL,
	`created` text NOT NULL,
	FOREIGN KEY (`invoiceId`) REFERENCES `invoices`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`accrualId`) REFERENCES `accruals`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_accrual_payment_invoice` ON `accrualPayments` (`invoiceId`);--> statement-breakpoint
CREATE INDEX `idx_accrual_payment_manual` ON `accrualPayments` (`accrualId`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_accrual_expense` ON `accrualPayments` (`expenseId`);--> statement-breakpoint
CREATE TABLE `accruals` (
	`id` text PRIMARY KEY NOT NULL,
	`description` text NOT NULL,
	`amount` integer NOT NULL,
	`date` text NOT NULL,
	`due` text NOT NULL,
	`created` text NOT NULL
);

CREATE TABLE `payrollDefaults` (
	`id` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `payrollMonths` (
	`id` text PRIMARY KEY NOT NULL,
	`data` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`paidDate` text DEFAULT '' NOT NULL,
	`expenseId` text NOT NULL,
	`created` text NOT NULL
);

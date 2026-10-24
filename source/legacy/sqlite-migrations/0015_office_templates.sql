CREATE TABLE `officeTemplates` (
	`id` text PRIMARY KEY NOT NULL,
	`sha256` text NOT NULL,
	`data` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_office_template_sha` ON `officeTemplates` (`sha256`);
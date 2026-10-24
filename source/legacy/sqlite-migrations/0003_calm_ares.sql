CREATE TABLE `importRuns` (
	`id` text PRIMARY KEY NOT NULL,
	`clientCount` integer NOT NULL,
	`staffCount` integer NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `clients` ADD `taxOffice` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `clients` ADD `taxFile` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `clients` ADD `portalEmail` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `clients` ADD `nationalId` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `staff` ADD `code` text DEFAULT '' NOT NULL;
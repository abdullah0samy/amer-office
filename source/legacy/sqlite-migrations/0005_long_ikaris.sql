CREATE TABLE `services` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`unit` text DEFAULT 'خدمة' NOT NULL,
	`price` integer DEFAULT 0 NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'نشط' NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `invoices` ADD `lineItems` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `invoices` ADD `discount` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `invoices` ADD `claimText` text DEFAULT '{}' NOT NULL;
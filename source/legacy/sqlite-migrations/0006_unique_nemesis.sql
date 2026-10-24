CREATE TABLE `vatProfiles` (
	`id` text PRIMARY KEY NOT NULL,
	`clientId` text NOT NULL,
	`data` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`created` text NOT NULL,
	FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_vat_profile_client` ON `vatProfiles` (`clientId`);--> statement-breakpoint
CREATE TABLE `vatReturns` (
	`id` text PRIMARY KEY NOT NULL,
	`clientId` text NOT NULL,
	`start` text NOT NULL,
	`end` text NOT NULL,
	`data` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`created` text NOT NULL,
	FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_vat_return_client` ON `vatReturns` (`clientId`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_vat_return_period` ON `vatReturns` (`clientId`,`start`,`end`);
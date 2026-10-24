CREATE TABLE `incomeHistory` (
	`id` text PRIMARY KEY NOT NULL,
	`returnId` text NOT NULL,
	`revision` integer NOT NULL,
	`data` text NOT NULL,
	`calculation` text NOT NULL,
	`actor` text NOT NULL,
	`created` text NOT NULL,
	FOREIGN KEY (`returnId`) REFERENCES `incomeReturns`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_income_history_revision` ON `incomeHistory` (`returnId`,`revision`);--> statement-breakpoint
CREATE TABLE `incomeProfiles` (
	`id` text PRIMARY KEY NOT NULL,
	`clientId` text NOT NULL,
	`data` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`created` text NOT NULL,
	FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_income_profile_client` ON `incomeProfiles` (`clientId`);--> statement-breakpoint
CREATE TABLE `incomeReturns` (
	`id` text PRIMARY KEY NOT NULL,
	`clientId` text NOT NULL,
	`year` integer NOT NULL,
	`start` text NOT NULL,
	`end` text NOT NULL,
	`data` text NOT NULL,
	`calculation` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`created` text NOT NULL,
	`updated` text NOT NULL,
	FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_income_client_year` ON `incomeReturns` (`clientId`,`year`);
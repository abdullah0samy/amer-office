CREATE TABLE `clientProfiles` (
	`id` text PRIMARY KEY NOT NULL,
	`clientId` text NOT NULL,
	`data` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`created` text NOT NULL,
	`updated` text NOT NULL,
	FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_client_profile` ON `clientProfiles` (`clientId`);--> statement-breakpoint
CREATE TABLE `clientSecrets` (
	`id` text PRIMARY KEY NOT NULL,
	`clientId` text NOT NULL,
	`field` text NOT NULL,
	`encrypted` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`created` text NOT NULL,
	`updated` text NOT NULL,
	FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_client_secret` ON `clientSecrets` (`clientId`,`field`);
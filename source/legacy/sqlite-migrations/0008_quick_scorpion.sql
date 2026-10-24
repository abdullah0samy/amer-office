CREATE TABLE `clientDossiers` (
	`id` text PRIMARY KEY NOT NULL,
	`clientId` text NOT NULL,
	`data` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`created` text NOT NULL,
	`updated` text NOT NULL,
	FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_client_dossier` ON `clientDossiers` (`clientId`);--> statement-breakpoint
ALTER TABLE `documents` ADD `category` text DEFAULT 'other' NOT NULL;--> statement-breakpoint
ALTER TABLE `documents` ADD `revision` integer DEFAULT 1 NOT NULL;
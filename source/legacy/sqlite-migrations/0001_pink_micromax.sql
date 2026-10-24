CREATE TABLE `accessUsers` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`staffId` text NOT NULL,
	`accessRole` text DEFAULT 'employee' NOT NULL,
	`active` integer DEFAULT 1 NOT NULL,
	`lastLogin` text,
	`created` text NOT NULL,
	FOREIGN KEY (`staffId`) REFERENCES `staff`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_access_email` ON `accessUsers` (`email`);--> statement-breakpoint
CREATE INDEX `idx_access_staff` ON `accessUsers` (`staffId`);--> statement-breakpoint
CREATE TABLE `assignments` (
	`id` text PRIMARY KEY NOT NULL,
	`clientId` text NOT NULL,
	`staffId` text NOT NULL,
	`created` text NOT NULL,
	FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`staffId`) REFERENCES `staff`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_assignments_staff` ON `assignments` (`staffId`);--> statement-breakpoint
CREATE INDEX `idx_assignments_client` ON `assignments` (`clientId`);--> statement-breakpoint
CREATE TABLE `securityLog` (
	`id` text PRIMARY KEY NOT NULL,
	`actor` text NOT NULL,
	`action` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `taxConnections` (
	`id` text PRIMARY KEY NOT NULL,
	`clientId` text NOT NULL,
	`environment` text NOT NULL,
	`loginType` text NOT NULL,
	`erpId` text NOT NULL,
	`encryptedSecret` text NOT NULL,
	`state` text DEFAULT 'لم يُختبر' NOT NULL,
	`lastChecked` text,
	`created` text NOT NULL,
	FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);

DROP INDEX `idx_access_email`;--> statement-breakpoint
DROP INDEX `idx_access_staff`;--> statement-breakpoint
CREATE UNIQUE INDEX `idx_access_email` ON `accessUsers` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_access_staff` ON `accessUsers` (`staffId`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_assignment_pair` ON `assignments` (`clientId`,`staffId`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_tax_client` ON `taxConnections` (`clientId`);
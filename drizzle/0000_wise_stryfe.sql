CREATE TABLE `customers` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`company_name` text NOT NULL,
	`contact_name` text NOT NULL,
	`email` text NOT NULL,
	`country_code` text NOT NULL,
	`mobile` text NOT NULL,
	`initial_users` integer NOT NULL,
	`id_connection` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`notes` text,
	`created_at` text DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `customers_email_unique` ON `customers` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `customers_id_connection_unique` ON `customers` (`id_connection`);--> statement-breakpoint
CREATE TABLE `ondemand_requests` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`country_code` text NOT NULL,
	`mobile` text NOT NULL,
	`id_connection` text NOT NULL,
	`request_from` text,
	`status` text DEFAULT 'initiated' NOT NULL,
	`ivalt_status_code` integer,
	`ivalt_response` text,
	`ip_address` text,
	`user_agent` text,
	`created_at` text DEFAULT (strftime('%s', 'now')) NOT NULL,
	`completed_at` text
);

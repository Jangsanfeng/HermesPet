CREATE TABLE `github_issues` (
	`id` int AUTO_INCREMENT NOT NULL,
	`owner` varchar(255) NOT NULL,
	`repo` varchar(255) NOT NULL,
	`issueId` varchar(255) NOT NULL,
	`number` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`body` text,
	`state` varchar(50) NOT NULL,
	`createdAt` timestamp,
	`updatedAt` timestamp,
	`closedAt` timestamp,
	`author` varchar(255),
	`url` varchar(1024),
	`labels` text,
	`lastSyncedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `github_issues_id` PRIMARY KEY(`id`),
	CONSTRAINT `github_issues_issueId_unique` UNIQUE(`issueId`)
);
--> statement-breakpoint
CREATE TABLE `github_readme` (
	`id` int AUTO_INCREMENT NOT NULL,
	`owner` varchar(255) NOT NULL,
	`repo` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`lastUpdated` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `github_readme_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `github_releases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`owner` varchar(255) NOT NULL,
	`repo` varchar(255) NOT NULL,
	`releaseId` varchar(255) NOT NULL,
	`tagName` varchar(255) NOT NULL,
	`name` varchar(255),
	`body` text,
	`publishedAt` timestamp,
	`isDraft` int DEFAULT 0,
	`isPrerelease` int DEFAULT 0,
	`downloadUrl` varchar(1024),
	`lastUpdated` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `github_releases_id` PRIMARY KEY(`id`),
	CONSTRAINT `github_releases_releaseId_unique` UNIQUE(`releaseId`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);

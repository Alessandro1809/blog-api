CREATE TABLE `post_views` (
	`id` text PRIMARY KEY NOT NULL,
	`postId` text NOT NULL,
	`ipAddress` text NOT NULL,
	`userAgent` text,
	`viewedAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`postId`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `post_views_postId_ipAddress_viewedAt_idx` ON `post_views` (`postId`,`ipAddress`,`viewedAt`);--> statement-breakpoint
CREATE TABLE `posts` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`excerpt` text,
	`title` text NOT NULL,
	`content` text,
	`categorie` text,
	`tags` text DEFAULT '[]' NOT NULL,
	`status` text DEFAULT 'DRAFT' NOT NULL,
	`featuredImage` text,
	`authorId` text NOT NULL,
	`views` integer DEFAULT 0 NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `posts_slug_unique` ON `posts` (`slug`);
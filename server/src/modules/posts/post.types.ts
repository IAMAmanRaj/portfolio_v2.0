import { PostStatus } from "../../generated/prisma/client";

export interface CreatePostInput {
	title: string;
	slug?: string;
	content: string;
	excerpt?: string;
	featuredImage?: string;
	isPinned?: boolean;
}

export interface UpdatePostInput {
	title?: string;
	slug?: string;
	content?: string;
	excerpt?: string;
	featuredImage?: string;
	isPinned?: boolean;
	status?: PostStatus;
}

export interface PostListQuery {
	page: number;
	limit: number;
	status?: PostStatus;
}

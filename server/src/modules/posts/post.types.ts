import { PostStatus } from "../../generated/prisma/client";

export interface CreatePostInput {
	title: string;
	slug?: string;
	content: string;
	excerpt?: string;
	featuredImage?: string;
	isPinned?: boolean;
	// Replace-set: the post ends up linked to exactly these ids. Omitting the
	// field means "no categories/tags"; it is not optional-to-touch on create.
	categoryIds?: string[];
	tagIds?: string[];
}

export interface UpdatePostInput {
	title?: string;
	slug?: string;
	content?: string;
	excerpt?: string;
	featuredImage?: string;
	isPinned?: boolean;
	status?: PostStatus;
	// Replace-set, but on update the distinction matters: undefined means
	// "leave the post's links alone", [] means "clear them all".
	categoryIds?: string[];
	tagIds?: string[];
}

export interface PostListQuery {
	page: number;
	limit: number;
	status?: PostStatus;
}

// Public list filters — category/tag are slugs, combined with AND. Absent
// keys mean "don't filter on this"; there is no distinct "match nothing" state.
export interface PostPublicFilters {
	category?: string;
	tag?: string;
	q?: string;
}

// Embedded shape for a post's categories/tags in API responses — deliberately
// smaller than the full Category/Tag record, just enough to render a label
// and link without a second request.
export interface TaxonomyRef {
	id: string;
	name: string;
	slug: string;
}

export interface CreateTagInput {
	name: string;
	slug?: string;
}

export interface UpdateTagInput {
	name?: string;
	slug?: string;
}

/**
 * The shape returned to clients. `postCount` is flattened from Prisma's
 * nested `_count` so the API never leaks the ORM's response shape.
 */
export interface TagSummary {
	id: string;
	name: string;
	slug: string;
	createdAt: Date;
	postCount: number;
}

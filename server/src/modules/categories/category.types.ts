export interface CreateCategoryInput {
	name: string;
	slug?: string;
	description?: string;
	parentId?: string | null;
	sortOrder?: number;
}

export interface UpdateCategoryInput {
	name?: string;
	slug?: string;
	description?: string;
	parentId?: string | null;
	sortOrder?: number;
}

export interface CategoryListQuery {
	tree: boolean;
	parentId?: string;
}

// Shape returned by the repository's list select. Declared here rather than
// inferred so the tree builder below has something concrete to work against.
export interface CategorySummary {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	parentId: string | null;
	sortOrder: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface CategoryNode extends CategorySummary {
	children: CategoryNode[];
}

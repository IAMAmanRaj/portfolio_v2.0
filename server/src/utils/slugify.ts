export const slugify = (input: string): string => {
	const base = input
		.toLowerCase()
		.trim()
		.normalize("NFKD")
		.replace(/[̀-ͯ]/g, "") // strip accents (e.g. "café" -> "cafe")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 200);

	return base.length > 0 ? base : "post";
};

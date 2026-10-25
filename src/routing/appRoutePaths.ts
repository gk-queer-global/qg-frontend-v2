export type AppRoutePath = {
	readonly path: string;
	readonly exact?: boolean;
};

/**
 * Canonical list of client-side routes. Used by the React Router tree and to
 * generate Cloudflare Pages `_redirects` at build time.
 */
export const appRoutePaths: readonly AppRoutePath[] = [
	{ path: "/", exact: true },
	{ path: "/about", exact: true },
	{ path: "/donate" },
	{ path: "/profile" },
	{ path: "/blog" },
	{ path: "/add-resource" },
	{ path: "/search" },
	{ path: "/logout" },
];

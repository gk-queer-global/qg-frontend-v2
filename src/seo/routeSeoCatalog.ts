import publicRoutesDocument from "./publicRoutes.json";

export type RouteSeoEntry = {
	path: string;
	title: string;
	description: string;
	includeInSitemap?: boolean;
	robots?: string;
};

type PublicRoutesDocument = {
	defaultSiteOrigin: string;
	routes: RouteSeoEntry[];
};

const catalog = publicRoutesDocument as PublicRoutesDocument;

export const defaultSiteOrigin = catalog.defaultSiteOrigin;

export const routeSeoEntries: RouteSeoEntry[] = catalog.routes;

export function normalizePathname(pathname: string): string {
	if (!pathname || pathname === "/") {
		return "/";
	}
	return pathname.replace(/\/+$/, "") || "/";
}

export function findRouteSeo(pathname: string): RouteSeoEntry | undefined {
	const normalized = normalizePathname(pathname);
	return routeSeoEntries.find((entry) => entry.path === normalized);
}

export function sitemapRoutes(): RouteSeoEntry[] {
	return routeSeoEntries.filter((entry) => entry.includeInSitemap !== false);
}

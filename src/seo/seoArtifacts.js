/* eslint-env node */
/** @typedef {{ path: string; includeInSitemap?: boolean }} SitemapRoute */

/**
 * @param {string | undefined} envValue
 * @param {string} defaultOrigin
 * @returns {string}
 */
function resolveSiteOrigin(envValue, defaultOrigin) {
	const raw = (envValue && envValue.trim()) || defaultOrigin;
	let parsed;
	try {
		parsed = new URL(raw);
	} catch (error) {
		const message = `Invalid site URL for SEO artifacts: ${raw}`;
		throw new Error(message, { cause: error });
	}
	if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
		throw new Error(`Unsupported site URL protocol for SEO: ${parsed.protocol}`);
	}
	return parsed.origin;
}

/**
 * @param {string} siteOrigin
 * @param {string} path
 * @returns {string}
 */
function buildCanonicalUrl(siteOrigin, path) {
	const normalizedPath = path === "/" ? "/" : path.replace(/\/+$/, "");
	return `${siteOrigin}${normalizedPath}`;
}

/**
 * @param {string} siteOrigin
 * @param {SitemapRoute[]} routes
 * @returns {string}
 */
function buildSitemapXml(siteOrigin, routes) {
	const urls = routes
		.filter((route) => route.includeInSitemap !== false)
		.map((route) => {
			const loc = buildCanonicalUrl(siteOrigin, route.path);
			return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n  </url>`;
		});

	return [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
		...urls,
		"</urlset>",
		"",
	].join("\n");
}

/**
 * @param {string} siteOrigin
 * @returns {string}
 */
function buildRobotsTxt(siteOrigin) {
	const sitemapUrl = `${siteOrigin}/sitemap.xml`;
	return ["User-agent: *", "Allow: /", "", `Sitemap: ${sitemapUrl}`, ""].join("\n");
}

/**
 * @param {string} value
 * @returns {string}
 */
function escapeXml(value) {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

module.exports = {
	buildCanonicalUrl,
	buildRobotsTxt,
	buildSitemapXml,
	resolveSiteOrigin,
};

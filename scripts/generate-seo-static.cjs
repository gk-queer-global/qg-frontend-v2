#!/usr/bin/env node
/* eslint-env node */
const fs = require("fs");
const path = require("path");
const {
	buildRobotsTxt,
	buildSitemapXml,
	resolveSiteOrigin,
} = require("../src/seo/seoArtifacts.cjs");

const repoRoot = path.join(__dirname, "..");
const publicDir = path.join(repoRoot, "public");
const routesPath = path.join(repoRoot, "src/seo/publicRoutes.json");

function logError(message, error) {
	const payload = {
		source: "generate-seo-static",
		message,
		error: error instanceof Error ? error.message : String(error),
	};
	console.error(JSON.stringify(payload));
}

function main() {
	let config;
	try {
		config = JSON.parse(fs.readFileSync(routesPath, "utf8"));
	} catch (error) {
		logError("Failed to read public route catalog", error);
		process.exit(1);
	}

	let siteOrigin;
	try {
		siteOrigin = resolveSiteOrigin(
			process.env.REACT_APP_SITE_URL,
			config.defaultSiteOrigin
		);
	} catch (error) {
		logError("Failed to resolve site origin", error);
		process.exit(1);
	}

	try {
		const sitemapXml = buildSitemapXml(siteOrigin, config.routes);
		const robotsTxt = buildRobotsTxt(siteOrigin);

		fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemapXml, "utf8");
		fs.writeFileSync(path.join(publicDir, "robots.txt"), robotsTxt, "utf8");

		console.log(
			JSON.stringify({
				source: "generate-seo-static",
				status: "ok",
				siteOrigin,
				sitemapRoutes: config.routes.filter((route) => route.includeInSitemap !== false)
					.length,
			})
		);
	} catch (error) {
		logError("Failed to write SEO static files", error);
		process.exit(1);
	}
}

main();

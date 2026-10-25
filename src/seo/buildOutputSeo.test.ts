import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { sitemapRoutes } from "./routeSeoCatalog";
import { buildCanonicalUrl } from "./seoArtifactsBridge";
import { defaultSiteOrigin } from "./routeSeoCatalog";

const repoRoot = path.join(__dirname, "..", "..");

describe("build SEO artifacts", () => {
	it("writes sitemap.xml and robots.txt into public before production build", () => {
		execSync("node scripts/generate-seo-static.cjs", {
			cwd: repoRoot,
			stdio: "pipe",
		});

		const sitemapPath = path.join(repoRoot, "public", "sitemap.xml");
		const robotsPath = path.join(repoRoot, "public", "robots.txt");

		expect(fs.existsSync(sitemapPath)).toBe(true);
		expect(fs.existsSync(robotsPath)).toBe(true);

		const sitemap = fs.readFileSync(sitemapPath, "utf8");
		const robots = fs.readFileSync(robotsPath, "utf8");

		for (const route of sitemapRoutes()) {
			expect(sitemap).toContain(
				buildCanonicalUrl(defaultSiteOrigin, route.path)
			);
		}

		expect(robots).toContain(`Sitemap: ${defaultSiteOrigin}/sitemap.xml`);
	});
});

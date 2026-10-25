import {
	buildCanonicalUrl,
	buildRobotsTxt,
	buildSitemapXml,
	resolveSiteOrigin,
} from "./seoArtifactsBridge";
import { routeSeoEntries, sitemapRoutes } from "./routeSeoCatalog";

describe("resolveSiteOrigin", () => {
	it("uses the configured default when env is unset", () => {
		expect(resolveSiteOrigin(undefined, "https://www.queerglobal.com")).toBe(
			"https://www.queerglobal.com"
		);
	});

	it("prefers REACT_APP_SITE_URL when set", () => {
		expect(
			resolveSiteOrigin("https://staging.example.com", "https://www.queerglobal.com")
		).toBe("https://staging.example.com");
	});

	it("rejects invalid URLs", () => {
		expect(() => resolveSiteOrigin("not-a-url", "https://www.queerglobal.com")).toThrow(
			/Invalid site URL/
		);
	});
});

describe("buildSitemapXml", () => {
	it("lists every indexable route from the shared catalog", () => {
		const xml = buildSitemapXml("https://www.queerglobal.com", sitemapRoutes());
		for (const route of sitemapRoutes()) {
			expect(xml).toContain(
				`<loc>${buildCanonicalUrl("https://www.queerglobal.com", route.path)}</loc>`
			);
		}
	});

	it("omits routes marked as excluded from the sitemap", () => {
		const xml = buildSitemapXml("https://www.queerglobal.com", routeSeoEntries);
		expect(xml).not.toContain("/logout");
		expect(xml).not.toContain("/profile");
	});
});

describe("buildRobotsTxt", () => {
	it("allows crawling and references the sitemap", () => {
		const robots = buildRobotsTxt("https://www.queerglobal.com");
		expect(robots).toContain("User-agent: *");
		expect(robots).toContain("Allow: /");
		expect(robots).toContain("Sitemap: https://www.queerglobal.com/sitemap.xml");
	});
});

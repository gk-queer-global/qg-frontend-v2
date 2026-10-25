import { appRoutePaths } from "./appRoutePaths";
import {
	assertAppRoutesCoveredByRedirects,
	generateCloudflareRedirectsFile,
	redirectRulesForRoute,
} from "./generateCloudflarePagesRouting";
import { routeComponents } from "./routeComponents";

describe("generateCloudflarePagesRouting", () => {
	it("maps each non-root router path to index.html 200 rules", () => {
		for (const route of appRoutePaths) {
			const rules = redirectRulesForRoute(route);
			if (route.path === "/") {
				expect(rules).toEqual([]);
				continue;
			}
			expect(rules.some((r) => r.includes(" / 200"))).toBe(true);
		}
	});

	it("uses splats for non-exact routes", () => {
		expect(redirectRulesForRoute({ path: "/donate" })).toEqual([
			"/donate / 200",
			"/donate/* / 200",
		]);
	});

	it("generated _redirects covers every router path", () => {
		const content = generateCloudflareRedirectsFile();
		assertAppRoutesCoveredByRedirects(appRoutePaths, content);
		expect(content).not.toMatch(/^\/\* /m);
	});

	it("keeps routeComponents keys in sync with appRoutePaths", () => {
		const pathKeys = Object.keys(routeComponents).sort();
		const routeList = appRoutePaths.map((r) => r.path).sort();
		expect(pathKeys).toEqual(routeList);
	});
});

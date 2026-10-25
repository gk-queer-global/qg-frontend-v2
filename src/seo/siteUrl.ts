import { defaultSiteOrigin } from "./routeSeoCatalog";
import { resolveSiteOrigin } from "./seoArtifactsBridge";

export function getSiteOrigin(): string {
	return resolveSiteOrigin(process.env.REACT_APP_SITE_URL, defaultSiteOrigin);
}

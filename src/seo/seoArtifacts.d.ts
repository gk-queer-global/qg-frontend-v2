declare const seoArtifacts: {
	resolveSiteOrigin: (envValue: string | undefined, defaultOrigin: string) => string;
	buildCanonicalUrl: (siteOrigin: string, path: string) => string;
	buildSitemapXml: (
		siteOrigin: string,
		routes: Array<{ path: string; includeInSitemap?: boolean }>
	) => string;
	buildRobotsTxt: (siteOrigin: string) => string;
};

export default seoArtifacts;

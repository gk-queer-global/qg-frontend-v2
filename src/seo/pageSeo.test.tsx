import { render, waitFor } from "@testing-library/react";
import { MemoryRouter, Route } from "react-router-dom";
import PageSeo from "./PageSeo";
import { defaultSiteOrigin, routeSeoEntries } from "./routeSeoCatalog";
import { buildCanonicalUrl } from "./seoArtifactsBridge";

const PlaceholderPage = () => <div>page</div>;

function renderRoute(path: string) {
	return render(
		<MemoryRouter initialEntries={[path]}>
			<PageSeo />
			<Route path="*" component={PlaceholderPage} />
		</MemoryRouter>
	);
}

function expectMetaContent(
	attribute: "name" | "property",
	key: string,
	expected: string
) {
	const element = document.head.querySelector<HTMLMetaElement>(
		`meta[${attribute}="${key}"]`
	);
	expect(element).not.toBeNull();
	expect(element?.getAttribute("content")).toBe(expected);
}

describe("PageSeo", () => {
	beforeEach(() => {
		document.head.querySelectorAll('meta[data-seo-test]').forEach((node) => node.remove());
		document.title = "";
		document.head.querySelector('link[rel="canonical"]')?.remove();
	});

	it.each(routeSeoEntries.map((entry) => [entry.path, entry] as const))(
		"sets title, description, and canonical for %s",
		async (path, entry) => {
			renderRoute(path);

			await waitFor(() => {
				expect(document.title).toBe(entry.title);
			});

			expectMetaContent("name", "description", entry.description);
			expectMetaContent("property", "og:title", entry.title);
			expectMetaContent("property", "og:description", entry.description);
			expectMetaContent(
				"name",
				"twitter:title",
				entry.title
			);
			expectMetaContent(
				"name",
				"twitter:description",
				entry.description
			);

			const canonical = document.head.querySelector<HTMLLinkElement>(
				'link[rel="canonical"]'
			);
			expect(canonical?.href).toBe(
				buildCanonicalUrl(defaultSiteOrigin, entry.path)
			);
		}
	);
});

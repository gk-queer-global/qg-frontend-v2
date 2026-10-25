import { buildCanonicalUrl } from "./seoArtifactsBridge";
import { RouteSeoEntry } from "./routeSeoCatalog";
import { reportSeoError } from "./reportSeoError";

type MetaSpec = {
	attribute: "name" | "property";
	key: string;
	content: string;
};

function upsertMeta(spec: MetaSpec): void {
	const selector = `meta[${spec.attribute}="${spec.key}"]`;
	let element = document.head.querySelector<HTMLMetaElement>(selector);
	if (!element) {
		element = document.createElement("meta");
		element.setAttribute(spec.attribute, spec.key);
		document.head.appendChild(element);
	}
	element.setAttribute("content", spec.content);
}

function upsertLink(rel: string, href: string): void {
	const selector = `link[rel="${rel}"]`;
	let element = document.head.querySelector<HTMLLinkElement>(selector);
	if (!element) {
		element = document.createElement("link");
		element.setAttribute("rel", rel);
		document.head.appendChild(element);
	}
	element.setAttribute("href", href);
}

function removeMeta(attribute: MetaSpec["attribute"], key: string): void {
	const selector = `meta[${attribute}="${key}"]`;
	document.head.querySelector(selector)?.remove();
}

export function applyRouteSeo(entry: RouteSeoEntry, siteOrigin: string): void {
	try {
		document.title = entry.title;

		const canonicalUrl = buildCanonicalUrl(siteOrigin, entry.path);

		upsertMeta({ attribute: "name", key: "description", content: entry.description });
		upsertMeta({ attribute: "property", key: "og:title", content: entry.title });
		upsertMeta({
			attribute: "property",
			key: "og:description",
			content: entry.description,
		});
		upsertMeta({ attribute: "property", key: "og:url", content: canonicalUrl });
		upsertMeta({ attribute: "property", key: "og:type", content: "website" });
		upsertMeta({ attribute: "name", key: "twitter:card", content: "summary" });
		upsertMeta({ attribute: "name", key: "twitter:title", content: entry.title });
		upsertMeta({
			attribute: "name",
			key: "twitter:description",
			content: entry.description,
		});

		upsertLink("canonical", canonicalUrl);

		if (entry.robots) {
			upsertMeta({ attribute: "name", key: "robots", content: entry.robots });
		} else {
			removeMeta("name", "robots");
		}
	} catch (error) {
		reportSeoError(error, {
			operation: "applyRouteSeo",
			detail: entry.path,
		});
	}
}

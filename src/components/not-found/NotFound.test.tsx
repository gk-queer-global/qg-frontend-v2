import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Switch } from "react-router-dom";
import NotFound from "./NotFound";

function renderAt(path: string) {
	return render(
		<MemoryRouter initialEntries={[path]}>
			<Switch>
				<Route path="/missing-page" component={NotFound} />
				<Route component={NotFound} />
			</Switch>
		</MemoryRouter>,
	);
}

describe("NotFound", () => {
	it("renders a single accessible heading and a link home", () => {
		renderAt("/unknown-audit-route");

		expect(
			screen.getByRole("heading", { level: 1, name: /page not found/i }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: /return to the home page/i }),
		).toHaveAttribute("href", "/");
	});

	it("marks the document as noindex while mounted", () => {
		const { unmount } = renderAt("/unknown-audit-route");

		const meta = document.querySelector('meta[name="robots"]');
		expect(meta).not.toBeNull();
		expect(meta?.getAttribute("content")).toMatch(/noindex/i);

		unmount();
	});
});

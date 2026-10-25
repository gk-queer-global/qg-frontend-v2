import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AppRoutes from "./AppRoutes";

describe("App catch-all route", () => {
	it("renders NotFound for unknown paths", () => {
		render(
			<MemoryRouter initialEntries={["/unknown-audit-route"]}>
				<AppRoutes />
			</MemoryRouter>,
		);

		expect(
			screen.getByRole("heading", { level: 1, name: /page not found/i }),
		).toBeInTheDocument();
	});
});

import React from "react";
import { render, screen } from "@testing-library/react";
import TopNav from "./TopNav";

const DESKTOP_WIDTH = 1024;

function renderDesktopTopNav() {
	Object.defineProperty(window, "innerWidth", {
		writable: true,
		configurable: true,
		value: DESKTOP_WIDTH,
	});
	return render(<TopNav />);
}

describe("TopNav desktop navigation accessibility", () => {
	it("does not nest buttons inside links", () => {
		const { container } = renderDesktopTopNav();
		expect(container.querySelector("a button")).toBeNull();
	});

	it("exposes each nav item as a link with the expected name and destination", () => {
		renderDesktopTopNav();

		expect(screen.getByRole("link", { name: "ABOUT" })).toHaveAttribute("href", "/about");
		expect(screen.getByRole("link", { name: "RESOURCES" })).toHaveAttribute(
			"href",
			"/resources"
		);
		expect(screen.getByRole("link", { name: "BLOG" })).toHaveAttribute("href", "/blog");
		expect(screen.getByRole("link", { name: "DONATE" })).toHaveAttribute("href", "/donate");
		expect(screen.getByRole("link", { name: "SIGN UP" })).toHaveAttribute(
			"href",
			"/get-involved"
		);
	});
});

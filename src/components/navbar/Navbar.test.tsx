import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Navbar from "./Navbar";
import {
	MOBILE_NAV_SIDEBAR_ID,
	MOBILE_NAV_TRIGGER_LABEL,
} from "./navIds";
import "bootstrap/dist/js/bootstrap";

const mockUserResponse = {
	profileThumbnail: "",
	messages: 0,
};

/**
 * jsdom does not synthesize button clicks from Enter/Space; browsers do before Bootstrap runs.
 */
function activateMenuTriggerWithKey(trigger: HTMLElement, key: "Enter" | " "): void {
	trigger.focus();
	fireEvent.keyDown(trigger, {
		key,
		code: key === "Enter" ? "Enter" : "Space",
		bubbles: true,
	});
	fireEvent.click(trigger);
}

describe("Navbar mobile navigation accessibility", () => {
	beforeEach(() => {
		global.fetch = jest.fn(() =>
			Promise.resolve({
				ok: true,
				json: async () => mockUserResponse,
			})
		) as jest.Mock;
	});

	afterEach(() => {
		jest.restoreAllMocks();
		document.body.innerHTML = "";
	});

	it("menu trigger has an accessible name and aria-controls matches the panel id", () => {
		render(<Navbar />);

		const trigger = screen.getByRole("button", { name: MOBILE_NAV_TRIGGER_LABEL });
		const panel = document.getElementById(MOBILE_NAV_SIDEBAR_ID);

		expect(panel).toBeInTheDocument();
		expect(trigger).toHaveAttribute("aria-controls", MOBILE_NAV_SIDEBAR_ID);
	});

	it("slide-out panel has an accessible name", () => {
		render(<Navbar />);

		const panel = document.getElementById(MOBILE_NAV_SIDEBAR_ID);
		expect(panel).toHaveAccessibleName("Menu");
	});

	it("exposes primary nav destinations as links", () => {
		render(<Navbar />);

		expect(screen.getByRole("link", { name: "HOME" })).toHaveAttribute("href", "/");
		expect(screen.getByRole("link", { name: "DONATE" })).toHaveAttribute("href", "/donate");
		expect(screen.getByRole("link", { name: "ABOUT" })).toHaveAttribute("href", "/about");
		expect(screen.getByRole("link", { name: "BLOG" })).toHaveAttribute("href", "/blog");
		expect(screen.getByRole("link", { name: "SEARCH" })).toHaveAttribute("href", "/search");
	});

	it("opens with Enter and Space, closes with Escape, and returns focus to the trigger", async () => {
		render(<Navbar />);

		const trigger = screen.getByRole("button", { name: MOBILE_NAV_TRIGGER_LABEL });
		const panel = document.getElementById(MOBILE_NAV_SIDEBAR_ID);
		expect(panel).not.toBeNull();

		activateMenuTriggerWithKey(trigger, "Enter");
		await waitFor(() => {
			expect(panel).toHaveClass("show");
		});

		fireEvent.keyDown(panel as HTMLElement, { key: "Escape", code: "Escape", keyCode: 27 });
		await waitFor(() => {
			expect(panel).not.toHaveClass("show");
		});
		expect(trigger).toHaveFocus();

		activateMenuTriggerWithKey(trigger, " ");
		await waitFor(() => {
			expect(panel).toHaveClass("show");
		});

		fireEvent.keyDown(panel as HTMLElement, { key: "Escape", code: "Escape", keyCode: 27 });
		await waitFor(() => {
			expect(panel).not.toHaveClass("show");
		});
		expect(trigger).toHaveFocus();
	});
});

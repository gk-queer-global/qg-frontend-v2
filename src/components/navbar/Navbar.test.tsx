import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Navbar from "./Navbar";
import {
	MOBILE_NAV_SIDEBAR_ID,
	MOBILE_NAV_TRIGGER_LABEL,
} from "./navIds";
import {
	captureUnexpectedError,
	logStructured,
} from "../../logging";
import "bootstrap/dist/js/bootstrap";

jest.mock("../../logging", () => ({
	logStructured: jest.fn(),
	captureUnexpectedError: jest.fn(),
	initSentry: jest.fn(),
	isSentryEnabled: jest.fn(() => false),
}));

const DEFAULT_PROFILE_THUMB =
	"https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcdn4.iconfinder.com%2Fdata%2Ficons%2Flove-wins%2F500%2FRainbow_Military-512.png&f=1&nofb=1";

const mockedLogStructured = logStructured as jest.MockedFunction<
	typeof logStructured
>;
const mockedCaptureUnexpectedError =
	captureUnexpectedError as jest.MockedFunction<typeof captureUnexpectedError>;

const mockUserResponse = {
	profileThumbnail: "",
	messages: 0,
};

function mockUserFetch(
	implementation: typeof fetch,
): jest.SpyInstance {
	return jest.spyOn(global, "fetch").mockImplementation(implementation);
}

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

describe("Navbar Component", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("shows signed-out profile state when /user returns 404", async () => {
		mockUserFetch(async () =>
			({
				ok: false,
				status: 404,
				json: async () => ({}),
			}) as unknown as Response,
		);

		render(<Navbar />);

		await waitFor(() => {
			expect(screen.getByAltText("Profile Thumbnail")).toHaveAttribute(
				"src",
				DEFAULT_PROFILE_THUMB,
			);
		});
		expect(screen.queryByText("3")).not.toBeInTheDocument();
		expect(mockedCaptureUnexpectedError).not.toHaveBeenCalled();
	});

	it("shows signed-out profile state when /user returns non-JSON", async () => {
		mockUserFetch(async () =>
			({
				ok: true,
				status: 200,
				json: async () => {
					throw new SyntaxError("Unexpected token <");
				},
			}) as unknown as Response,
		);

		render(<Navbar />);

		await waitFor(() => {
			expect(screen.getByAltText("Profile Thumbnail")).toHaveAttribute(
				"src",
				DEFAULT_PROFILE_THUMB,
			);
		});
		expect(mockedCaptureUnexpectedError).not.toHaveBeenCalled();
	});

	it("shows signed-out profile state when /user network fails", async () => {
		mockUserFetch(async () => {
			throw new TypeError("Failed to fetch");
		});

		render(<Navbar />);

		await waitFor(() => {
			expect(screen.getByAltText("Profile Thumbnail")).toHaveAttribute(
				"src",
				DEFAULT_PROFILE_THUMB,
			);
		});
		expect(mockedCaptureUnexpectedError).toHaveBeenCalled();
	});

	it("shows authenticated navbar details after a successful /user response", async () => {
		mockUserFetch(async () =>
			({
				ok: true,
				status: 200,
				json: async () => ({
					profileThumbnail: "https://cdn.example/user.png",
					messages: 2,
				}),
			}) as unknown as Response,
		);

		render(<Navbar />);

		await waitFor(() => {
			expect(screen.getByAltText("Profile Thumbnail")).toHaveAttribute(
				"src",
				"https://cdn.example/user.png",
			);
		});
		expect(global.fetch).toHaveBeenCalledWith(
			"/user",
			expect.objectContaining({ method: "GET" }),
		);
		expect(mockedLogStructured).not.toHaveBeenCalled();
		expect(mockedCaptureUnexpectedError).not.toHaveBeenCalled();
	});
});

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

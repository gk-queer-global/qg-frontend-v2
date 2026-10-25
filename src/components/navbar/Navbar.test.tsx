import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import Navbar from "./Navbar";
import {
	captureUnexpectedError,
	logStructured,
} from "../../logging";

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

function mockUserFetch(
	implementation: typeof fetch,
): jest.SpyInstance {
	return jest.spyOn(global, "fetch").mockImplementation(implementation);
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

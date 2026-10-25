import { fetchNavbarUser } from "./fetchNavbarUser";
import {
	captureUnexpectedError,
	logStructured,
} from "../../logging";

jest.mock("../../logging", () => ({
	logStructured: jest.fn(),
	captureUnexpectedError: jest.fn(),
}));

const mockedLogStructured = logStructured as jest.MockedFunction<
	typeof logStructured
>;
const mockedCaptureUnexpectedError =
	captureUnexpectedError as jest.MockedFunction<typeof captureUnexpectedError>;

describe("fetchNavbarUser", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("returns session data on a successful JSON response", async () => {
		const fetchFn = jest.fn().mockResolvedValue({
			ok: true,
			status: 200,
			json: async () => ({
				profileThumbnail: "https://cdn.example/avatar.png",
				messages: 4,
			}),
		});

		const result = await fetchNavbarUser({ fetchFn, userUrl: "/user" });

		expect(result).toEqual({
			kind: "success",
			data: {
				profileThumbnail: "https://cdn.example/avatar.png",
				messages: 4,
			},
		});
		expect(mockedLogStructured).not.toHaveBeenCalled();
		expect(mockedCaptureUnexpectedError).not.toHaveBeenCalled();
	});

	it("treats 401 as signed out with info logging only", async () => {
		const fetchFn = jest.fn().mockResolvedValue({
			ok: false,
			status: 401,
			json: async () => ({}),
		});

		const result = await fetchNavbarUser({ fetchFn });

		expect(result).toEqual({ kind: "signed_out" });
		expect(mockedLogStructured).toHaveBeenCalledWith(
			"info",
			"navbar_user_signed_out",
			expect.objectContaining({ httpStatus: 401 }),
		);
		expect(mockedCaptureUnexpectedError).not.toHaveBeenCalled();
	});

	it("treats unexpected HTTP status as signed out and reports to Sentry", async () => {
		const fetchFn = jest.fn().mockResolvedValue({
			ok: false,
			status: 503,
			json: async () => ({}),
		});

		const result = await fetchNavbarUser({ fetchFn });

		expect(result).toEqual({ kind: "signed_out" });
		expect(mockedLogStructured).toHaveBeenCalledWith(
			"warn",
			"navbar_user_fetch_failed",
			expect.objectContaining({ httpStatus: 503, reason: "http" }),
		);
		expect(mockedCaptureUnexpectedError).toHaveBeenCalled();
	});

	it("treats non-JSON success bodies as signed out with info logging only", async () => {
		const fetchFn = jest.fn().mockResolvedValue({
			ok: true,
			status: 200,
			json: async () => {
				throw new SyntaxError("Unexpected token");
			},
		});

		const result = await fetchNavbarUser({ fetchFn });

		expect(result).toEqual({ kind: "signed_out" });
		expect(mockedLogStructured).toHaveBeenCalledWith(
			"info",
			"navbar_user_signed_out",
			expect.objectContaining({ httpStatus: 200 }),
		);
		expect(mockedCaptureUnexpectedError).not.toHaveBeenCalled();
	});

	it("treats network failures as signed out and reports to Sentry", async () => {
		const fetchFn = jest.fn().mockRejectedValue(new TypeError("Failed to fetch"));

		const result = await fetchNavbarUser({ fetchFn });

		expect(result).toEqual({ kind: "signed_out" });
		expect(mockedLogStructured).toHaveBeenCalledWith(
			"error",
			"navbar_user_fetch_failed",
			expect.objectContaining({ reason: "network" }),
		);
		expect(mockedCaptureUnexpectedError).toHaveBeenCalled();
	});
});

import {
	captureUnexpectedError,
	logStructured,
} from "../../logging";

export type NavbarUserSession = {
	profileThumbnail: string | undefined;
	messages: number | undefined;
};

export type FetchNavbarUserResult =
	| { kind: "success"; data: NavbarUserSession }
	| { kind: "signed_out" };

export type FetchNavbarUserOptions = {
	fetchFn?: typeof fetch;
	userUrl?: string;
};

const DEFAULT_USER_URL = "/user";

function isExpectedSignedOutStatus(status: number): boolean {
	return status === 401 || status === 404;
}

export async function fetchNavbarUser(
	options: FetchNavbarUserOptions = {},
): Promise<FetchNavbarUserResult> {
	const fetchFn = options.fetchFn ?? fetch;
	const userUrl = options.userUrl ?? DEFAULT_USER_URL;

	let response: Response;
	try {
		response = await fetchFn(userUrl, {
			method: "GET",
			headers: {
				"Content-Type": "application/json;charset=utf-8",
			},
		});
	} catch (error) {
		logStructured("error", "navbar_user_fetch_failed", {
			feature: "navbar_user_fetch",
			reason: "network",
		});
		captureUnexpectedError(error, {
			feature: "navbar_user_fetch",
			reason: "network",
		});
		return { kind: "signed_out" };
	}

	if (!response.ok) {
		if (isExpectedSignedOutStatus(response.status)) {
			logStructured("info", "navbar_user_signed_out", {
				feature: "navbar_user_fetch",
				httpStatus: response.status,
			});
		} else {
			logStructured("warn", "navbar_user_fetch_failed", {
				feature: "navbar_user_fetch",
				reason: "http",
				httpStatus: response.status,
			});
			captureUnexpectedError(
				new Error(`Navbar user fetch returned HTTP ${response.status}`),
				{
					feature: "navbar_user_fetch",
					reason: "http",
					httpStatus: response.status,
				},
			);
		}
		return { kind: "signed_out" };
	}

	try {
		const body: unknown = await response.json();
		if (body === null || typeof body !== "object") {
			throw new Error("Navbar user response was not a JSON object");
		}
		const record = body as Record<string, unknown>;
		const data: NavbarUserSession = {
			profileThumbnail:
				typeof record.profileThumbnail === "string"
					? record.profileThumbnail
					: undefined,
			messages:
				typeof record.messages === "number" ? record.messages : undefined,
		};
		return { kind: "success", data };
	} catch {
		logStructured("info", "navbar_user_signed_out", {
			feature: "navbar_user_fetch",
			httpStatus: response.status,
		});
		return { kind: "signed_out" };
	}
}

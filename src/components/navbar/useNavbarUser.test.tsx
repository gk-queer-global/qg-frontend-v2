import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { useNavbarUser } from "./useNavbarUser";

function NavbarUserProbe(): JSX.Element {
	const { profileThumbnail, messages } = useNavbarUser();
	return (
		<div>
			<span data-testid="thumb">{profileThumbnail ?? ""}</span>
			<span data-testid="messages">{messages ?? "none"}</span>
		</div>
	);
}

describe("useNavbarUser", () => {
	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("applies session fields after a successful fetch", async () => {
		jest.spyOn(global, "fetch").mockResolvedValue({
			ok: true,
			status: 200,
			json: async () => ({
				profileThumbnail: "https://cdn.example/user.png",
				messages: 2,
			}),
		} as unknown as Response);

		render(<NavbarUserProbe />);

		await waitFor(() => {
			expect(screen.getByTestId("thumb")).toHaveTextContent(
				"https://cdn.example/user.png",
			);
		});
		expect(screen.getByTestId("messages")).toHaveTextContent("2");
	});
});

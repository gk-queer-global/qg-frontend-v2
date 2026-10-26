import { useEffect, useState } from "react";

import { fetchNavbarUser, NavbarUserSession } from "./fetchNavbarUser";

export const SIGNED_OUT_NAVBAR_USER: NavbarUserSession = {
	profileThumbnail: "",
	messages: 0,
};

export function useNavbarUser(): NavbarUserSession {
	const [session, setSession] = useState<NavbarUserSession>(
		SIGNED_OUT_NAVBAR_USER,
	);

	useEffect(() => {
		let cancelled = false;

		void fetchNavbarUser().then((result) => {
			if (cancelled) {
				return;
			}
			if (result.kind === "success") {
				setSession({
					profileThumbnail: result.data.profileThumbnail,
					messages: result.data.messages,
				});
				return;
			}
			setSession(SIGNED_OUT_NAVBAR_USER);
		});

		return () => {
			cancelled = true;
		};
	}, []);

	return session;
}

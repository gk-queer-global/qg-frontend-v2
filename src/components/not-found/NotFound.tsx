import { useEffect } from "react";
import { Link } from "react-router-dom";

const NotFound = (): JSX.Element => {
	useEffect(() => {
		const existing = document.querySelector('meta[name="robots"]');
		const previousContent = existing?.getAttribute("content") ?? null;

		let meta = existing;
		if (!meta) {
			meta = document.createElement("meta");
			meta.setAttribute("name", "robots");
			document.head.appendChild(meta);
		}
		meta.setAttribute("content", "noindex, nofollow");

		return () => {
			if (!meta) {
				return;
			}
			if (previousContent === null) {
				meta.remove();
			} else {
				meta.setAttribute("content", previousContent);
			}
		};
	}, []);

	return (
		<main>
			<h1>Page not found</h1>
			<p>The page you requested does not exist.</p>
			<p>
				<Link to="/">Return to the home page</Link>
			</p>
		</main>
	);
};

export default NotFound;

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { applyRouteSeo } from "./domHead";
import { findRouteSeo } from "./routeSeoCatalog";
import { getSiteOrigin } from "./siteUrl";

const PageSeo = (): null => {
	const location = useLocation();

	useEffect(() => {
		const entry = findRouteSeo(location.pathname);
		if (!entry) {
			return;
		}
		applyRouteSeo(entry, getSiteOrigin());
	}, [location.pathname]);

	return null;
};

export default PageSeo;

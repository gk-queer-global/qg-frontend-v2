import type { ComponentType } from "react";
import About from "../components/about/About";
import AddResource from "../components/add-resource/AddResource";
import Blog from "../components/blog/Blog";
import Donate from "../components/donate/Donate";
import Home from "../components/home/Home";
import Logout from "../components/logout/Logout";
import Profile from "../components/profile/Profile";
import Search from "../components/search/Search";
import type { appRoutePaths } from "./appRoutePaths";

type AppRoutePathLiteral = (typeof appRoutePaths)[number]["path"];

export const routeComponents: Record<AppRoutePathLiteral, ComponentType> = {
	"/": Home,
	"/about": About,
	"/donate": Donate,
	"/profile": Profile,
	"/blog": Blog,
	"/add-resource": AddResource,
	"/search": Search,
	"/logout": Logout,
};

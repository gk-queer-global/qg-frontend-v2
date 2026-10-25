import { Route, Switch } from "react-router-dom";
import NotFound from "./components/not-found/NotFound";
import { appRoutePaths } from "./routing/appRoutePaths";
import { routeComponents } from "./routing/routeComponents";

const AppRoutes: React.FC = () => {
	return (
		<Switch>
			{appRoutePaths.map(({ path, exact }) => {
				const Component = routeComponents[path];
				return (
					<Route
						key={path}
						path={path}
						exact={exact}
						component={Component}
					/>
				);
			})}
			<Route component={NotFound} />
		</Switch>
	);
};

export default AppRoutes;

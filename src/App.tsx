import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Home from "./components/home/Home";
import About from "./components/about/About";
import Donate from "./components/donate/Donate";
import Profile from "./components/profile/Profile";
import Blog from "./components/blog/Blog";
import AddResource from "./components/add-resource/AddResource";
import Search from "./components/search/Search";
import Logout from "./components/logout/Logout";
import GlobalStyles from "./Global.css";
import TopNav from "./components/common/topnav/TopNav";
import Footer from './components/common/footer/Footer';
import SkipLink from './components/common/skip-link/SkipLink';
import { PageMain } from './components/common/page-main/PageMain.css';
import { initSentry } from "./logging";

initSentry();

export const AppRoutes: React.FC = () => (
  <PageMain id="main-content" tabIndex={-1}>
    <Switch>
      <Route path="/" exact component={Home} />
      <Route path="/about" exact component={About} />
      <Route path="/donate" component={Donate} />
      <Route path="/profile" component={Profile} />
      <Route path="/blog" component={Blog} />
      <Route path="/add-resource" component={AddResource} />
      <Route path="/search" component={Search} />
      <Route path="/logout" component={Logout} />
    </Switch>
  </PageMain>
);

const App: React.FC = () => {
	return (
		<>
			<GlobalStyles />

			<SkipLink />

			<TopNav />

			<Router>
				<AppRoutes />
			</Router>

			<Footer />
		</>
	);
};

export default App;

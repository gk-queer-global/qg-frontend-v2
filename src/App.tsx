import { BrowserRouter as Router } from "react-router-dom";
import GlobalStyles from "./Global.css";
import TopNav from "./components/common/topnav/TopNav";
import Footer from "./components/common/footer/Footer";
import AppRoutes from "./AppRoutes";

const App: React.FC = () => {
	return (
		<>
			<GlobalStyles />

			<TopNav />

			<Router>
				<AppRoutes />
			</Router>

			<Footer />
		</>
	);
};

export default App;

import React, { FC, useEffect, useState } from "react";
import Navbar from "../../navbar/Navbar";
import {
	TopNavContainer,
	NavLink,
	TopNavLogo,
	SignUpBtn,
	DonateBtn
} from "./TopNav.css";
import icon from "../../../assets/topnav/QG-Logo-V3-White-Transparent-PNG-1.png";

const TopNav: FC = () => {
	const [width, setWidth] = useState(window.innerWidth);

	const updateWidth = () => setWidth(window.innerWidth);

	const isWindowWidthMobile = width <= 500;

	useEffect(() => {
		window.addEventListener("resize", updateWidth);

		return () => window.removeEventListener("resize", updateWidth);
	}, []);

	return <TopNavContainer as="header">
		{isWindowWidthMobile ? 
			<Navbar /> : 
			<> 
				<TopNavLogo>
					<NavLink to="/">
						<img src={icon} alt="logo" />
					</NavLink>
				</TopNavLogo>

				<div>
					<NavLink href="/about">ABOUT</NavLink>
					<NavLink href="/resources">RESOURCES</NavLink>  
					<NavLink href="/blog">BLOG</NavLink>
					<NavLink href="/donate">
						<SignUpBtn>DONATE</SignUpBtn>
					</NavLink>
					<NavLink href="/get-involved">
						<DonateBtn>SIGN UP</DonateBtn>
					</NavLink> {/** TODO: Correct? */}
				</div>
			</>
		}
	</TopNavContainer>;
}

export default TopNav;
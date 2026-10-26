import React, { FC } from "react";
import {
	FooterContainer,
	FooterBar,
	LogoContainer,
	KnowUs,
	Email,
	NavLinksContainer,
	NavLink,
	RightsReserved,
} from "./Footer.css";
import SocialIcons from "../social-icons/SocialIcons";
import icon from "../../../assets/footer/QG-Logo-V3-Gold-Transparent-PNG-1.png";

const Footer: FC = () => {
	const currentYear: number = new Date().getFullYear();

	return (
		<FooterContainer forwardedAs="footer" className="QG-background">
			<FooterBar></FooterBar>
			<LogoContainer>
				<img src={icon} alt="QueerGlobal" />
			</LogoContainer>
			<KnowUs> Get to know us</KnowUs>
			<SocialIcons />
			<Email>email@queerglobal.com</Email>
			<NavLinksContainer>
				<NavLink href="/blog">Blog</NavLink>
				<NavLink href="/about">About</NavLink>
				<NavLink href="/resources">Resources</NavLink>
				<NavLink href="/donate">Donate</NavLink>
				<NavLink href="/get-involved">Get Involved</NavLink>
				<NavLink href="/contact-us">Contact Us</NavLink>
			</NavLinksContainer>
			<RightsReserved>
				&#169; {currentYear} Queer Global | All Rights Reserved
			</RightsReserved>
		</FooterContainer>
	);
};

export default Footer;

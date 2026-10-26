import React, { FC } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { NavDropdown } from "react-bootstrap";
import {
	CanvasNavbarContainer,
	MenuButton,
	NavLink,
	NavDropdownItem,
	NavDropdownItemContainer,
	BottomNavLinks,
	MessagesContainer,
	EighteenPXSpan,
	ProfileThumbCont
} from "./Navbar.css";
import colors from "../../styles/colors";
import { useNavbarUser } from "./useNavbarUser";
import {
	MOBILE_NAV_LABEL_ID,
	MOBILE_NAV_PANEL_NAME,
	MOBILE_NAV_SIDEBAR_ID,
	MOBILE_NAV_TRIGGER_LABEL,
} from "./navIds";

const DEFAULT_PROFILE_THUMB =
	"https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcdn4.iconfinder.com%2Fdata%2Ficons%2Flove-wins%2F500%2FRainbow_Military-512.png&f=1&nofb=1";

const NavBar: FC = () => {
	const { profileThumbnail, messages } = useNavbarUser();

	const MessagesIcon = () => {
		if (messages !== undefined && messages > 0) {
			return <MessagesContainer>{messages}</MessagesContainer>;
		}
		return null;
	};

	const ProfilePic = () => {
		return (
			<ProfileThumbCont
				src={profileThumbnail ? profileThumbnail : DEFAULT_PROFILE_THUMB}
				alt="Profile Thumbnail"
			/>
		);
	};

	return (
		<>
			<MenuButton
				type="button"
				data-bs-toggle="offcanvas"
				data-bs-target={`#${MOBILE_NAV_SIDEBAR_ID}`}
				aria-controls={MOBILE_NAV_SIDEBAR_ID}
				aria-label={MOBILE_NAV_TRIGGER_LABEL}
			>
				<FontAwesomeIcon icon={faBars} style={{ color: `${colors.BLACK}` }} />
			</MenuButton>

			<CanvasNavbarContainer
				className="offcanvas offcanvas-start"
				data-bs-scroll="true"
				data-bs-backdrop="true"
				id={MOBILE_NAV_SIDEBAR_ID}
				aria-labelledby={MOBILE_NAV_LABEL_ID}
			>
				<h2 id={MOBILE_NAV_LABEL_ID} className="visually-hidden">
					{MOBILE_NAV_PANEL_NAME}
				</h2>
				<div className="offcanvas-body p-0 overflow-hidden">
					<NavLink href="/"> 
						HOME
					</NavLink>

					<NavLink href="/donate"> 
						DONATE
					</NavLink>

					<NavLink href="/about"> 
						ABOUT
					</NavLink>

					<NavLink href="/blog"> 
						BLOG
					</NavLink>

					{/** RESOURCES DROPDOWN MENU */}
					<NavDropdown
						id="resources"
						title={
							<EighteenPXSpan> 
								RESOURCES
							</EighteenPXSpan>
						}
					>
						<NavDropdownItemContainer>
							<NavDropdownItem href="/resources">SEE ALL</NavDropdownItem>
							<NavDropdownItem href="/events">EVENTS</NavDropdownItem>
							<NavDropdownItem href="/businesses">BUSINESSES</NavDropdownItem>
							<NavDropdownItem href="/add-resource">ADD A RESOURCE</NavDropdownItem>
						</NavDropdownItemContainer>
					</NavDropdown>

					<NavLink id="search" href="/search"> 
						SEARCH
					</NavLink>

					{/** CONTACT US DROPDOWN MENU */}
					<NavDropdown
						id="contact-us"
						title={
							<EighteenPXSpan> 
								CONTACT US
							</EighteenPXSpan>
						}
					>
						<NavDropdownItemContainer>
							<NavDropdownItem href="/contact-us">CONTACT US</NavDropdownItem>
							<NavDropdownItem href="/volunteer">VOLUNTEER</NavDropdownItem>
							<NavDropdownItem href="/give-feedback">GIVE FEEDBACK</NavDropdownItem>
						</NavDropdownItemContainer>
					</NavDropdown>

					{/** PROFILE DROPDOWN MENU */}
					<BottomNavLinks id="bottom-links">
						{ProfilePic()}
						<NavDropdown
							id="profile"
							title={
								<EighteenPXSpan> 
									PROFILE
								</EighteenPXSpan>
							}
						>
							<NavDropdownItemContainer>
								<NavDropdownItem href="/edit-profile">EDIT PROFILE</NavDropdownItem>
								<NavDropdownItem href="/messages">{MessagesIcon()} MESSAGES</NavDropdownItem>
								<NavDropdownItem href="/notifications">NOTIFICATIONS</NavDropdownItem>
								<NavDropdownItem href="/help">HELP/SUPPORT</NavDropdownItem>
								<NavDropdownItem href="/feedback">GIVE FEEDBACK</NavDropdownItem>
								<NavDropdownItem href="/logout">LOG OUT</NavDropdownItem>
							</NavDropdownItemContainer>
						</NavDropdown>
					</BottomNavLinks>
				</div>
			</CanvasNavbarContainer>
		</>
	);
};

export default NavBar;

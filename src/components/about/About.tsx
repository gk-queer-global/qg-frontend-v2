/* eslint-disable */
import React, { FC } from "react";
import {
	AboutMain,
	WhiteBGSection,
	PurpleSpan,
	DarkGreyBGSection,
	AboutNavLink,
} from './About.css';

const About: FC = () => {
	return (
		<>
			<AboutMain>
				<WhiteBGSection>
					<h2>ABOUT US.</h2>
					<p>We support and prioritize the people who are least represented in an outside of the rainbow umbrella. We want to give the community a safe, inviting space to confidently be themselves, easily find accurate, trusted information, share common experiences, and have the ability to support other LGBTQIA+ people and businesses in their area.</p>
			
					<h2>WE ARE <PurpleSpan>united</PurpleSpan>.</h2>
					<p>We are Black. We are Latinx. We are Asian, Middle Eastern, White, Bi and Multi-Racial. We are tall, short, curvy, plus size, fat. We use chairs, canes, crutches, lifts, and braces.</p>

					<p><strong>And we believe that kind of diversity is what makes Queerness beautiful.</strong></p>

					<p>We strive to be a place where ALL people can talk about the solutions they found to specific crises in their lives, so other people do not have to go through them as well. A place where people do not have to fear outing themselves to coworkers and friends who follow them when discussing physical limitations, needs for legal advice, future medical procedures, or their financial situations. Queer Global is a worldwide masterlist for marginalized peoples in the Queer community.</p>
			
					<h2>WE ARE <PurpleSpan>proud</PurpleSpan>.</h2>
					<p>Queer Global is run by a Black trans/pan/poly/not-so-able-bodied man and a multi-racial pan/poly musician, business owner, stylist and vintage clothing expert.</p>
			
					<p>Our goal is to provide a platform that consolidates resources and information for people outside of the Big 5 social media platforms, where it gets buried in posts, behind locked accounts and manipulative algorithms.</p>

					<p>We embraced the transparency of shared community advice and information. With all the resources you need at your fingertips, we hope you can be confident in just being yourself every day.</p>

					<p>We believe providing information is only the beginning & we're just getting started.</p>

					<em>Deacon & D'Arcy</em>
					<div>INSERT PIC</div>
				</WhiteBGSection>

				<DarkGreyBGSection>
					<h2>WE ARE <PurpleSpan>family</PurpleSpan>.</h2>
					<small>Our amazing volunteers!</small>
					<div>INSERT THUMBNAILS</div>

					<small>We're all different, but still all the same. Our family is always growing.</small>
					<AboutNavLink href="/get-involved">
						SEE VOLUNTEER OPPORTUNITIES
					</AboutNavLink>
					
					<small>We want YOU to feel represented and worthy as you are. The people you see on our site are real Queer Global members. Want to join them?</small>
					<AboutNavLink href="/contact-us">
						SEND US YOUR PHOTO OR ARTWORK
					</AboutNavLink>
			
					<h2>WE ARE HERE FOR <PurpleSpan>you</PurpleSpan>.</h2>
					<p>We do our best to provide up-to-date, accurate resources and information, but we could always use a helping hand. If you know of any helpful resources, please help us and the rest of our community out and add them.</p>
					<AboutNavLink href="/add-resource">ADD A RESOURCE</AboutNavLink>
				</DarkGreyBGSection>
			</AboutMain>
		</>
	);
};

export default About;

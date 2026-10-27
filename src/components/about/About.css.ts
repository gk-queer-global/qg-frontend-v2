import styled from 'styled-components';

/* #655DC6 for purple */
/* #F5ACB8 for pink */
/* #1F1F1F for dark gray bg */
/* #764D25 for brown gradient in footer */
/* #C59B6C for light brown gradient in footer */
/* #48ADE5 for blue circle on home page */

export const WhiteBGSection = styled.div`
  background-color: white;
`;

export const DarkGreyBGSection = styled.div`
  background-color: #1F1F1F;
  color: white;
`;

export const AboutMain = styled.div`
  display: flex; 
  flex-direction: column; 
  margin: 10%;
`;

export const PurpleSpan = styled.span`
  color: #655DC6;
`;

/** Matches native button appearance so link navigation does not change layout. */
export const AboutNavLink = styled.a`
  box-sizing: border-box;
  display: inline-block;
  padding: 1px 6px;
  font: inherit;
  text-align: center;
  text-decoration: none;
  cursor: default;
  color: buttontext;
  background-color: buttonface;
  border: 1px solid buttonborder;
`;
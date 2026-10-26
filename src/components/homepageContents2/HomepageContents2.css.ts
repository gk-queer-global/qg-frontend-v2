import styled from 'styled-components';
import colors from '../../styles/colors';

export const HomepageContents2Wrapper = styled.div`
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin: 62px auto 0;
`;

export const Header3 = styled.h2`
  color: ${colors.BLACK};
  font-size: 24px;
  font-weight: bold;
  text-transform: uppercase;
  padding: 10px;
`;

export const HomepageBottom = styled.div`
  text-align: center;
  margin: 0 auto;

  & div:first-child,
  & button { margin: 0 auto; }
`;

export const SubHeader = styled.h2`
  color: ${colors.BLACK};
  font-size: 24px;
  font-weight: bold;
  margin: 48px 0 -5px -40px;
`;

export const Span = styled.span`
  color: ${colors.UNICORN};
  font-size: 48px;
  font-weight: 800;
  margin-left: -35%;
  margin-bottom: -5px;
  display: inline-block;
`;

export const SubHeader1 = styled.h2`
  color: ${colors.BLACK};
  font-size: 24px;
  font-weight: bold;
`;

export const SubHeader2 = styled.h2`
  color: ${colors.BLACK};
  font-size: 24px;
  font-weight: bold;
  margin-left: 15%;
`;

export const SubHeader3 = styled.h2`
  color: ${colors.BLACK};
  font-size: 24px;
  font-weight: bold;
  margin-left: 20%;
`;

export const ImageWrapper1 = styled.div`
  max-width: 100%;
  margin: 5px 0 25px;
  text-align: center;
`;

export const Image = styled.img`
  height: auto;
  width: 400px;
`;

export const Content = styled.p`
  padding: 10px;
`;

export const ImageWrapper2 = styled.div`
  display: grid;
  grid-template-columns: 90% 85% repeat(2, 1fr);
  height: 160px;
  max-width: 100%;
  margin-top: 30px;
  margin-bottom: 25px;
  gap: 10px;
`;

export const Image1 = styled.div`
  background-color: firebrick;
  margin-left: -120px;
  height: 160px; /*this will change to % once we have the images*/
`;

export const Image2 = styled.div`
  background-color: firebrick;
  height: 160px; /*this will change to % once we have the images*/
`;

export const Text = styled.p`
  font-size: 14px;
  color: ${colors.BLACK};
`;

export const ButtonWrapper = styled.div`
  margin-bottom: 40px;
  width: 70%;
`;

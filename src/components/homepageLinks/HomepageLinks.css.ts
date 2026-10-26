import styled from 'styled-components';
import colors from '../../styles/colors';

export const LinksWrapperProps = styled.div`
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin: 62px auto 0;

  & button {
    margin: 28px auto;
  }
`;

export const Header2 = styled.h2`
  color: ${colors.BLACK};
  font-weight: bold;
  font-size: 24px;
  text-transform: uppercase;
`;

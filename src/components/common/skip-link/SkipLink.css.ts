import styled from 'styled-components';
import colors from '../../../styles/colors';

export const SkipLinkAnchor = styled.a`
  position: absolute;
  left: -9999px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
  z-index: 10000;
  padding: 0.75rem 1rem;
  background-color: ${colors.WHITE};
  color: ${colors.BLACK};
  font-weight: bold;
  text-decoration: none;

  &:focus {
    left: 0.5rem;
    top: 0.5rem;
    width: auto;
    height: auto;
    overflow: visible;
    outline: 2px solid ${colors.WHITE};
    outline-offset: 2px;
  }
`;

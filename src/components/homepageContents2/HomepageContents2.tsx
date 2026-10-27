/* eslint-disable */
import React, {FC} from 'react';

import Button from '../common/button/Button';
import {
  HomepageContents2Wrapper,
  Header3,
  SubHeader,
  SubHeader1,
  SubHeader2,
  SubHeader3,
  ImageWrapper1,
  Image,
  Span,
  ButtonWrapper,
  Content,
  HomepageBottom
} from './HomepageContents2.css'
import middleImage from '../../assets/home/middle_image.jpg';

const HomepageContents2: FC = () => {
  return (
    <HomepageContents2Wrapper>
      <ImageWrapper1>
        <Image
          src={middleImage}
          alt="Diverse Queer Global members representing inclusive community faces"
        />
      </ImageWrapper1>
      <Header3>Your face is lovely, <br />
              can we use it?
      </Header3>
      <Content>
        We believe every face, every body, and every differently-abled or colored human is beautiful just as they are, and are worthy of representation as such. <br /><br />
      
        For that reason, all the people you see on our site are real Queer Global members. If you'd like to be a face of QG, send us your photo! We'd be happy to have you!
      </Content>
      <HomepageBottom>
        <ButtonWrapper>
          <Button label="primary" buttonText='Send us your photo' />
        </ButtonWrapper>
        <SubHeader>A place for</SubHeader>
        <SubHeader1><Span>you</Span>,</SubHeader1>
        <SubHeader2>you beautiful</SubHeader2>
        <SubHeader3>human.</SubHeader3>
      </HomepageBottom>
    </HomepageContents2Wrapper>
  );
}

export default HomepageContents2;

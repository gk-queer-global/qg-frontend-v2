import { FC } from 'react';
import { BottomImagesContainer } from './BottomImages.css';
import imgLeft from '../../assets/home/zhang-kaiyv-0u6fBh1CRm8-unsplash.jpg';
import imgRight from '../../assets/home/GettyImages-1284545860.jpg';

const BottomImages: FC = () => {
    return (
        <BottomImagesContainer>
            <img
                src={imgLeft}
                alt="Two LGBTQIA+ people laughing together outdoors"
            />
            <img
                src={imgRight}
                alt="Group of LGBTQIA+ people celebrating at a pride event"
            />
        </BottomImagesContainer>
    );
};

export default BottomImages;

import React, {useState, useEffect} from 'react';

const Slider = ({slides}) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // const autoScroll = () => {
    //     if (currentIndex === slides.length -1) {
    //         return setCurrentIndex(0);
    //     }
    //     return setCurrentIndex(currentIndex + 1);
    // }

    // useEffect(() => {
    //     const interval = setInterval(() => {autoScroll()}, 3000);
    //     return () => clearInterval(interval);
    // })


    
    return (
        <div className = "image-slider">
            <ul>
                {slides.map((slide, index) => (
                    <li key = {index} className = {index === currentIndex ? "active" : ""}>
                        <img 
                            src = {slide.src} 
                            alt = {slide.alt} 
                            style = {{
                                transform: `translateX(calc(-${currentIndex * 100}% - ${currentIndex * 3}rem))`
                            }}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Slider;
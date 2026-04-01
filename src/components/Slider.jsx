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

    const slideLeft = () => {

        return setCurrentIndex(currentIndex - 1);
    }

    const slideRight = () => {
        return setCurrentIndex(currentIndex + 1);
    }



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
			<button id="left-slide" className="left-slide"><i className="fa-solid fa-arrow-left"></i></button>
			<button id="right-slide" className="right-slide"><i className="fa-solid fa-arrow-right"></i></button>
        </div>
    );
}

export default Slider;
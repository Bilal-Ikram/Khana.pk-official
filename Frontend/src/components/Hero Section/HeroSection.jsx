import React, { useState, useEffect } from 'react';
import CreattieEmbed from '../Hero_bg_lottifiles_code/CreattieEmbed';
import CreattieEmbed2 from '../Hero_bg_lottifiles_code/CreattieEmbed2';
import CreattieEmbed3 from '../Hero_bg_lottifiles_code/CreattieEmbed3';
import CreattieEmbed4 from '../Hero_bg_lottifiles_code/CreattieEmbed4';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  const slides = [
    {
      component: <CreattieEmbed />,
      alt: "Food slide 1"
    },
    {
      component: <CreattieEmbed2 />,
      alt: "Food slide 2"
    },
    {
      component: <CreattieEmbed3 />,
      alt: "Food slide 3"
    },
    {
      component: <CreattieEmbed4 />,
      alt: "Food slide 4"
    }
  ];

  const nextSlide = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setCurrentSlide((prev) => (prev + 1) % slides.length);
      setTimeout(() => setIsAnimating(false), 1000);
    }
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [isAnimating]);

  const handleManualSlideChange = (index) => {
    if (!isAnimating && index !== currentSlide) {
      setIsAnimating(true);
      setCurrentSlide(index);
      setTimeout(() => setIsAnimating(false), 1000);
    }
  };

  // Calculate the top padding based on banner visibility
  const topPadding = showBanner ? "pt-[0px]" : "pt-[0px]"; // 144px when banner is visible, 80px when hidden

  return (
    <div className={`relative h-screen ${topPadding}`}>
      {/* Slider Container */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              currentSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <div className="w-full h-full">
              {slide.component}
            </div>
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 z-20">
        <div className="w-full max-w-3xl text-center">
          <h1 className="mb-8 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            Enjoy discounts on <br /> your first order
          </h1>
          
          {/* Search Bar */}
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Your street and street number"
                className="w-full px-4 py-3 text-gray-700 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 text-pink-500 hover:text-pink-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <button className="px-8 py-3 font-semibold text-white transition-colors bg-pink-500 rounded-lg hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2">
              Find food
            </button>
          </div>

          {/* Slide indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => handleManualSlideChange(index)}
                disabled={isAnimating}
                className={`w-2 h-2 rounded-full transition-colors ${
                  currentSlide === index ? 'bg-pink-500' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
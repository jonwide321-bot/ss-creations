import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1920&auto=format&fit=crop',
    title: 'Celebrate Every Special Moment',
    subtitle: 'Discover curated gifts for your loved ones.',
    cta: 'Shop Now',
    color: 'rose'
  },
  {
    image: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=1920&auto=format&fit=crop',
    title: 'New Spring Collection Arrived',
    subtitle: 'Fresh arrivals to brighten someone\'s day.',
    cta: 'View New Arrivals',
    color: 'emerald'
  },
  {
    image: 'https://images.unsplash.com/photo-1527018263374-5adb6a54f01e?q=80&w=1920&auto=format&fit=crop',
    title: 'Personalized With Love',
    subtitle: 'Make it unique with our custom engraving service.',
    cta: 'Get Started',
    color: 'amber'
  }
];

const Hero: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState<boolean[]>(new Array(slides.length).fill(false));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleImageLoad = (index: number) => {
    setLoaded(prev => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
  };

  const scrollToSection = (id: string) => {
    const element = document.querySelector(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="relative h-[85vh] flex items-center overflow-hidden pt-16 bg-stone-200">
      {slides.map((slide, index) => (
        <div 
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          <div className={`absolute inset-0 bg-stone-300 transition-opacity duration-500 ${loaded[index] ? 'opacity-0' : 'opacity-100'}`} />
          <img 
            src={slide.image} 
            alt={slide.title} 
            // PERFORMANCE: fetchpriority="high" for the first slide (LCP)
            loading={index === 0 ? "eager" : "lazy"}
            // @ts-ignore
            fetchpriority={index === 0 ? "high" : "low"}
            decoding="async"
            width="1920"
            height="1080"
            className={`w-full h-full object-cover transition-transform duration-[6000ms] ${index === current ? 'scale-110' : 'scale-100'}`}
            onLoad={() => handleImageLoad(index)}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900/80 via-stone-900/40 to-transparent" aria-hidden="true" />
          
          <div className="relative z-20 max-w-7xl mx-auto px-4 h-full flex items-center">
            <div className={`max-w-2xl text-white transform transition-all duration-1000 delay-300 ${index === current ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              {/* ACCESSIBILITY: H1 for the main page heading */}
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight serif">
                {slide.title.split(' ').map((word, i) => i === 2 ? <span key={i} className="text-rose-300 italic">{word} </span> : word + ' ')}
              </h1>
              <p className="text-lg md:text-xl mb-8 text-stone-200 leading-relaxed font-light">
                {slide.subtitle}
              </p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => scrollToSection('#featured-products')}
                  className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-4 rounded-full font-semibold transition-all shadow-lg hover:shadow-rose-500/25 active:scale-95 min-h-[44px]"
                  aria-label={`Action: ${slide.cta} - See our products`}
                >
                  {slide.cta}
                </button>
                <button 
                  onClick={() => scrollToSection('#ai-finder')}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 px-8 py-4 rounded-full font-semibold transition-all active:scale-95 min-h-[44px]"
                  aria-label="Use the AI-powered Gift Finder tool"
                >
                  Gift Finder AI
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation arrows */}
      <button 
        onClick={prevSlide}
        aria-label="Go to Previous Slide"
        className="absolute left-6 z-30 p-4 rounded-full bg-white/10 hover:bg-white/30 text-white backdrop-blur-md transition-all border border-white/20 hidden md:flex items-center justify-center min-h-[44px] min-w-[44px]"
      >
        <ChevronLeft className="w-6 h-6" aria-hidden="true" />
      </button>
      <button 
        onClick={nextSlide}
        aria-label="Go to Next Slide"
        className="absolute right-6 z-30 p-4 rounded-full bg-white/10 hover:bg-white/30 text-white backdrop-blur-md transition-all border border-white/20 hidden md:flex items-center justify-center min-h-[44px] min-w-[44px]"
      >
        <ChevronRight className="w-6 h-6" aria-hidden="true" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
        {slides.map((_, i) => (
          <button 
            key={i}
            aria-label={`Navigate to slide ${i + 1}`}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all duration-500 ${i === current ? 'bg-white w-10' : 'bg-white/30 w-4'}`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;
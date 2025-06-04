import React, { useEffect, useState } from "react";
import HomePageNavBar from "../../components/HomePageNavBar.jsx";
import Footer from "../../components/Footer";

const HomePage = () => {
  // State to track if device is mobile
  const [isMobile, setIsMobile] = useState(false);

  // Add animation classes when component mounts
  useEffect(() => {
    // Check if device is mobile on initial load
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Run on initial load
    checkMobile();

    // Animate elements with fade-in and slide-up classes
    const animatedElements = document.querySelectorAll('.animate-on-load');
    
    setTimeout(() => {
      animatedElements.forEach((element, index) => {
        // Add staggered delay based on index
        setTimeout(() => {
          element.classList.add('animate-visible');
        }, index * (isMobile ? 150 : 200)); // Different stagger timing based on device
      });
    }, 300); // Initial delay before animations start
    
    // Parallax effect for background
    const handleParallax = () => {
      const scrollPosition = window.scrollY;
      const heroBackground = document.querySelector('.hero-background');
      if (heroBackground) {
        // Reduce parallax intensity on mobile
        const parallaxIntensity = isMobile ? 0.1 : 0.2;
        heroBackground.style.transform = `translateY(${scrollPosition * parallaxIntensity}px)`;
      }
    };
    
    // Resize event listener
    const handleResize = () => {
      checkMobile();
      handleParallax();
    };
    
    window.addEventListener('scroll', handleParallax);
    window.addEventListener('resize', handleResize);
    
    // Clean up event listeners
    return () => {
      window.removeEventListener('scroll', handleParallax);
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobile]);

  return (
    <div className="font-proxima overflow-x-hidden">
      <div>
        <HomePageNavBar />
      </div>

      {/* Hero Section */}
      <div className="relative w-full h-screen overflow-hidden">
        {/* Background image with parallax effect */}
        <div
          className="absolute inset-0 bg-cover bg-center hero-background transition-transform duration-500"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.3)), url("../images/ecotrackwebbg.png")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            transform: "scale(1.05)", // Slight zoom effect on load
          }}
        ></div>

        {/* Content overlay */}
        <div className="relative z-10 flex items-center h-full">
          <div className="container mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center">
            {/* Left side - Heading with animation - Full width on mobile */}
            <div className="w-full md:w-1/2 mb-8 md:mb-0 text-center md:text-left">
              <h1 className="text-white text-4xl sm:text-5xl md:text-7xl font-gotham font-medium leading-tight mb-6 md:mb-30">
                <span className="block animate-on-load animate-slide-right">A Smart App</span>
                <span className="block animate-on-load animate-slide-right" style={{ animationDelay: '0.2s' }}>For A Greener</span>
                <span className="block animate-on-load animate-slide-right" style={{ animationDelay: '0.4s' }}>Home</span>
              </h1>
            </div>

            {/* Right side - Description and CTA button with animations */}
            <div className="w-full md:w-1/2 flex flex-col items-center md:items-start">
              <p className="text-white text-lg sm:text-xl md:text-2xl lg:text-3xl mb-6 md:mb-10 font-bold text-center md:text-left animate-on-load animate-fade-in" style={{ animationDelay: '0.6s' }}>
                Take control of your home energy use right from your phone. Keep 
                track of your energy usage in real-time. Make brighter decisions 
                that are good for you, your family and the environment.
              </p>
              <button
                className="bg-green-600 hover:bg-green-700 mb-12 md:mb-20 text-white font-bold py-2 sm:py-3 px-6 sm:px-8 rounded-full text-base sm:text-lg transition-all duration-300 transform hover:scale-105 animate-on-load animate-bounce-in w-full sm:w-auto text-center"
                style={{ animationDelay: '0.8s' }}
                onClick={() => window.location.href = '/download-app'}
              >
                Get Ecotrack
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Adding animation class to footer */}
      <div className="animate-on-load animate-fade-up">
        <Footer />
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        /* Base classes for animations */
        .animate-on-load {
          opacity: 0;
          transition: all 0.8s ease-out;
        }
        
        .animate-visible {
          opacity: 1;
          transform: translateY(0) translateX(0) scale(1);
        }
        
        /* Specific animations */
        .animate-fade-in {
          opacity: 0;
        }
        
        .animate-slide-right {
          opacity: 0;
          transform: translateX(-50px);
        }
        
        .animate-fade-down {
          opacity: 0;
          transform: translateY(-20px);
        }
        
        .animate-fade-up {
          opacity: 0;
          transform: translateY(20px);
        }
        
        .animate-bounce-in {
          opacity: 0;
          transform: scale(0.8);
        }
        
        /* When these classes become visible */
        .animate-fade-in.animate-visible {
          opacity: 1;
        }
        
        .animate-slide-right.animate-visible {
          opacity: 1;
          transform: translateX(0);
        }
        
        .animate-fade-down.animate-visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        .animate-fade-up.animate-visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        .animate-bounce-in.animate-visible {
          opacity: 1;
          transform: scale(1);
          transition-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        /* Hover animations */
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        .button-pulse:hover {
          animation: pulse 2s infinite;
        }
        
        /* Media queries for responsive design */
        @media (max-width: 768px) {
          .container {
            padding-left: 1rem;
            padding-right: 1rem;
          }
          
          /* Adjust animation for better mobile experience */
          .animate-on-load {
            transition: all 0.6s ease-out;
          }
          
          .animate-slide-right {
            transform: translateX(-30px); /* Reduced slide distance on mobile */
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
import React, { useEffect, useState } from "react";
import HomePageNavBar from "../../components/HomePageNavBar.jsx";
import Footer from "../../components/Footer.jsx";
import { useNavigate, useLocation, Link } from "react-router-dom";

const AdminLogInPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Add animation classes when component mounts
  useEffect(() => {
    // Check if device is mobile or tablet on initial load
    const checkDeviceSize = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
    };
    
    // Run on initial load
    checkDeviceSize();

    // Animate elements with animation classes
    const animatedElements = document.querySelectorAll('.animate-on-load');
    
    setTimeout(() => {
      animatedElements.forEach((element, index) => {
        // Add staggered delay based on index
        // Reduce delay for mobile devices
        const staggerTime = isMobile ? 150 : 200;
        setTimeout(() => {
          element.classList.add('animate-visible');
        }, index * staggerTime);
      });
    }, 300); // Initial delay before animations start
    
    // Add animation to curved shape
    const curvedShape = document.querySelector('.curved-shape');
    setTimeout(() => {
      if (curvedShape) {
        curvedShape.classList.add('shape-animate');
      }
    }, 200);
    
    // Resize event listener
    const handleResize = () => {
      checkDeviceSize();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Clean up event listeners
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobile]);

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      {/* Navbar without animation */}
      <HomePageNavBar />

      {/* Green Background with Curved Shape */}
      <div className="relative bg-green-def flex items-center justify-center p-4 sm:p-6 overflow-hidden min-h-[85vh]">
        {/* Curved shape overlay with animation */}
        <div className="curved-shape absolute bottom-0 right-0 w-[35%] sm:w-[45%] md:w-[55%] h-[100%] bg-[#09570D] rounded-tl-full opacity-0 transition-all duration-1000 ease-out"></div>

        {/* Content container */}
        <div className="container mx-auto relative z-10 px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 sm:mb-8 md:mb-12">
            {/* Left heading with animation */}
            <div className="text-white mb-4 sm:mb-6 md:mb-0 text-center md:text-left w-full md:w-auto">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-proxima leading-tight">
                <span className="block animate-on-load animate-slide-right">Existing EcoTrack</span>
                <span className="block animate-on-load animate-slide-right" style={{ animationDelay: '0.2s' }}>Admins Only</span>
              </h1>
            </div>

            {/* Right text with animation */}
            <div className="mb-15 text-white text-lg sm:text-xl md:text-2xl font-proxima font-light animate-on-load animate-fade-in text-center md:text-left" style={{ animationDelay: '0.4s' }}>
              Sign in to access Admin Dashboard
            </div>
          </div>

          {/* White Card with animation */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl h-auto sm:h-[250px] md:h-[300px] animate-on-load animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <div className="max-w-2xl ml-0 sm:ml-6 md:ml-10 mt-3 sm:mt-4 md:mt-6">
              <h2 className="text-2xl sm:text-2xl md:text-3xl font-bold font-proxima text-gray-800 mb-1 sm:mb-2 animate-on-load animate-fade-in" style={{ animationDelay: '0.8s' }}>
                Admin Dashboard
              </h2>
              <p className="text-gray-600 mb-4 sm:mb-6 md:mb-8 font-proxima font-normal text-sm sm:text-base animate-on-load animate-fade-in" style={{ animationDelay: '1s' }}>
                Manage users, monitor activity, and configure settings
              </p>
              <button
                className="w-full sm:w-auto bg-green-def hover:bg-green-700 text-white font-proxima font-bold py-2 sm:py-2 md:py-3 px-6 sm:px-6 md:px-8 rounded-full transition-all duration-300 transform hover:scale-105 animate-on-load animate-bounce-in" 
                style={{ animationDelay: '1.2s' }}
                onClick={() => navigate("/login")}
              >
                Admin Log In
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />

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
        
        .animate-slide-up {
          opacity: 0;
          transform: translateY(50px);
        }
        
        .animate-bounce-in {
          opacity: 0;
          transform: scale(0.8);
        }
        
        /* Curved shape animation */
        .curved-shape {
          transform: translateX(100px);
          opacity: 0;
        }
        
        .shape-animate {
          transform: translateX(0);
          opacity: 0.2;
        }
        
        /* When these classes become visible */
        .animate-fade-in.animate-visible {
          opacity: 1;
        }
        
        .animate-slide-right.animate-visible {
          opacity: 1;
          transform: translateX(0);
        }
        
        .animate-slide-up.animate-visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        .animate-bounce-in.animate-visible {
          opacity: 1;
          transform: scale(1);
          transition-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1.275);
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
          
          .animate-slide-up {
            transform: translateY(30px); /* Reduced slide distance on mobile */
          }
          
          .curved-shape {
            transform: translateX(50px); /* Reduced movement for curved shape */
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLogInPage;
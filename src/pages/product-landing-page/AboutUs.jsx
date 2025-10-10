import React, { useEffect } from "react";
import HomePageNavBar from "../../components/HomePageNavBar.jsx";
import Footer from "../../components/Footer.jsx";

const AboutUs = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in");
          }
        });
      },
      { threshold: 0.1 }
    );

    const animatedElements = document.querySelectorAll(".animate-on-scroll");
    animatedElements.forEach((el) => observer.observe(el));

    return () => {
      animatedElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
   <div className="bg-gradient-to-br from-white via-gray-50 to-green-50/30">
  <HomePageNavBar />
  <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-5 relative">
    {/* Logo Image - Now with animation */}
    <div className="animate-on-scroll opacity-0 transition-all duration-700 delay-[200ms] flex justify-center mb-5">
      <img
        src="/images/BatelecLogo1.png"
        alt="BATELEC I Logo"
        className="w-40 h-40 object-contain transform transition-all duration-500 hover:scale-105"
      />
    </div>
        
        {/* Our Story */}
        <div className="animate-on-scroll opacity-0 transition-all duration-700 delay-[600ms] relative z-10">
          <div className="bg-gradient-to-br from-[#E6F7E9] via-emerald-50 to-green-100 p-10 sm:p-12 rounded-3xl w-full max-w-5xl shadow-xl mx-auto border border-green-200/50 relative overflow-hidden hover:shadow-2xl transition-all duration-500">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-25 h-25 bg-gradient-to-br from-[#28A12E]/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-200/40 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative z-10">
              <h2 className="text-[#28A12E] text-3xl sm:text-4xl font-proxima font-semibold text-center mb-6 drop-shadow-sm">
                Our Story
              </h2>
              <p className="text-gray-700 font-proxima text-center text-sm sm:text-base max-w-4xl mx-auto leading-relaxed">
                Since its registration with the National Electrification Administration in 1977, BATELEC I has been a cornerstone of development in Batangas. Governed by a board representing each municipality, the cooperative exists to serve its member-consumer-owners. With a commitment to energy reliability and innovation, BATELEC I continues to bridge the gap between communities and progress through improved electrification and modern services.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col mt-10 md:flex-row justify-center items-stretch gap-8 mb-12 relative z-10">
          {/* Mission */}
          <div className="animate-on-scroll opacity-0 transition-all duration-700 delay-[0ms] flex-1">
            <div className="flex flex-col items-center text-center h-full group">
              <div className="w-40 h-40 sm:w-44 sm:h-44 bg-gradient-to-br from-[#28A12E] to-emerald-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 mb-6">
                <h2 className="text-white text-xl sm:text-2xl font-proxima font-semibold">
                  Mission
                </h2>
              </div>
              <div className="mt-0 bg-gradient-to-br from-[#F3EBFF] to-purple-100 px-6 py-8 rounded-2xl w-full max-w-[380px] h-[200px] shadow-md hover:shadow-lg transition-all duration-300 border border-purple-200/50 flex items-center">
                <p className="text-gray-700 font-proxima text-sm sm:text-base leading-relaxed">
                  Delivering reliable, safe,and quality electric service to the member-consumer-owners 
                  of Batangas through responsible, community-centered operations.
                </p>
              </div>
            </div>
          </div>

          {/* Who We Are */}
          <div className="animate-on-scroll opacity-0 transition-all duration-700 delay-[200ms] flex-1">
            <div className="flex flex-col items-center text-center h-full group">
              <div className="w-40 h-40 sm:w-44 sm:h-44 bg-gradient-to-br from-[#28A12E] to-emerald-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 mb-6">
                <h2 className="text-white text-xl sm:text-2xl font-proxima font-semibold">
                  Who We Are
                </h2>
              </div>
              <div className="mt-0 bg-gradient-to-br from-[#F3EBFF] to-blue-100 px-6 py-8 rounded-2xl w-full max-w-[380px] h-[240px] shadow-md hover:shadow-lg transition-all duration-300 border border-blue-200/50 flex items-center">
                <p className="text-gray-700 font-proxima text-sm sm:text-base leading-relaxed">
                  Batangas I Electric Cooperative, Inc. (BATELEC I) is a member-owned electric cooperative 
                  established in 1977, serving 12 municipalities across Batangas with dedication and transparency.
                </p>
              </div>
            </div>
          </div>

          {/* Vision */}
          <div className="animate-on-scroll opacity-0 transition-all duration-700 delay-[400ms] flex-1">
            <div className="flex flex-col items-center text-center h-full group">
              <div className="w-40 h-40 sm:w-44 sm:h-44 bg-gradient-to-br from-[#28A12E] to-emerald-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 mb-6">
                <h2 className="text-white text-xl sm:text-2xl font-proxima font-semibold">
                  Vision
                </h2>
              </div>
              <div className="mt-0 bg-gradient-to-br from-[#F3EBFF] to-green-100 px-6 py-8 rounded-2xl w-full max-w-[380px] h-[200px] shadow-md hover:shadow-lg transition-all duration-300 border border-green-200/50 flex items-center">
                <p className="text-gray-700 font-proxima text-sm sm:text-base leading-relaxed">
                  To be a premier electric cooperative empowering every Batangueño household
                   with sustainable, accessible, and efficient electricity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Enhanced Animation styles */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in {
          opacity: 1 !important;
          animation: fadeInUp 0.9s ease-out forwards;
        }

        .animate-fade-in:nth-child(1) {
          animation: fadeInLeft 0.9s ease-out forwards;
        }

        .animate-fade-in:nth-child(2) {
          animation: fadeInUp 0.9s ease-out forwards;
        }

        .animate-fade-in:nth-child(3) {
          animation: fadeInRight 0.9s ease-out forwards;
        }

        /* Subtle hover animations */
        @keyframes gentleFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }

        .group:hover {
          animation: gentleFloat 2s ease-in-out infinite;
        }

        /* Improved shadow transitions */
        .group-hover\\:shadow-xl:hover {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
        }

        .hover\\:shadow-lg:hover {
          box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.1);
        }

        .hover\\:shadow-2xl:hover {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  );
};

export default AboutUs;
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
    <div className="bg-white">
      <HomePageNavBar />

      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
        <div className="flex flex-col md:flex-row justify-center items-center gap-12 mb-12">
          {/* Mission */}
          <div className="animate-on-scroll opacity-0 transition-opacity delay-[0ms] flex-1">
            <div className="flex flex-col items-center text-center">
              <div className="w-36 h-36 sm:w-40 sm:h-40 bg-[#28A12E] rounded-full flex items-center justify-center">
                <h2 className="text-white text-xl sm:text-2xl font-proxima font-semibold">
                  Mission
                </h2>
              </div>
              <div className="mt-6 bg-[#F3EBFF] px-4 py-6 rounded-lg w-[350px] h-[178px]">
                <p className="text-gray-700 font-proxima text-sm sm:text-base leading-relaxed">
                  Delivering reliable, safe,and quality electric service to the member-consumer-owners 
                  of Batangas through responsible, community-centered operations.
                </p>
              </div>
            </div>
          </div>

          {/* Who We Are */}
          <div className="animate-on-scroll opacity-0 transition-opacity delay-[200ms] flex-1">
            <div className="flex flex-col items-center text-center">
              <div className="w-36 h-36 sm:w-40 sm:h-40 bg-[#28A12E] rounded-full flex items-center justify-center">
                <h2 className="text-white text-xl sm:text-2xl font-proxima font-semibold">
                  Who We Are
                </h2>
              </div>
              <div className="mt-6 bg-[#F3EBFF] px-4 py-6 rounded-lg w-[350px] h-[300x]">
                <p className="text-gray-700 font-proxima text-sm sm:text-base leading-relaxed">
                  Batangas I Electric Cooperative, Inc. (BATELEC I) is a member-owned electric cooperative 
                  established in 1977, serving 12 municipalities across Batangas with dedication and transparency.
                  
                </p>
              </div>
            </div>
          </div>

          {/* Vision */}
          <div className="animate-on-scroll opacity-0 transition-opacity delay-[400ms] flex-1">
            <div className="flex flex-col items-center text-center">
              <div className="w-36 h-36 sm:w-40 sm:h-40 bg-[#28A12E] rounded-full flex items-center justify-center">
                <h2 className="text-white text-xl sm:text-2xl font-proxima font-semibold">
                  Vision
                </h2>
              </div>
              <div className="mt-6 bg-[#F3EBFF] px-4 py-6 rounded-lg w-[350px] h-[178px]">
                <p className="text-gray-700 font-proxima text-sm sm:text-base leading-relaxed">
                  To be a premier electric cooperative empowering every Batangueño household
                   with sustainable, accessible, and efficient electricity.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Our Story */}
        <div className="mt-16 animate-on-scroll opacity-0 transition-opacity delay-[600ms]">
          <div className="bg-[#E6F7E9] p-8 sm:p-10 rounded-lg w-full max-w-5xl shadow-sm mx-auto">
            <h2 className="text-[#28A12E] text-2xl sm:text-3xl font-proxima font-semibold text-center mb-4">
              Our Story
            </h2>
            <p className="text-gray-700 font-proxima text-center text-sm sm:text-base max-w-4xl mx-auto leading-relaxed">
              Since its registration with the National Electrification Administration in 1977, BATELEC I has been a cornerstone of development in Batangas. Governed by a board representing each municipality, the cooperative exists to serve its member-consumer-owners. With a commitment to energy reliability and innovation, BATELEC I continues to bridge the gap between communities and progress through improved electrification and modern services.
            </p>
          </div>
        </div>
      </div>

      <div className="animate-on-scroll opacity-0 transition-opacity delay-[800ms]">
        <Footer />
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          opacity: 1 !important;
          animation: fadeIn 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AboutUs;
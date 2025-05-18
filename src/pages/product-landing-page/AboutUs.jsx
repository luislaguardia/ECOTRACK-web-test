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
        <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-12">
          {/* Mission */}
          <div className="animate-on-scroll opacity-0 transition-opacity delay-[0ms] flex-1">
            <div className="flex flex-col items-center text-center">
              <div className="w-36 h-36 sm:w-40 sm:h-40 bg-[#28A12E] rounded-full flex items-center justify-center">
                <h2 className="text-white text-xl sm:text-2xl font-proxima font-semibold">
                  Mission
                </h2>
              </div>
              <div className="mt-6 bg-[#F3EBFF] px-4 py-6 rounded-lg w-full max-w-xs">
                <p className="text-gray-700 font-proxima text-sm sm:text-base leading-relaxed">
                  Empowering BATELEC I consumers with real-time energy insights
                  for smarter conservation.
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
              <div className="mt-6 bg-[#F3EBFF] px-4 py-6 rounded-lg w-full max-w-xs">
                <p className="text-gray-700 font-proxima text-sm sm:text-base leading-relaxed">
                  A team of innovative developers solving energy challenges in
                  Nasugbu, Batangas.
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
              <div className="mt-6 bg-[#F3EBFF] px-4 py-6 rounded-lg w-full max-w-xs">
                <p className="text-gray-700 font-proxima text-sm sm:text-base leading-relaxed">
                  Creating a future where energy conservation is accessible for
                  all households.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Our Story */}
        <div className="mt-16 animate-on-scroll opacity-0 transition-opacity delay-[600ms]">
          <div className="bg-[#E6F7E9] p-8 sm:p-10 rounded-lg shadow-sm">
            <h2 className="text-[#28A12E] text-2xl sm:text-3xl font-proxima font-semibold text-center mb-4">
              Our Story
            </h2>
            <p className="text-gray-700 font-proxima text-center text-sm sm:text-base max-w-4xl mx-auto leading-relaxed">
              EcoTrack was developed in partnership with BATELEC I Nasugbu
              branch to address the critical gap between energy awareness and
              conservation behavior. Our IoT-based system empowers consumers to
              monitor their energy usage and make informed decisions for a more
              sustainable future.
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
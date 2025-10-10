import React, { useEffect } from "react";
import HomePageNavBar from "../../components/HomePageNavBar.jsx";
import Footer from "../../components/Footer.jsx";
import { BarChart3, Settings, Home, PlusCircle, Layers } from "lucide-react";

const HowItWorks = () => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-appear");
          }
        });
      },
      { threshold: 0.1 }
    );

    const animatedElements = document.querySelectorAll(".animate-on-scroll");
    animatedElements.forEach((el) => observer.observe(el));

    const phoneMockup = document.querySelector(".phone-mockup");
    if (phoneMockup) {
      setTimeout(() => {
        phoneMockup.classList.add("animate-float");
      }, 500);
    }

    return () => {
      animatedElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <HomePageNavBar />
  
      <div className="flex-1 flex flex-col-reverse lg:flex-row items-center justify-center gap-y-20 lg:gap-x-35 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-20">
        {/* Left side - Steps */}
        <div className="w-full lg:w-[460px] space-y-20 pb-8">          
         <h1 className="text-3xl sm:text-4xl font-bold text-center text-[#109717] mt-12 mb-8 font-proxima animate-on-scroll opacity-0">
          How It Works
        </h1>
  
          {/* Step 1 */}
          <div className="flex items-start space-x-4 sm:space-x-6 animate-on-scroll opacity-0" style={{ animationDelay: "100ms" }}>
            <div className="relative">
              <div className="flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#109717] text-white hover:scale-110 transition-transform duration-300">
                <span className="text-3xl sm:text-4xl font-proxima font-bold">1</span>
              </div>
  
              <div className="absolute left-1/2 top-20 sm:top-24 flex flex-col items-center transform -translate-x-1/2">
                <div className="h-10 sm:h-15 w-0.5 border-l-2 border-dashed border-[#109717]"></div>
                <div
                  className="w-0 h-0"
                  style={{
                    borderLeft: "7px solid transparent",
                    borderRight: "7px solid transparent",
                    borderTop: "14px solid #109717",
                    marginTop: "-1px",
                  }}
                />
              </div>
            </div>
  
            <div className="pt-2 transform transition-all duration-300 hover:translate-x-2">
              <h2 className="text-xl sm:text-2xl font-bold font-proxima text-black mb-2">
                Connect Smart Plugs
              </h2>
              <p className="text-gray-600 font-proxima text-base sm:text-lg">
                Purchase and connect Tasmota smart plugs to your appliances
              </p>
            </div>
          </div>
  
          {/* Step 2 */}
          <div className="flex items-start space-x-4 sm:space-x-6 animate-on-scroll opacity-0" style={{ animationDelay: "300ms" }}>
            <div className="relative">
              <div className="flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#109717] text-white hover:scale-110 transition-transform duration-300">
                <span className="text-3xl sm:text-4xl font-proxima font-bold">2</span>
              </div>
  
              <div className="absolute left-1/2 top-20 sm:top-24 flex flex-col items-center transform -translate-x-1/2">
                <div className="h-10 sm:h-15 w-0.5 border-l-2 border-dashed border-[#109717]"></div>
                <div
                  className="w-0 h-0"
                  style={{
                    borderLeft: "7px solid transparent",
                    borderRight: "7px solid transparent",
                    borderTop: "14px solid #109717",
                    marginTop: "-1px",
                  }}
                />
              </div>
            </div>
  
            <div className="pt-2 transform transition-all duration-300 hover:translate-x-2">
              <h2 className="text-xl sm:text-2xl font-bold font-proxima text-black mb-2">
                Monitor in Real-Time
              </h2>
              <p className="text-gray-500 font-proxima text-base sm:text-lg">
                Track energy usage per device with detailed dashboards
              </p>
            </div>
          </div>
  
          {/* Step 3 */}
          <div className="flex items-start space-x-4 sm:space-x-6 animate-on-scroll opacity-0" style={{ animationDelay: "500ms" }}>
            <div>
              <div className="flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#109717] text-white hover:scale-110 transition-transform duration-300">
                <span className="text-3xl sm:text-4xl font-bold font-proxima">3</span>
              </div>
            </div>
            <div className="pt-2 transform transition-all duration-300 hover:translate-x-2">
              <h2 className="text-xl sm:text-2xl font-bold font-proxima text-black mb-2">
                Get AI Recommendations
              </h2>
              <p className="text-gray-500 font-proxima text-base sm:text-lg">
                Receive personalized tips to optimize energy consumption
              </p>
            </div>
          </div>
        </div>
  
        {/* Right side - Phone Mockup */}
        <div className="relative flex items-center justify-center animate-on-scroll opacity-0 w-full lg:w-auto" style={{ animationDelay: "700ms" }}>
          <div className="relative flex items-center justify-center w-full max-w-xs sm:max-w-sm">
            <img
              src="/images/how-it-works/behindphone.png"
              alt="Candlestick Design"
              className="absolute z-0 opacity-100 scale-150 sm:scale-[2.3] translate-y-12"
            />
            <div
              className="relative z-10 mt-12 sm:mt-20 phone-mockup"
              style={{
                width: "260px",
                borderRadius: "20px",
                padding: "10px",
                background: "white",
                boxShadow:
                  "inset 0 4px 12px rgba(0, 0, 0, 0.1), inset 0 -4px 12px rgba(0, 0, 0, 0.1), 0 8px 24px rgba(0, 0, 0, 0.05)",
              }}
            >
              <img
                src="/images/how-it-works/Dashboard.png"
                alt="App Screenshot"
                style={{ width: "100%", borderRadius: "20px" }}
              />
            </div>
          </div>
        </div>
      </div>
  
      <Footer />
    </div>
  );
};

// Add custom animation styles
const styleTag = document.createElement("style");
styleTag.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes float {
    0% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
    100% {
      transform: translateY(0px);
    }
  }

  .animate-appear {
    animation: fadeInUp 0.8s ease-out forwards;
  }

  .animate-float {
    animation: float 4s ease-in-out infinite;
  }
`;
document.head.appendChild(styleTag);

export default HowItWorks;
import React, { useEffect } from "react";
import HomePageNavBar from "../../components/HomePageNavBar.jsx";
import Footer from "../../components/Footer.jsx";

const Features = () => {
  // Animation effect for feature cards on scroll
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

    const featureCards = document.querySelectorAll(".feature-card");
    featureCards.forEach((card) => observer.observe(card));

    return () => {
      featureCards.forEach((card) => observer.unobserve(card));
    };
  }, []);

  const features = [
    {
      icon: (
        <div className="relative -mt-18 mb-1 flex justify-center">
          <div className="rounded-full w-40 h-40 flex items-center justify-center">
            <img
              src="/images/features/real-time-monitoring.png"
              alt="Real-time Monitoring"
              className="w-40 h-40 object-contain"
            />
          </div>
        </div>
      ),
      title: "Real-time Monitoring",
      description: "Track energy consumption of individual appliances",
    },
    {
      icon: (
        <div className="relative -mt-18 mb-1 flex justify-center">
          <div className="rounded-full w-40 h-40 flex items-center justify-center">
            <img
              src="/images/features/ai-recommendations.png"
              alt="AI Recommendations"
              className="w-40 h-40 object-contain"
            />
          </div>
        </div>
      ),
      title: "AI Recommendations",
      description: "Personalized energy-saving tip for your household",
    },
    {
      icon: (
        <div className="relative -mt-18 mb-1 flex justify-center">
          <div className="rounded-full w-40 h-40 flex items-center justify-center">
            <img
              src="/images/features/mobile-control.png"
              alt="Mobile Control"
              className="w-40 h-40 object-contain"
            />
          </div>
        </div>
      ),
      title: "Mobile Control",
      description: "Manage your devices from anywhere",
    },
    {
      icon: (
        <div className="relative -mt-18 mb-1 flex justify-center">
          <div className="rounded-full w-40 h-40 flex items-center justify-center">
            <img
              src="/images/features/data-visualization.png"
              alt="Data Visualization"
              className="w-40 h-40 object-contain"
            />
          </div>
        </div>
      ),
      title: "Data Visualization",
      description: "Intuitive charts and graphs of your energy usage",
    },
    {
      icon: (
        <div className="relative -mt-18 mb-1 flex justify-center">
          <div className="rounded-full w-40 h-40 flex items-center justify-center">
            <img
              src="/images/features/brownout-alerts.png"
              alt="Brownout Alerts"
              className="w-40 h-40 object-contain"
            />
          </div>
        </div>
      ),
      title: "Brownout Alerts",
      description: "Get notified about planned power interruptions",
    },
    {
      icon: (
        <div className="relative -mt-18 mb-1 flex justify-center">
          <div className="rounded-full w-40 h-40 flex items-center justify-center">
            <img
              src="/images/features/news-and-updates.png"
              alt="News and Updates"
              className="w-40 h-40 object-contain"
            />
          </div>
        </div>
      ),
      title: "News and Updates",
      description: "Be informed about the latest news and updates of BATELEC 1",
    },
  ];

  return (
    <div>
      <HomePageNavBar />
      <div
        className="min-h-85 py-8 px-4"
        style={{
          backgroundImage: "url('/images/FeaturesBG.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-6xl mx-auto p-15">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-18">
            {features.map((feature, index) => (
              <div
                key={index}
                className="feature-card bg-white rounded-lg p-6 shadow-md flex flex-col items-center transform transition-all duration-500 hover:shadow-xl hover:scale-105 opacity-0"
                style={{ 
                  animationDelay: `${index * 150}ms`,
                  transitionDelay: `${index * 50}ms` 
                }}
              >
                <div className="mb-4">{feature.icon}</div>
                <h2 className="text-xl font-bold font-proxima text-center mb-2">
                  {feature.title}
                </h2>
                <p className="text-center text-sm font-proxima text-gray-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

// Add custom animation styles
const styleTag = document.createElement('style');
styleTag.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-fade-in {
    animation: fadeIn 0.6s ease-out forwards;
  }
`;
document.head.appendChild(styleTag);

export default Features;
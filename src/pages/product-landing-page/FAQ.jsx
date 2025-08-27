import React, { useState } from "react";
import HomePageNavBar from "../../components/HomePageNavBar.jsx";
import Footer from "../../components/Footer.jsx";

const FAQ = () => {
  const [openIndexes, setOpenIndexes] = useState([]);

  const faqItems = [
    {
      question: "What is EcoTrack and how does it work?",
      answer:
        "EcoTrack is an energy monitoring system that uses smart plugs to track your electricity usage in real-time. Connect the Tasmota-flashed smart plugs to your appliances, and monitor consumption through our mobile app.",
    },
    {
      question: "How does EcoTrack work?",
      answer:
        "EcoTrack connects with Tasmota-flashed smart plugs installed on appliances. These smart plugs send usage data to EcoTrack, which you can monitor on your phone. The system also uses AI to analyze your consumption patterns and suggest ways to reduce electricity use.",
    },
    {
      question: "Who can use EcoTrack?",
      answer:
        "EcoTrack is designed for residential consumers of BATELEC I Nasugbu. Anyone who wants to monitor and manage their household energy usage more efficiently can use it.",
    },
    {
      question: "Do I need special hardware?",
      answer:
        "Yes. You'll need Tasmota-flashed smart plugs to connect your appliances to the app. These are affordable and user-installed devices available online.",
    },
    {
      question: "Is it safe to use?",
      answer:
        "Yes. EcoTrack uses encryption protocols to ensure your data is private and secure. You also control what data is shared via the mobile app settings"
    },
    {
      question: "Can it show me which appliance uses the most electricity?",
      answer:
        "Absolutely. One of EcoTrack's core features is appliance-level tracking, so you'll see exactly which devices consume the most power in real time.",
    },
    {
      question: "Does it work during a brownout?",
      answer:
        "While real-time data monitoring won't be available during a brownout, EcoTrack will notify you in advance of scheduled brownouts so you can prepare.",
    },
    {
      question: "Is this connected to my electric bill?",
      answer:
        "Not directly. EcoTrack is independent of BATELEC I's billing system. It helps you understand and manage your usage but does not affect or access your actual billing records.",
    },
    {
      question: "Will EcoTrack help me save money?",
      answer:
        "Yes. By showing where and how you use electricity, and providing AI-generated tips, EcoTrack can help you change habits and reduce unnecessary energy use, which can lower your monthly bill.",
    },
    {
      question: "Is this available outside Nasugbu?",
      answer:
        "Currently, EcoTrack is only available for users under BATELEC I's Nasugbu branch. Expansion to other areas may happen after this pilot phase.",
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndexes((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <HomePageNavBar />
      
      <div className="flex-grow py-12 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-semibold font-proxima text-gray-800 text-center mb-10 animate-fadeIn">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6 mx-auto px-4 sm:px-8 mb-8">
            {faqItems.map((item, index) => (
              <div 
                key={index} 
                className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md"
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  animationDuration: '500ms',
                  animationFillMode: 'both',
                  animationName: 'fadeInUp'
                }}
              >
                <div 
                  className={`flex items-center justify-between cursor-pointer py-5 px-6 transition-all duration-300 ${
                    openIndexes.includes(index) ? 'bg-gray-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => toggleFAQ(index)}
                >
                  <div className="flex items-center">
                    <div 
                      className={`w-3 h-3 rounded-full bg-[#00AA44] mr-4 flex-shrink-0 transition-all duration-300 ${
                        openIndexes.includes(index) ? 'opacity-100 scale-125' : 'opacity-50 scale-100'
                      }`}
                    ></div>
                    <h3 
                      className="text-lg font-proxima font-bold text-gray-700 transition-colors duration-300"
                    >
                      {item.question}
                    </h3>
                  </div>
                  <button 
                    className={`w-10 h-10 rounded-full bg-[#00AA44] text-white flex items-center justify-center focus:outline-none flex-shrink-0 ml-4 transition-all duration-300 ${
                      openIndexes.includes(index) ? 'rotate-180 scale-110' : 'rotate-0 scale-100'
                    } hover:brightness-110`}
                    aria-label={openIndexes.includes(index) ? "Collapse" : "Expand"}
                  >
                    <span className="text-xl font-medium">{openIndexes.includes(index) ? "−" : "+"}</span>
                  </button>
                </div>

                <div 
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    openIndexes.includes(index) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="bg-[#F9F9F9] py-5 px-6 border-t border-gray-200">
                    <p className="text-[#555555] font-proxima transition-opacity duration-300">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

// Add global CSS for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fadeIn {
    animation: fadeIn 1s ease-out;
  }
`;
document.head.appendChild(style);

export default FAQ;
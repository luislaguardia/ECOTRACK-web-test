import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

const Footer = () => {
  const [activeSection, setActiveSection] = useState(null);
  const footerRef = useRef(null);

  const handleSectionClick = (section) => {
    const newSection = activeSection === section ? null : section;
    setActiveSection(newSection);
    
    if (newSection && footerRef.current) {
      setTimeout(() => {
        footerRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest'
        });
      }, 100);
    }
  };

  // Optional: Auto-scroll when content finishes expanding
  useEffect(() => {
    if (activeSection && footerRef.current) {
      // Additional scroll after animation completes to ensure full content is visible
      setTimeout(() => {
        footerRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'end'
        });
      }, 600); // Match the animation duration (500ms) plus buffer
    }
  }, [activeSection]);

  const policyContent = {
    privacy: {
      title: "Privacy Policy",
      content: (
        <div className="space-y-4 text-sm leading-relaxed">
          <p>This Privacy Policy explains how We collect, use, store, and protect Your personal data when You access or use EcoTrack.</p>
          
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-blue-300 mb-2">I. DEFINITION OF TERMS</h4>
              <p>1.1 "Personal Data" refers to any information that can be used to identify a BATELEC I customer, such as name, address, account number, contact details, and billing consumption history.</p>
              <p>1.2 "Usage Data" refers to data generated through EcoTrack's features, including monthly consumption data, appliance-level monitoring data from smart plugs, and app interaction logs.</p>
              <p>1.3 "Verification Data" refers to previous or current bill consumption details or documents submitted to confirm account ownership.</p>
            </div>

            <div>
              <h4 className="font-semibold text-blue-300 mb-2">II. INFORMATION WE COLLECT</h4>
              <p>2.1 Registration information including name, address, contact details, and BATELEC I account number.</p>
              <p>2.2 Verification data for confirming customer identity.</p>
              <p>2.3 Usage data from the EcoTrack App, including energy consumption history and smart plug readings.</p>
              <p>2.4 Technical information such as device type, operating system, and IP address.</p>
            </div>

            <div>
              <h4 className="font-semibold text-blue-300 mb-2">III. HOW WE USE YOUR INFORMATION</h4>
              <p>3.1 To verify Your identity and eligibility as a BATELEC I customer.</p>
              <p>3.2 To provide monthly consumption details and real-time appliance monitoring.</p>
              <p>3.3 To deliver AI-generated energy optimization tips.</p>
              <p>3.4 To send official news, updates, and outage notifications.</p>
              <p>3.5 To improve EcoTrack's performance and security.</p>
            </div>

            <div>
              <h4 className="font-semibold text-blue-300 mb-2">IV. DATA SHARING AND SECURITY</h4>
              <p>4.1 We do not sell Your personal data.</p>
              <p>4.2 We share Your data only with authorized BATELEC I administrators for service delivery.</p>
              <p>4.3 We use encryption and secure storage to protect Your data.</p>
            </div>

            <div>
              <h4 className="font-semibold text-blue-300 mb-2">V. USER RIGHTS</h4>
              <p>5.1 You may request to deactivate Your account at any time.</p>
            </div>

            <div>
              <h4 className="font-semibold text-blue-300 mb-2">VI. UPDATES TO THIS POLICY</h4>
              <p>6.1 We may update this Privacy Policy without prior notice.</p>
              <p>6.2 Continued use of EcoTrack after updates constitutes Your acceptance of the revised policy.</p>
            </div>
          </div>
        </div>
      )
    },
    terms: {
      title: "Terms of Service",
      content: (
        <div className="space-y-4 text-sm leading-relaxed">
          <p>These Terms of Service govern your use of the EcoTrack application and services provided by BATELEC I.</p>
          
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-blue-300 mb-2">I. DEFINITION OF TERMS</h4>
              <p>1.1 "Account Holder" refers to the registered user of the EcoTrack Mobile App who is a BATELEC I customer with a valid account number.</p>
              <p>1.2 "Verified Customer" refers to a BATELEC I customer whose account has been verified through submission of previous or current bill consumption details, or through manual approval by an authorized BATELEC I administrator.</p>
              <p>1.3 "Non-Verified Customer" refers to a BATELEC I customer who has an active EcoTrack account but has not completed the verification process.</p>
              <p>1.4 "Smart Plug" refers to a compatible Tasmota-flashed device used to monitor appliance-level electricity consumption in real-time through the EcoTrack App.</p>
            </div>

            <div>
              <h4 className="font-semibold text-blue-300 mb-2">II. GENERAL TERMS AND CONDITIONS</h4>
              <p>2.1 Only BATELEC I customers with a valid account number may register for EcoTrack.</p>
              <p>2.2 Verified Customers have access to both the monthly consumption feature and smart plug integration. Non-Verified Customers have limited access until their verification is completed.</p>
              <p>2.3 We may, from time to time, amend or modify these Terms of Service and the Privacy Policy without prior notice. You are advised to check the latest versions frequently for updates.</p>
              <p>2.4 We may add, change, replace, modify, suspend, or permanently remove any feature of EcoTrack without prior notice.</p>
              <p>2.5 You are responsible for ensuring that you are using the official and most updated version of the EcoTrack Mobile App.</p>
              <p>2.6 All intellectual property rights to the EcoTrack Mobile App, including texts, codes, images, designs, layouts, and graphics, are owned by Us and/or Our licensors. You are prohibited from copying, distributing, or creating derivative works without written consent.</p>
            </div>

            <div>
              <h4 className="font-semibold text-blue-300 mb-2">III. USE OF THE SERVICE</h4>
              <p>3.1 You agree to use EcoTrack only for lawful purposes and in accordance with these Terms of Service.</p>
              <p>3.2 You are responsible for maintaining the confidentiality of your account credentials and all activities under your account.</p>
              <p>3.3 Any unauthorized access, tampering, or misuse of EcoTrack's systems and data is strictly prohibited and may result in account termination and legal action.</p>
            </div>

            <div>
              <h4 className="font-semibold text-blue-300 mb-2">IV. SERVICE AVAILABILITY</h4>
              <p>4.1 EcoTrack depends on internet connectivity, device compatibility, and BATELEC I systems for feature availability.</p>
              <p>4.2 We do not guarantee uninterrupted service and are not liable for downtime caused by system maintenance, outages, or other technical issues.</p>
            </div>

            <div>
              <h4 className="font-semibold text-blue-300 mb-2">V. LIMITATION OF LIABILITY</h4>
              <p>5.1 EcoTrack is provided "as is" without warranties of any kind.</p>
              <p>5.2 We are not liable for indirect damages, loss of savings, or losses caused by the use or inability to use the service.</p>
            </div>

            <div>
              <h4 className="font-semibold text-blue-300 mb-2">VI. TERMINATION</h4>
              <p>6.1 We may suspend or terminate accounts for violations of these Terms of Service.</p>
              <p>6.2 You may request account deactivation at any time.</p>
            </div>
          </div>
        </div>
      )
    },
    contact: {
      title: "Contact Us",
      content: (
        <div className="space-y-4 text-sm leading-relaxed">
          <p>Get in touch with the EcoTrack team for support, feedback, or inquiries.</p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-blue-300 mb-3">Technical Support</h4>
              <div className="space-y-2">
                <p><span className="font-medium">Email:</span> support@ecotrack.ph</p>
                <p><span className="font-medium">Phone:</span> +63 (2) 8123-4567</p>
                <p><span className="font-medium">Hours:</span> Monday - Friday, 8:00 AM - 6:00 PM (PHT)</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-blue-300 mb-3">General Inquiries</h4>
              <div className="space-y-2">
                <p><span className="font-medium">Email:</span> info@ecotrack.ph</p>
                <p><span className="font-medium">Phone:</span> +63 (2) 8765-4321</p>
                <p><span className="font-medium">Address:</span> BATELEC I Building, Balanga City, Bataan, Philippines</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-blue-300 mb-3">Billing Support</h4>
              <div className="space-y-2">
                <p><span className="font-medium">Email:</span> billing@batelec1.com</p>
                <p><span className="font-medium">Phone:</span> +63 (47) 791-1234</p>
                <p><span className="font-medium">Hours:</span> Monday - Friday, 7:30 AM - 4:30 PM (PHT)</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-blue-300 mb-3">Emergency Outages</h4>
              <div className="space-y-2">
                <p><span className="font-medium">Hotline:</span> +63 (47) 791-HELP (4357)</p>
                <p><span className="font-medium">Available:</span> 24/7</p>
                <p className="text-yellow-300 font-medium">For power outages and electrical emergencies</p>
              </div>
            </div>
          </div>

          <div className="border-t border-blue-700 pt-4 mt-6">
            <h4 className="font-semibold text-blue-300 mb-3">Feedback & Suggestions</h4>
            <p>We value your feedback to improve EcoTrack services. Send your suggestions to:</p>
            <p className="font-medium text-blue-200">feedback@ecotrack.ph</p>
          </div>
        </div>
      )
    }
  };

  return (
    <footer ref={footerRef} className="bg-blue-900 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-blue-800">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left text-sm">
            &copy; {new Date().getFullYear()} EcoTrack. All rights reserved.
          </div>
          <div className="flex space-x-6 items-center">
            {Object.entries(policyContent).map(([key, policy]) => (
              <button
                key={key}
                onClick={() => handleSectionClick(key)}
                className="hover:text-blue-300 text-sm transition-colors flex items-center space-x-1 group"
              >
                <span>{policy.title}</span>
                {activeSection === key ? (
                  <ChevronUp size={16} className="transition-transform duration-300" />
                ) : (
                  <ChevronDown size={16} className="transition-transform duration-300 group-hover:translate-y-0.5" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Expanded Content Panel - now rendered conditionally below the footer */}
      {activeSection && (
        <div className="bg-blue-900 border-t border-blue-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-blue-200">
                {policyContent[activeSection]?.title}
              </h3>
              <button
                onClick={() => setActiveSection(null)}
                className="text-blue-300 hover:text-white transition-colors p-1 hover:bg-blue-800 rounded"
              >
                <X size={24} />
              </button>
            </div>
            <div className="bg-blue-800 bg-opacity-50 rounded-lg p-6 shadow-lg">
              {policyContent[activeSection]?.content}
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
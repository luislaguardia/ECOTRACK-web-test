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

  useEffect(() => {
    if (activeSection && footerRef.current) {
      setTimeout(() => {
        footerRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'end'
        });
      }, 600);
    }
  }, [activeSection]);

  const policyContent = {
    privacy: {
      title: "Privacy Policy",
      content: (
        <div className="space-y-4 text-sm leading-relaxed">
          <p>Welcome to the EcoTrack.</p>
          <p>This Privacy Policy explains how We collect, use, store, and protect Your personal data when You access or use EcoTrack.</p>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-blue-300 mb-2">DATA PRIVACY</h4>
              <p>Data Privacy Act Compliance: EcoTrack is committed to compliance with Republic Act No. 10173, also known as the Data Privacy Act of 2012 (DPA), and its implementing rules and regulations. We adhere to the principles of transparency, legitimate purpose, and proportionality in processing Your personal data. As a registered user, You are entitled to rights under the DPA, including the right to be informed, right to access, right to object, right to erasure or blocking, right to damages, and right to data portability. For concerns regarding Your data privacy rights, You may contact Our Data Protection Officer or file a complaint with the National Privacy Commission.</p>
            </div>

            <div>
              <h4 className="font-semibold text-blue-300 mb-2">I. DEFINITION OF TERMS</h4>
              <p>1.1 "Personal Data" refers to any information that can be used to identify a BATELEC I customer, such as name, email address, phone number, BATELEC I account number, and billing consumption history.</p>
              <p>1.2 "Usage Data" refers to data generated through EcoTrack's features, including monthly consumption data obtained from BATELEC I's billing system, appliance-level monitoring data from Tasmota smart plugs, and app interaction logs.</p>
              <p>1.3 "Aggregated Data" refers to anonymized and combined usage statistics collected from all EcoTrack users for system analytics and service improvement purposes.</p>
            </div>

            <div>
              <h4 className="font-semibold text-blue-300 mb-2">II. INFORMATION WE COLLECT</h4>
              <p>2.1 Registration Information:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Full name</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>BATELEC I account number</li>
              </ul>
              <p>2.2 Consumption Data:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Monthly household electricity consumption obtained from BATELEC I's billing system.</li>
                <li>Real-time appliance-level consumption data collected from connected Tasmota smart plugs.</li>
              </ul>
              <p>2.3 Technical Information:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Device type and model</li>
                <li>Operating system version</li>
                <li>IP address</li>
                <li>App interaction logs</li>
              </ul>
              <p>2.4 Aggregated Analytics:</p>
              <p className="ml-4">Anonymized usage statistics, including appliance usage trends, energy consumption patterns, and device breakdown data from all users.</p>
            </div>

            <div>
              <h4 className="font-semibold text-blue-300 mb-2">III. HOW WE USE YOUR INFORMATION</h4>
              <p>3.1 To verify Your identity and eligibility as a BATELEC I customer.</p>
              <p>3.2 To provide monthly household consumption details obtained from BATELEC I's billing system.</p>
              <p>3.3 To enable real-time appliance monitoring through Tasmota smart plugs.</p>
              <p>3.4 To deliver AI-generated energy optimization tips based on Your consumption data.</p>
              <p>3.5 To send official news, updates, and outage notifications from BATELEC I.</p>
              <p>3.6 To generate aggregated analytics for BATELEC I administrators, including dashboard insights, appliance usage trends, and overall energy consumption patterns.</p>
              <p>3.7 To improve EcoTrack's performance, functionality, and security.</p>
            </div>

            <div>
              <h4 className="font-semibold text-blue-300 mb-2">IV. DATA SHARING AND SECURITY</h4>
              <p>4.1 We do not sell Your personal data to third parties.</p>
              <p>4.2 We share Your personal data only with authorized BATELEC I administrators for the purpose of account verification, service delivery, and system management.</p>
              <p>4.3 Aggregated and anonymized usage data may be used internally for analytics and system improvement but does not personally identify individual users.</p>
              <p>4.4 We use encryption and secure storage protocols to protect Your data from unauthorized access.</p>
            </div>

            <div>
              <h4 className="font-semibold text-blue-300 mb-2">V. DATA RETENTION</h4>
              <p>5.1 Your personal data, including name, email address, phone number, and BATELEC I account number, will remain stored in Our system even after You deactivate or delete Your EcoTrack account.</p>
              <p>5.2 This data retention is necessary for record-keeping, compliance, and system integrity purposes.</p>
              <p>5.3 If You have concerns about data retention, You may contact BATELEC I for further assistance.</p>
            </div>

            <div>
              <h4 className="font-semibold text-blue-300 mb-2">VI. USER RIGHTS</h4>
              <p>6.1 You may request to deactivate Your EcoTrack account at any time through contacting the provided BATELEC I contact details.</p>
              <p>6.2 Account deactivation does not result in the immediate deletion of Your personal data, as outlined in Section V of this Privacy Policy.</p>
            </div>

            <div>
              <h4 className="font-semibold text-blue-300 mb-2">VII. UPDATES TO THIS POLICY</h4>
              <p>7.1 We may update this Privacy Policy from time to time without prior notice.</p>
              <p>7.2 Continued use of EcoTrack after updates constitutes Your acceptance of the revised Privacy Policy. You are encouraged to review this policy regularly for any changes.</p>
            </div>
          </div>
        </div>
      )
    },
    terms: {
      title: "Terms of Service",
      content: (
        <div className="space-y-4 text-sm leading-relaxed">
          <p>Welcome to the EcoTrack.</p>
          <p>If You continue to access and use the EcoTrack Mobile App, and subscribe to receive and access information, services, and notifications from EcoTrack, You are expressly agreeing to be bound by all the terms and conditions provided herein (hereinafter referred to as these "Terms of Service") which, together with Our Privacy Policy, govern Our relationship with You in all matters relating to the EcoTrack Mobile App.</p>
          <p>You must be at least 18 years of age and a registered BATELEC I customer to access and use the EcoTrack Mobile App.</p>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-blue-300 mb-2">DATA PRIVACY</h4>
              <p>Data Privacy Act Compliance: EcoTrack is committed to compliance with Republic Act No. 10173, also known as the Data Privacy Act of 2012 (DPA), and its implementing rules and regulations. We adhere to the principles of transparency, legitimate purpose, and proportionality in processing Your personal data. As a registered user, You are entitled to rights under the DPA, including the right to be informed, right to access, right to object, right to erasure or blocking, right to damages, and right to data portability. For concerns regarding Your data privacy rights, You may contact Our Data Protection Officer or file a complaint with the National Privacy Commission.</p>
            </div>

            <div>
              <h4 className="font-semibold text-blue-300 mb-2">I. DEFINITION OF TERMS</h4>
              <p>1.1 "Account Holder" refers to the registered user of the EcoTrack Mobile App who is a BATELEC I customer with a valid account number.</p>
              <p>1.2 "Auto-Verified Customer" refers to an existing BATELEC I customer whose account number and registration details match an account in the BATELEC I system, granting immediate access to the EcoTrack Mobile App upon registration.</p>
              <p>1.3 "Pending Request Customer" refers to a newly installed BATELEC I customer who has registered for EcoTrack but is awaiting manual verification by an authorized BATELEC I administrator. Verification may take 1 to 31 days.</p>
              <p>1.4 "Smart Plug" refers to a compatible Tasmota-flashed device used to monitor appliance-level electricity consumption in real-time through the EcoTrack App.</p>
            </div>

            <div>
              <h4 className="font-semibold text-blue-300 mb-2">II. GENERAL TERMS AND CONDITIONS</h4>
              <p>2.1 Only BATELEC I customers who are at least 18 years of age and possess a valid account number may register for EcoTrack.</p>
              <p>2.2 Auto-Verified Customers have immediate access to both the monthly consumption feature and smart plug integration. Pending Request Customers will receive access upon successful manual verification by BATELEC I administrators.</p>
              <p>2.3 BATELEC I administrators reserve the right to reject registration requests. Rejections may be classified as:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Reject for Review: The applicant may re-register using the same email address.</li>
                <li>Reject for Block: The email address used will be permanently blocked from future registration attempts.</li>
              </ul>
              <p>2.4 We may, from time to time, amend or modify these Terms of Service and the Privacy Policy without prior notice. You are advised to check the latest versions frequently for updates.</p>
              <p>2.5 We may add, change, replace, modify, suspend, or permanently remove any feature of EcoTrack without prior notice.</p>
              <p>2.6 You are responsible for ensuring that you are using the official and most updated version of the EcoTrack Mobile App.</p>
              <p>2.7 All intellectual property rights to the EcoTrack Mobile App, including texts, codes, images, designs, layouts, and graphics, are owned by Us and/or Our licensors. You are prohibited from copying, distributing, or creating derivative works without written consent.</p>
            </div>

            <div>
              <h4 className="font-semibold text-blue-300 mb-2">III. USE OF THE SERVICE</h4>
              <p>3.1 You agree to use EcoTrack only for lawful purposes and in accordance with these Terms of Service.</p>
              <p>3.2 You are responsible for maintaining the confidentiality of your account credentials and all activities under your account.</p>
              <p>3.3 Any unauthorized access, tampering, or misuse of EcoTrack's systems and data is strictly prohibited and may result in account termination and legal action.</p>
              <p>3.4 EcoTrack's smart plug integration feature is compatible only with Tasmota-flashed smart plugs. We do not guarantee compatibility with other smart plug brands or models.</p>
            </div>

            <div>
              <h4 className="font-semibold text-blue-300 mb-2">IV. SERVICE AVAILABILITY</h4>
              <p>4.1 EcoTrack provides AI-generated energy-saving tips based on:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Your overall household consumption data obtained from BATELEC I's billing system.</li>
                <li>Individual appliance consumption data collected from connected Tasmota smart plugs.</li>
              </ul>
              <p>4.2 These AI-generated tips are general recommendations intended to assist You in optimizing energy usage. They do not constitute professional advice and are not guarantees of specific energy savings or cost reductions.</p>
              <p>4.3 You acknowledge that actual energy savings may vary based on individual usage patterns, appliance efficiency, and other factors beyond Our control.</p>
            </div>

            <div>
              <h4 className="font-semibold text-blue-300 mb-2">V. DATA COLLECTION AND ANALYTICS</h4>
              <p>5.1 EcoTrack collects anonymized and aggregated usage data from all users for the purpose of:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Generating dashboard analytics for BATELEC I administrators, including appliance usage trends and energy consumption patterns.</li>
                <li>Improving the overall functionality and performance of the EcoTrack system.</li>
              </ul>
              <p>5.2 This aggregated data does not personally identify individual users and is used solely for system analytics and service improvement.</p>
            </div>

            <div>
              <h4 className="font-semibold text-blue-300 mb-2">VI. SERVICE AVAILABILITY</h4>
              <p>6.1 EcoTrack depends on internet connectivity, device compatibility, BATELEC I systems, and Tasmota smart plug functionality for feature availability.</p>
              <p>6.2 We do not guarantee uninterrupted service and are not liable for downtime caused by system maintenance, outages, or other technical issues.</p>
            </div>

            <div>
              <h4 className="font-semibold text-blue-300 mb-2">VII. LIMITATION OF LIABILITY</h4>
              <p>7.1 EcoTrack is provided "as is" without warranties of any kind.</p>
              <p>7.2 We are not liable for indirect damages, loss of savings, or losses caused by the use or inability to use the service.</p>
              <p>7.3 We are not responsible for the performance, accuracy, or reliability of third-party devices, including Tasmota smart plugs.</p>
            </div>

            <div>
              <h4 className="font-semibold text-blue-300 mb-2">VIII. TERMINATION</h4>
              <p>8.1 We may suspend or terminate accounts for violations of these Terms of Service. BATELEC I administrators have the authority to deactivate accounts of both Auto-Verified and manually verified customers for violations.</p>
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
              <h4 className="font-semibold text-blue-300  mb-3">Customer Service</h4>
              <div className="space-y-2">
                <p><span className="font-medium">Hotline:</span> (043) 233-2238</p>
                <p><span className="font-medium">Mobile:</span> 0908 814 2144 / 0917 627 7847</p>
                <p><span className="font-medium">Email:</span> nasugbu@batelec1.com</p>
                <p><span className="font-medium">Hours:</span> Monday - Friday, 8:00 AM - 5:00 PM</p>
                <p><span className="font-medium">Office:</span> 407 J.P. Laurel Street, Nasugbu, Batangas, Philippines</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-blue-300 mb-3">Emergency Outages</h4>
              <div className="space-y-2">
                <p><span className="font-medium">Hotline:</span> +63 (47) 791-HELP (4357)</p>
                <p><span className="font-medium">Available:</span> 24/7</p>
                <p className="text-orange-200 font-medium">For power outages and electrical emergencies</p>
              </div>
            </div>
          </div>

          <div className="border-t border-blue-700 pt-4 mt-6">
            <h4 className="font-semibold text-blue-300 mb-3">Feedback & Suggestions</h4>
            <p>We value your feedback to improve EcoTrack services. Send your suggestions to:</p>
            <p className="font-medium text-yellow-200">projectsmiski@gmail.com</p>
          </div>
        </div>
      )
    }
  };

  return (
    <footer ref={footerRef} className="bg-blue-800 text-white">
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

      {activeSection && (
        <div className="bg-blue-900 border-t border-blue-900">
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
            <div className="bg-blue-850 border-t border-blue-500 bg-opacity-50 rounded-lg p-17 shadow-2xl max-h-70 overflow-y-auto">
            {policyContent[activeSection]?.content}
          </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;

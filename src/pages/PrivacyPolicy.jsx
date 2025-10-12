import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      
      <div className="space-y-6">
        <p>Welcome to the EcoTrack Privacy Policy.</p>
        <p>This Privacy Policy explains how We collect, use, store, and protect Your personal data when You access or use EcoTrack.</p>

        <div>
          <h2 className="text-xl font-semibold mt-6 mb-3 text-blue-600">I. DEFINITION OF TERMS</h2>
          <p className="mb-2">1.1 "Personal Data" refers to any information that can be used to identify a BATELEC I customer, such as name, email address, phone number, BATELEC I account number, and billing consumption history.</p>
          <p className="mb-2">1.2 "Usage Data" refers to data generated through EcoTrack's features, including monthly consumption data obtained from BATELEC I's billing system, appliance-level monitoring data from Tasmota smart plugs, and app interaction logs.</p>
          <p className="mb-4">1.3 "Aggregated Data" refers to anonymized and combined usage statistics collected from all EcoTrack users for system analytics and service improvement purposes.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-6 mb-3 text-blue-600">II. INFORMATION WE COLLECT</h2>
          <p className="mb-2">2.1 Registration Information:</p>
          <ul className="list-disc list-inside ml-4 mb-2">
            <li>Full name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>BATELEC I account number</li>
          </ul>
          <p className="mb-2">2.2 Consumption Data:</p>
          <ul className="list-disc list-inside ml-4 mb-2">
            <li>Monthly household electricity consumption obtained from BATELEC I's billing system.</li>
            <li>Real-time appliance-level consumption data collected from connected Tasmota smart plugs.</li>
          </ul>
          <p className="mb-2">2.3 Technical Information:</p>
          <ul className="list-disc list-inside ml-4 mb-2">
            <li>Device type and model</li>
            <li>Operating system version</li>
            <li>IP address</li>
            <li>App interaction logs</li>
          </ul>
          <p className="mb-2">2.4 Aggregated Analytics:</p>
          <p className="ml-4 mb-4">Anonymized usage statistics, including appliance usage trends, energy consumption patterns, and device breakdown data from all users.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-6 mb-3 text-blue-600">III. HOW WE USE YOUR INFORMATION</h2>
          <p className="mb-2">3.1 To verify Your identity and eligibility as a BATELEC I customer.</p>
          <p className="mb-2">3.2 To provide monthly household consumption details obtained from BATELEC I's billing system.</p>
          <p className="mb-2">3.3 To enable real-time appliance monitoring through Tasmota smart plugs.</p>
          <p className="mb-2">3.4 To deliver AI-generated energy optimization tips based on Your consumption data.</p>
          <p className="mb-2">3.5 To send official news, updates, and outage notifications from BATELEC I.</p>
          <p className="mb-2">3.6 To generate aggregated analytics for BATELEC I administrators, including dashboard insights, appliance usage trends, and overall energy consumption patterns.</p>
          <p className="mb-4">3.7 To improve EcoTrack's performance, functionality, and security.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-6 mb-3 text-blue-600">IV. DATA SHARING AND SECURITY</h2>
          <p className="mb-2">4.1 We do not sell Your personal data to third parties.</p>
          <p className="mb-2">4.2 We share Your personal data only with authorized BATELEC I administrators for the purpose of account verification, service delivery, and system management.</p>
          <p className="mb-2">4.3 Aggregated and anonymized usage data may be used internally for analytics and system improvement but does not personally identify individual users.</p>
          <p className="mb-4">4.4 We use encryption and secure storage protocols to protect Your data from unauthorized access.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-6 mb-3 text-blue-600">V. DATA RETENTION</h2>
          <p className="mb-2">5.1 Your personal data, including name, email address, phone number, and BATELEC I account number, will remain stored in Our system even after You deactivate or delete Your EcoTrack account.</p>
          <p className="mb-2">5.2 This data retention is necessary for record-keeping, compliance, and system integrity purposes.</p>
          <p className="mb-4">5.3 If You have concerns about data retention, You may contact BATELEC I for further assistance.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-6 mb-3 text-blue-600">VI. USER RIGHTS</h2>
          <p className="mb-2">6.1 You may request to deactivate Your EcoTrack account at any time through contacting the provided BATELEC I contact details.</p>
          <p className="mb-4">6.2 Account deactivation does not result in the immediate deletion of Your personal data, as outlined in Section V of this Privacy Policy.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-6 mb-3 text-blue-600">VII. UPDATES TO THIS POLICY</h2>
          <p className="mb-2">7.1 We may update this Privacy Policy from time to time without prior notice.</p>
          <p className="mb-4">7.2 Continued use of EcoTrack after updates constitutes Your acceptance of the revised Privacy Policy. You are encouraged to review this policy regularly for any changes.</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
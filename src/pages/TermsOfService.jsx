// import React from 'react';

const TermsOfService = () => {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      
      <div className="space-y-6">
        <p>Welcome to the EcoTrack.</p>
        <p>If You continue to access and use the EcoTrack Mobile App, and subscribe to receive and access information, services, and notifications from EcoTrack, You are expressly agreeing to be bound by all the terms and conditions provided herein (hereinafter referred to as these "Terms of Service") which, together with Our Privacy Policy, govern Our relationship with You in all matters relating to the EcoTrack Mobile App.</p>
        <p>You must be at least 18 years of age and a registered BATELEC I customer to access and use the EcoTrack Mobile App.</p>

        <div>
          <h2 className="text-xl font-semibold mt-6 mb-3 text-blue-600">I. DEFINITION OF TERMS</h2>
          <p className="mb-2">1.1 "Account Holder" refers to the registered user of the EcoTrack Mobile App who is a BATELEC I customer with a valid account number.</p>
          <p className="mb-2">1.2 "Auto-Verified Customer" refers to an existing BATELEC I customer whose account number and registration details match an account in the BATELEC I system, granting immediate access to the EcoTrack Mobile App upon registration.</p>
          <p className="mb-2">1.3 "Pending Request Customer" refers to a newly installed BATELEC I customer who has registered for EcoTrack but is awaiting manual verification by an authorized BATELEC I administrator. Verification may take 1 to 31 days.</p>
          <p className="mb-4">1.4 "Smart Plug" refers to a compatible Tasmota-flashed device used to monitor appliance-level electricity consumption in real-time through the EcoTrack App.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-6 mb-3 text-blue-600">II. GENERAL TERMS AND CONDITIONS</h2>
          <p className="mb-2">2.1 Only BATELEC I customers who are at least 18 years of age and possess a valid account number may register for EcoTrack.</p>
          <p className="mb-2">2.2 Auto-Verified Customers have immediate access to both the monthly consumption feature and smart plug integration. Pending Request Customers will receive access upon successful manual verification by BATELEC I administrators.</p>
          <p className="mb-2">2.3 BATELEC I administrators reserve the right to reject registration requests. Rejections may be classified as:</p>
          <ul className="list-disc list-inside ml-4 mb-2">
            <li>Reject for Review: The applicant may re-register using the same email address.</li>
            <li>Reject for Block: The email address used will be permanently blocked from future registration attempts.</li>
          </ul>
          <p className="mb-2">2.4 We may, from time to time, amend or modify these Terms of Service and the Privacy Policy without prior notice. You are advised to check the latest versions frequently for updates.</p>
          <p className="mb-2">2.5 We may add, change, replace, modify, suspend, or permanently remove any feature of EcoTrack without prior notice.</p>
          <p className="mb-2">2.6 You are responsible for ensuring that you are using the official and most updated version of the EcoTrack Mobile App.</p>
          <p className="mb-4">2.7 All intellectual property rights to the EcoTrack Mobile App, including texts, codes, images, designs, layouts, and graphics, are owned by Us and/or Our licensors. You are prohibited from copying, distributing, or creating derivative works without written consent.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-6 mb-3 text-blue-600">III. USE OF THE SERVICE</h2>
          <p className="mb-2">3.1 You agree to use EcoTrack only for lawful purposes and in accordance with these Terms of Service.</p>
          <p className="mb-2">3.2 You are responsible for maintaining the confidentiality of your account credentials and all activities under your account.</p>
          <p className="mb-2">3.3 Any unauthorized access, tampering, or misuse of EcoTrack's systems and data is strictly prohibited and may result in account termination and legal action.</p>
          <p className="mb-4">3.4 EcoTrack's smart plug integration feature is compatible only with Tasmota-flashed smart plugs. We do not guarantee compatibility with other smart plug brands or models.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-6 mb-3 text-blue-600">IV. SERVICE AVAILABILITY</h2>
          <p className="mb-2">4.1 EcoTrack provides AI-generated energy-saving tips based on:</p>
          <ul className="list-disc list-inside ml-4 mb-2">
            <li>Your overall household consumption data obtained from BATELEC I's billing system.</li>
            <li>Individual appliance consumption data collected from connected Tasmota smart plugs.</li>
          </ul>
          <p className="mb-2">4.2 These AI-generated tips are general recommendations intended to assist You in optimizing energy usage. They do not constitute professional advice and are not guarantees of specific energy savings or cost reductions.</p>
          <p className="mb-4">4.3 You acknowledge that actual energy savings may vary based on individual usage patterns, appliance efficiency, and other factors beyond Our control.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-6 mb-3 text-blue-600">V. DATA COLLECTION AND ANALYTICS</h2>
          <p className="mb-2">5.1 EcoTrack collects anonymized and aggregated usage data from all users for the purpose of:</p>
          <ul className="list-disc list-inside ml-4 mb-2">
            <li>Generating dashboard analytics for BATELEC I administrators, including appliance usage trends and energy consumption patterns.</li>
            <li>Improving the overall functionality and performance of the EcoTrack system.</li>
          </ul>
          <p className="mb-4">5.2 This aggregated data does not personally identify individual users and is used solely for system analytics and service improvement.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-6 mb-3 text-blue-600">VI. SERVICE AVAILABILITY</h2>
          <p className="mb-2">6.1 EcoTrack depends on internet connectivity, device compatibility, BATELEC I systems, and Tasmota smart plug functionality for feature availability.</p>
          <p className="mb-4">6.2 We do not guarantee uninterrupted service and are not liable for downtime caused by system maintenance, outages, or other technical issues.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-6 mb-3 text-blue-600">VII. LIMITATION OF LIABILITY</h2>
          <p className="mb-2">7.1 EcoTrack is provided "as is" without warranties of any kind.</p>
          <p className="mb-2">7.2 We are not liable for indirect damages, loss of savings, or losses caused by the use or inability to use the service.</p>
          <p className="mb-4">7.3 We are not responsible for the performance, accuracy, or reliability of third-party devices, including Tasmota smart plugs.</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mt-6 mb-3 text-blue-600">VIII. TERMINATION</h2>
          <p className="mb-4">8.1 We may suspend or terminate accounts for violations of these Terms of Service. BATELEC I administrators have the authority to deactivate accounts of both Auto-Verified and manually verified customers for violations.</p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;

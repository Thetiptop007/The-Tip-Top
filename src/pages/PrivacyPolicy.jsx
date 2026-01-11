import React, { useEffect, useState } from 'react';
import { getApiUrl } from '../config/api';

function PrivacyPolicy() {
  const [contactInfo, setContactInfo] = useState({
    email: 'naitikkumar2408@gmail.com',
    phone: '+91 9060557296',
    address: 'Shop No 17, Near Tower, Law Gate Rd, Lpu, Phagwara, Punjab 144411'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      const response = await fetch(getApiUrl('api/v1/settings'));
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setContactInfo({
            email: data.data.contactEmail || contactInfo.email,
            phone: data.data.contactPhone || contactInfo.phone,
            address: data.data.address || contactInfo.address
          });
        }
      }
    } catch (error) {
      console.error('Error fetching contact info:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-10 lg:px-20">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 md:p-10">
        <h1 className="text-3xl md:text-4xl font-bold text-red-400 mb-6 sigmar-regular">
          Privacy Policy
        </h1>
        
        <div className="text-sm text-gray-600 mb-8 poppins-regular">
          Last Updated: January 12, 2026
        </div>

        <div className="space-y-6 poppins-regular text-gray-700">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3 poppins-semibold">
              1. Introduction
            </h2>
            <p className="leading-relaxed">
              Welcome to TipTop Restaurant ("we," "our," or "us"). We are committed to protecting your 
              personal information and your right to privacy. This Privacy Policy explains how we collect, 
              use, disclose, and safeguard your information when you use our website and mobile application.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3 poppins-semibold">
              2. Information We Collect
            </h2>
            <div className="space-y-3">
              <div>
                <h3 className="text-xl font-medium text-gray-800 mb-2 poppins-medium">
                  2.1 Personal Information
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Name and contact details (email, phone number)</li>
                  <li>Delivery addresses</li>
                  <li>Payment information (processed securely through third-party providers)</li>
                  <li>Order history and preferences</li>
                  <li>Account credentials</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-xl font-medium text-gray-800 mb-2 poppins-medium">
                  2.2 Automatically Collected Information
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Device information (IP address, browser type, operating system)</li>
                  <li>Usage data (pages visited, time spent, clicks)</li>
                  <li>Location data (with your permission)</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3 poppins-semibold">
              3. How We Use Your Information
            </h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Process and fulfill your orders</li>
              <li>Communicate with you about your orders and account</li>
              <li>Send promotional offers and updates (with your consent)</li>
              <li>Improve our services and user experience</li>
              <li>Detect and prevent fraud or security issues</li>
              <li>Comply with legal obligations</li>
              <li>Analyze usage patterns and trends</li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3 poppins-semibold">
              4. Information Sharing and Disclosure
            </h2>
            <p className="leading-relaxed mb-3">
              We may share your information with:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Delivery Partners:</strong> To fulfill your orders</li>
              <li><strong>Payment Processors:</strong> To process transactions securely</li>
              <li><strong>Service Providers:</strong> Who assist in operating our business</li>
              <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
            </ul>
            <p className="leading-relaxed mt-3">
              We do not sell your personal information to third parties for marketing purposes.
            </p>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3 poppins-semibold">
              5. Data Security
            </h2>
            <p className="leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal 
              information against unauthorized access, alteration, disclosure, or destruction. These include:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
              <li>Encryption of sensitive data (SSL/TLS)</li>
              <li>Secure server infrastructure</li>
              <li>Regular security audits</li>
              <li>Access controls and authentication</li>
              <li>Employee training on data protection</li>
            </ul>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3 poppins-semibold">
              6. Your Privacy Rights
            </h2>
            <p className="leading-relaxed mb-3">
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Data Portability:</strong> Receive your data in a structured format</li>
              <li><strong>Withdraw Consent:</strong> Revoke previously given consent</li>
            </ul>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3 poppins-semibold">
              7. Cookies and Tracking Technologies
            </h2>
            <p className="leading-relaxed">
              We use cookies and similar tracking technologies to enhance your experience. Cookies are 
              small data files stored on your device. You can control cookie preferences through your 
              browser settings. Types of cookies we use:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
              <li><strong>Essential Cookies:</strong> Required for website functionality</li>
              <li><strong>Performance Cookies:</strong> Help us understand how you use our site</li>
              <li><strong>Functional Cookies:</strong> Remember your preferences</li>
              <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
            </ul>
          </section>

          {/* Third-Party Links */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3 poppins-semibold">
              8. Third-Party Links
            </h2>
            <p className="leading-relaxed">
              Our website may contain links to third-party websites. We are not responsible for the 
              privacy practices or content of these external sites. We encourage you to review their 
              privacy policies before providing any personal information.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3 poppins-semibold">
              9. Children's Privacy
            </h2>
            <p className="leading-relaxed">
              Our services are not intended for children under the age of 13. We do not knowingly 
              collect personal information from children. If you believe we have collected information 
              from a child, please contact us immediately, and we will take steps to delete such information.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3 poppins-semibold">
              10. Data Retention
            </h2>
            <p className="leading-relaxed">
              We retain your personal information only for as long as necessary to fulfill the purposes 
              outlined in this Privacy Policy, unless a longer retention period is required by law. When 
              your data is no longer needed, we will securely delete or anonymize it.
            </p>
          </section>

          {/* International Transfers */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3 poppins-semibold">
              11. International Data Transfers
            </h2>
            <p className="leading-relaxed">
              Your information may be transferred to and processed in countries other than your country 
              of residence. We ensure appropriate safeguards are in place to protect your data in 
              accordance with this Privacy Policy and applicable laws.
            </p>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3 poppins-semibold">
              12. Changes to This Privacy Policy
            </h2>
            <p className="leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our practices 
              or legal requirements. We will notify you of any material changes by posting the updated 
              policy on our website with a new "Last Updated" date. Your continued use of our services 
              after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3 poppins-semibold">
              13. Contact Us
            </h2>
            <p className="leading-relaxed mb-4">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our 
              data practices, please contact us:
            </p>
            {loading ? (
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-gray-600">Loading contact information...</p>
              </div>
            ) : (
              <div className="bg-gray-100 p-4 rounded-lg space-y-2">
                <p><strong>Email:</strong> {contactInfo.email}</p>
                <p><strong>Phone:</strong> {contactInfo.phone}</p>
                <p><strong>Address:</strong> {contactInfo.address}</p>
              </div>
            )}
          </section>

          {/* User Consent */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3 poppins-semibold">
              14. Consent
            </h2>
            <p className="leading-relaxed">
              By using our website and services, you consent to the collection and use of your information 
              as described in this Privacy Policy. If you do not agree with this policy, please do not 
              use our services.
            </p>
          </section>
        </div>

        {/* Back to Home Button */}
        <div className="mt-10 flex justify-center">
          <a
            href="/"
            className="bg-red-400 text-white px-8 py-3 rounded-lg hover:bg-red-500 transition-all duration-300 poppins-medium"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;

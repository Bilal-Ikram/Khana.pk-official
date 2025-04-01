import React from 'react';
import Footer from '../Footer/Footer'


const PrivacyPolicy = () => {
  return (
    <>
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <div className="prose prose-pink">
        <p className="mb-4">
          Last updated: February 14, 2025
        </p>
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-3">1. Information We Collect</h2>
          <p className="text-gray-600">
            We collect information you provide directly to us when you create an account,
            make a purchase, or contact us for support.
          </p>
        </section>
        {/* Add more sections as needed */}
      </div>
    </div>
    <Footer />
    </>
  );
};

export default PrivacyPolicy;
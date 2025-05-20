// import phoneImage from '../../assets/mobile_app_mockup_1.png'; // Update path if necessary

import React from 'react';
import HomePageNavBar from '../../components/HomePageNavBar';
import Footer from '../../components/Footer';
import phoneImage from '../../assets/mobile_app_mockup_1.png'; // Update path if necessary
const DownloadApp = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <HomePageNavBar />

      {/* Hero */}
      <section className="flex-1 bg-[#009B3A] text-white flex items-center">
        <div className="w-full max-w-6xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-12 px-6 py-16 sm:py-20">
          {/* Text */}
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-6">
              Download The <br /> Ecotrack Home App
            </h1>

            <p className="text-lg leading-relaxed mb-8 max-w-md mx-auto lg:mx-0">
              Download the Ecotrack Home app if you have Tasmota-flashed smart
              plugs, or if you recently purchased one.
            </p>

            <a
              href="#"
              className="inline-flex items-center justify-center bg-[#001A33] hover:bg-[#00264d] transition text-white font-semibold py-3 px-7 rounded-full shadow-lg"
            >
              <svg
                className="w-5 h-5 mr-2 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3.25-3.25a1 1 0 011.414-1.414l2.543 2.543 6.543-6.543a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Download Android App
            </a>
          </div>

          {/* Phone Mock-up */}
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
            <div className="rounded-full overflow-hidden w-72 sm:w-80 md:w-96 shadow-2xl">
              <img
                src={phoneImage}
                alt="Ecotrack app preview"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default DownloadApp;
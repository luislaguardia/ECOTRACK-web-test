import React from 'react';
import { MdAndroid } from 'react-icons/md';
import HomePageNavBar from '../../components/HomePageNavBar';
import Footer from '../../components/Footer';
import phoneImage from '../../assets/mobile_app_mockup_1.jpg'; // Or replace with Get Ecotrack.jpeg if preferred

const DownloadApp = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <HomePageNavBar />

      {/* Hero Section */}
      <section className="flex-1 bg-[#009B3A] text-white flex items-center">
        <div className="w-full max-w-6xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-12 px-6 py-16 sm:py-20">
          
          {/* Left Text */}
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-6">
              Download The <br /> Ecotrack Home App
            </h1>
            <p className="text-lg leading-relaxed mb-8 max-w-md mx-auto lg:mx-0">
              Download the Ecotrack Home app if you have Tasmota-flashed smart plugs,
              or if you recently purchased one.
            </p>

            <a
              href=" https://www.facebook.com/Batangas1ElectricCooperativeInc" // LINK TO OUR ANDROID APP
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-[#001A33] hover:bg-[#00264d] transition text-white font-semibold py-3 px-7 rounded-full shadow-lg"
            >
              <MdAndroid size={22} className="mr-2" />
              Download Android App
            </a>
          </div>

          {/* Right Image */}
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
  <div className="w-72 sm:w-80 md:w-96 overflow-hidden rounded-none lg:rounded-r-lg">
    <img
      src={phoneImage}
      alt="Ecotrack app preview"
      style={{ marginTop: '1rem' }} // You can adjust the value to `-5rem` or more if needed
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
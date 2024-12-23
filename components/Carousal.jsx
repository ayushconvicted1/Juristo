"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css"; 
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";

const Carousel = () => { 
  return (
    <div className="relative w-full max-w-5xl mx-auto">
      <Swiper
        navigation={true}
        modules={[Navigation]}
        className="mySwiper"
        spaceBetween={30}
        slidesPerView={3}
        breakpoints={{
          640: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
      >
        {/* Slide 1 */}
        <SwiperSlide>
          <div className="bg-white shadow-md rounded-md overflow-hidden">
            <div className="relative">
              <img
                src="https://via.placeholder.com/400x300"
                alt="Slide 1"
                className="w-full h-48 object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold">Document Drafting</h3>
              <p className="text-gray-600 text-sm mt-2">
                Draft precise contracts, agreements, and other legal documents
                effortlessly. Ensure compliance and detect inconsistencies with
                automated document.
              </p>
            </div>
          </div>
        </SwiperSlide>

        {/* Slide 2 */}
        <SwiperSlide>
          <div className="bg-white shadow-md rounded-md overflow-hidden">
            <div className="relative">
              <img
                src="https://via.placeholder.com/400x300"
                alt="Slide 2"
                className="w-full h-48 object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold">Drafting Automated Docs</h3>
              <p className="text-gray-600 text-sm mt-2">
                Draft precise contracts, agreements, and other legal documents
                effortlessly. Ensure compliance and detect inconsistencies with
                automated document.
              </p>
              <button className="mt-4 bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
                Get Started
              </button>
            </div>
          </div>
        </SwiperSlide>

        {/* Slide 3 */}
        <SwiperSlide>
          <div className="bg-white shadow-md rounded-md overflow-hidden">
            <div className="relative">
              <img
                src="https://via.placeholder.com/400x300"
                alt="Slide 3"
                className="w-full h-48 object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold">Another Feature</h3>
              <p className="text-gray-600 text-sm mt-2">
                Explore this feature to streamline your processes and save time.
              </p>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
};

export default Carousel;

import { Link } from "react-router-dom";
import footerArt from "../../assets/Gemini_Generated_Image_314b71314b71314b.png";

export default function Footer() {
  return (
    <footer
      // min-h-[500px] for mobile, min-h-[700px] for tablet/desktop
      // bg-cover ensures edge-to-edge rendering without side borders
      // flex flex-col justify-end pushes the content to the bottom
      className="relative mt-20 w-full min-h-[600px] md:min-h-[700px] overflow-hidden bg-[#FEF5F1] bg-cover bg-bottom bg-no-repeat flex flex-col justify-end pb-6 sm:pb-8 lg:pb-10"
      style={{ backgroundImage: `url(${footerArt})` }}
    >
      {/* Optional: A subtle gradient at the bottom to ensure the text is always readable over the artwork */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-white/60 to-transparent z-0 pointer-events-none" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* The 3-4 lines of text added above the copyright bar */}
        {/* <div className="mb-6 md:mb-8 text-center md:text-left bg-white/40 p-4 rounded-xl backdrop-blur-sm inline-block shadow-sm ring-1 ring-white/50">
          <h2 className="font-serif text-xl md:text-2xl text-stone-900 mb-2">
            Rooted in Jaipur's Heritage
          </h2>
          <p className="max-w-xl text-xs md:text-sm leading-relaxed text-stone-800 font-medium">
            Bringing the timeless art of hand-block printing, intricate embroideries, 
            and vibrant hues of Rajasthan directly to your everyday wardrobe. 
            Every piece tells a story of tradition, crafted by master artisans.
          </p>
        </div> */}

        {/* Copyright Bar - responsive and properly aligned */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl bg-white/70 px-6 py-4 text-xs font-bold text-stone-800 shadow-sm ring-1 ring-white/80 backdrop-blur-md">
          <span className="text-center sm:text-left">
            © {new Date().getFullYear()} Bhavya Ethnic. All rights reserved.
          </span>
          <span className="flex items-center gap-1.5 text-center sm:text-right">
            Crafted with care in Jaipur
            {/* Optional heart icon just to add a nice touch */}
            <span className="material-symbols-outlined text-[#a86558] text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
          </span>
        </div>
        
      </div>
    </footer>
  );
}
import React, { useState } from "react";
import { IoSparkles, IoClose } from "react-icons/io5";
import { FaFilm } from "react-icons/fa";
import { BsDice5 } from "react-icons/bs";
import AiCineBotModal from "./AiCineBotModal";

const AiMovieMascot: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [showBubble, setShowBubble] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const openWithPrompt = (promptText: string) => {
    setSelectedPrompt(promptText);
    setShowModal(true);
    setShowBubble(false);
  };

  return (
    <>
      <aside
        aria-label="CineLens AI Assistant"
        className="fixed bottom-6 right-6 z-40 flex flex-col items-end select-none pointer-events-auto"
      >
        {/* Contextual Director's Cut Dialogue Bubble */}
        {(showBubble || isHovered) && (
          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="mb-3 mr-1 w-[280px] sm:w-[300px] bg-[#0c051a]/95 backdrop-blur-2xl border-2 border-[#b300ff]/40 rounded-3xl p-4 shadow-[0_15px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(179,0,255,0.3)] animate-fadeIn transition-all relative text-white"
          >
            {/* Ambient Marquee Glow */}
            <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#b300ff]/20 rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-white/[0.08] relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span className="font-black text-xs tracking-wider uppercase text-white flex items-center gap-1.5">
                  <span>CineLens</span>
                  <span className="text-[9px] font-black text-amber-300 bg-amber-400/20 px-1.5 py-0.5 rounded-full border border-amber-400/40">
                    AUTEUR AI
                  </span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowBubble(false);
                  setIsHovered(false);
                }}
                title="Dismiss"
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <IoClose size={15} />
              </button>
            </div>

            {/* Bubble Body */}
            <div className="space-y-2 relative z-10">
              <p className="text-xs text-white font-extrabold leading-snug">
                Tonight&apos;s Cinematic Curation 🎬
              </p>
              <p className="text-[11px] text-gray-300">
                Choose a director auteur style or explore curated moods:
              </p>

              {/* Auteur Quick Selectors */}
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => openWithPrompt("Nolan Mind-Bending")}
                  className="p-2 rounded-xl bg-white/[0.04] hover:bg-[#b300ff]/25 border border-white/10 hover:border-amber-400/40 text-[11px] text-white font-bold transition-all text-left flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                >
                  <span>🌀</span>
                  <span className="truncate">Nolan Timelines</span>
                </button>

                <button
                  type="button"
                  onClick={() => openWithPrompt("Villeneuve Sci-Fi")}
                  className="p-2 rounded-xl bg-white/[0.04] hover:bg-[#b300ff]/25 border border-white/10 hover:border-amber-400/40 text-[11px] text-white font-bold transition-all text-left flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                >
                  <span>🌌</span>
                  <span className="truncate">Villeneuve Sci-Fi</span>
                </button>

                <button
                  type="button"
                  onClick={() => openWithPrompt("Tarantino Grit")}
                  className="p-2 rounded-xl bg-white/[0.04] hover:bg-[#b300ff]/25 border border-white/10 hover:border-amber-400/40 text-[11px] text-white font-bold transition-all text-left flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                >
                  <span>🚬</span>
                  <span className="truncate">Tarantino Grit</span>
                </button>

                <button
                  type="button"
                  onClick={() => openWithPrompt("Ghibli Warmth")}
                  className="p-2 rounded-xl bg-white/[0.04] hover:bg-[#b300ff]/25 border border-white/10 hover:border-amber-400/40 text-[11px] text-white font-bold transition-all text-left flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                >
                  <span>🌸</span>
                  <span className="truncate">Ghibli Warmth</span>
                </button>
              </div>

              {/* Custom Studio Prompt Footer Link */}
              <button
                type="button"
                onClick={() => openWithPrompt("")}
                className="w-full mt-2 pt-2 border-t border-white/[0.08] text-[11px] text-amber-300 hover:text-white font-extrabold flex items-center justify-between transition-colors cursor-pointer"
              >
                <span>Open Full Director&apos;s Studio</span>
                <span>➔</span>
              </button>
            </div>

            {/* Pointer Notch */}
            <div className="absolute -bottom-2 right-7 w-3.5 h-3.5 bg-[#0c051a] border-r-2 border-b-2 border-[#b300ff]/40 transform rotate-45" />
          </div>
        )}

        {/* Mascot / Floating Action Trigger Button */}
        <div className="relative flex flex-col items-center">
          {/* Subtle Ambient Sparkle */}
          <div className="absolute -top-3 right-0 pointer-events-none text-amber-300 text-xs animate-bounce">
            <IoSparkles />
          </div>

          <button
            type="button"
            onClick={() => openWithPrompt("")}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            title="Open CineLens Studio"
            className="group relative cursor-pointer outline-none transition-all duration-300 transform hover:scale-110 active:scale-95 flex flex-col items-center"
          >
            {/* Neon Glow Aura */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#3b0764] via-[#b300ff] to-amber-500 opacity-80 blur-lg group-hover:opacity-100 group-hover:blur-xl transition-all" />

            {/* Ground Shadow */}
            <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-14 h-3 bg-black/80 rounded-full blur-[4px]" />

            {/* High-End Cinema Aperture Badge */}
            <div className="relative w-15 h-15 sm:w-16 sm:h-16 rounded-full p-[2.5px] bg-gradient-to-tr from-[#581c87] via-[#b300ff] to-amber-400 shadow-2xl flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#0a0316] flex items-center justify-center relative overflow-hidden border border-white/10">
                {/* Cinema Film Reel / Camera Aperture Vector */}
                <svg
                  viewBox="0 0 48 48"
                  className="w-9 h-9 relative z-10 filter drop-shadow-[0_2px_10px_rgba(245,158,11,0.6)]"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Outer Film Reel Ring */}
                  <circle cx="24" cy="24" r="20" stroke="url(#reelGrad)" strokeWidth="2.5" />
                  {/* Inner Hub */}
                  <circle cx="24" cy="24" r="8" fill="#1e0b36" stroke="#f59e0b" strokeWidth="2" />
                  {/* Center Spindle */}
                  <circle cx="24" cy="24" r="3.5" fill="#f59e0b" />

                  {/* 4 Cinema Aperture Spoke Holes */}
                  <circle cx="24" cy="10" r="3" fill="#0a0316" stroke="#d975ff" strokeWidth="1.5" />
                  <circle cx="24" cy="38" r="3" fill="#0a0316" stroke="#d975ff" strokeWidth="1.5" />
                  <circle cx="10" cy="24" r="3" fill="#0a0316" stroke="#d975ff" strokeWidth="1.5" />
                  <circle cx="38" cy="24" r="3" fill="#0a0316" stroke="#d975ff" strokeWidth="1.5" />

                  {/* Shimmer Gradients */}
                  <defs>
                    <linearGradient id="reelGrad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#f59e0b" />
                      <stop offset="0.5" stopColor="#b300ff" />
                      <stop offset="1" stopColor="#fbbf24" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Shimmer Lens Accent */}
                <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-gradient-to-tr from-amber-400 to-[#b300ff] rounded-full flex items-center justify-center shadow-lg border border-white/20">
                  <IoSparkles className="text-black text-[8px]" />
                </div>
              </div>
            </div>

            {/* Bottom Floating Pill Tag */}
            <div className="relative -mt-2 px-3 py-0.5 rounded-full bg-black/90 border border-amber-400/50 text-[9px] font-black text-amber-300 shadow-xl flex items-center gap-1.5 whitespace-nowrap group-hover:border-amber-300 group-hover:text-white transition-all">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              <span>CINELENS AI</span>
            </div>
          </button>
        </div>
      </aside>

      {/* AI CineLens Studio Modal */}
      <AiCineBotModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        initialPrompt={selectedPrompt}
      />
    </>
  );
};

export default AiMovieMascot;

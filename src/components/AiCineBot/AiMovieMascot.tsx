import React, { useState } from "react";
import { IoSparkles, IoClose } from "react-icons/io5";
import { MdLocalMovies } from "react-icons/md";
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
        aria-label="CineBot AI Assistant"
        className="fixed bottom-6 right-6 z-40 flex flex-col items-end select-none pointer-events-auto"
      >
        {/* Contextual Dialogue Bubble */}
        {(showBubble || isHovered) && (
          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="mb-2 mr-1 w-[265px] sm:w-[285px] bg-[#140b22]/95 backdrop-blur-xl border border-purple-500/35 rounded-2xl p-3 shadow-[0_12px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(179,0,255,0.3)] animate-fadeIn transition-all relative text-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-white/[0.08]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-extrabold text-xs text-white tracking-wide">
                  CineBot 🍿 <span className="text-[10px] font-bold text-[#d975ff] bg-[#B300FF]/20 px-1.5 py-0.5 rounded-full border border-[#B300FF]/40">AI GURU</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowBubble(false);
                  setIsHovered(false);
                }}
                title="Close"
                className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
              >
                <IoClose size={14} />
              </button>
            </div>

            {/* Bubble Content */}
            <div className="space-y-1.5">
              <p className="text-xs text-gray-100 font-bold">
                Looking for a movie tonight? 🎬
              </p>
              <p className="text-[11px] text-purple-200/80">
                Tap a mood for an instant curated watchlist:
              </p>
              <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => openWithPrompt("🧠 Mind-Bending Sci-Fi")}
                  className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-[#B300FF]/30 border border-white/10 hover:border-[#B300FF]/50 text-[11px] text-white font-medium transition-all text-left flex items-center gap-1 cursor-pointer"
                >
                  <span>🧠</span> Sci-Fi Mind
                </button>
                <button
                  type="button"
                  onClick={() => openWithPrompt("🍿 Weekend Binge Series")}
                  className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-[#B300FF]/30 border border-white/10 hover:border-[#B300FF]/50 text-[11px] text-white font-medium transition-all text-left flex items-center gap-1 cursor-pointer"
                >
                  <span>🍿</span> Binge Series
                </button>
                <button
                  type="button"
                  onClick={() => openWithPrompt("⚡ High-Octane Action")}
                  className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-[#B300FF]/30 border border-white/10 hover:border-[#B300FF]/50 text-[11px] text-white font-medium transition-all text-left flex items-center gap-1 cursor-pointer"
                >
                  <span>⚡</span> Adrenaline
                </button>
                <button
                  type="button"
                  onClick={() => openWithPrompt("❤️ Heartwarming Comfort")}
                  className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-[#B300FF]/30 border border-white/10 hover:border-[#B300FF]/50 text-[11px] text-white font-medium transition-all text-left flex items-center gap-1 cursor-pointer"
                >
                  <span>💖</span> Comfort
                </button>
              </div>
            </div>

            {/* Custom AI Prompt footer link */}
            <button
              type="button"
              onClick={() => openWithPrompt("")}
              className="w-full mt-2 pt-1.5 border-t border-white/[0.08] text-[11px] text-[#d975ff] hover:text-white font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <span>Ask custom vibe...</span>
              <span>→</span>
            </button>

            {/* Pointer Notch */}
            <div className="absolute -bottom-2 right-8 w-3.5 h-3.5 bg-[#140b22] border-r border-b border-purple-500/35 transform rotate-45" />
          </div>
        )}

        {/* Mascot Avatar Widget */}
        <div className="relative flex flex-col items-center">
          {/* Floating Movie Clapper / Sparkles */}
          <div className="absolute -top-4 right-0 pointer-events-none text-yellow-300 text-xs animate-bounce">
            <IoSparkles />
          </div>

          {/* Interactive Mascot Button */}
          <button
            type="button"
            onClick={() => openWithPrompt("")}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            title="Open AI CineBot"
            className="group relative cursor-pointer outline-none transition-all duration-300 transform hover:scale-110 active:scale-95 flex flex-col items-center"
          >
            {/* Ambient Neon Purple Glow */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#451488] via-[#B300FF] to-pink-500 opacity-75 blur-md group-hover:opacity-100 group-hover:blur-lg transition-all" />

            {/* Ground Shadow */}
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-14 h-3 bg-black/60 rounded-full blur-[3px]" />

            {/* Popcorn Cinema Bot Avatar Badge */}
            <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full p-[2.5px] bg-gradient-to-tr from-[#451488] via-[#B300FF] to-pink-500 shadow-2xl flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#110820] flex items-center justify-center relative overflow-hidden">
                {/* Cinema Character Vector (Cute Popcorn Bot with 3D Cinema Glasses) */}
                <svg
                  viewBox="0 0 64 64"
                  className="w-11 h-11 sm:w-12 sm:h-12 relative z-10 filter drop-shadow-[0_2px_8px_rgba(179,0,255,0.7)]"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Popcorn Tub Body */}
                  <polygon
                    points="17,32 47,32 43,54 21,54"
                    fill="#e11d48"
                    stroke="#be123c"
                    strokeWidth="1.5"
                  />
                  {/* White Stripes on Tub */}
                  <polygon points="23,32 27,32 26,54 23,54" fill="#ffffff" />
                  <polygon points="32,32 36,32 34,54 31,54" fill="#ffffff" />
                  <polygon points="41,32 45,32 42,54 39,54" fill="#ffffff" />

                  {/* Golden Fluffy Popcorn Kernels on Top */}
                  <circle cx="21" cy="27" r="5" fill="#fef08a" stroke="#facc15" strokeWidth="1" />
                  <circle cx="28" cy="24" r="5.5" fill="#fde047" stroke="#eab308" strokeWidth="1" />
                  <circle cx="36" cy="24" r="5.5" fill="#fef08a" stroke="#facc15" strokeWidth="1" />
                  <circle cx="43" cy="27" r="5" fill="#fde047" stroke="#eab308" strokeWidth="1" />
                  <circle cx="32" cy="20" r="5" fill="#ffffff" stroke="#facc15" strokeWidth="1" />

                  {/* 3D Cinema Glasses Frame */}
                  <rect
                    x="19"
                    y="36"
                    width="26"
                    height="9"
                    rx="3"
                    fill="#18181b"
                    stroke="#ffffff"
                    strokeWidth="1.2"
                  />
                  {/* Left Cyan 3D Lens */}
                  <rect x="21" y="38" width="10" height="5" rx="1.5" fill="#06b6d4" />
                  {/* Right Red 3D Lens */}
                  <rect x="33" y="38" width="10" height="5" rx="1.5" fill="#ef4444" />

                  {/* Cheerful Smile */}
                  <path
                    d="M28 48 Q32 51 36 48"
                    stroke="#ffffff"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>

                {/* Sparkle Badge */}
                <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-gradient-to-tr from-[#B300FF] to-pink-500 rounded-full flex items-center justify-center shadow-lg border border-white/20">
                  <IoSparkles className="text-white text-[8px]" />
                </div>
              </div>
            </div>

            {/* Mascot Pill Tag */}
            <div className="relative -mt-1.5 px-2.5 py-0.5 rounded-full bg-black/90 border border-purple-500/50 text-[9px] font-black text-[#d975ff] shadow-xl flex items-center gap-1 whitespace-nowrap group-hover:border-purple-400 group-hover:text-white transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>CINEBOT AI</span>
            </div>
          </button>
        </div>
      </aside>

      {/* AI CineBot Modal */}
      <AiCineBotModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        initialPrompt={selectedPrompt}
      />
    </>
  );
};

export default AiMovieMascot;

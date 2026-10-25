import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoClose, IoSparkles } from "react-icons/io5";
import { BsFillPlayFill, BsStarFill, BsDice5 } from "react-icons/bs";
import { FaKey } from "react-icons/fa";
import {
  getAiMovieRecommendations,
  AiMovieRecommendation,
} from "../../services/aiMovieService";
import { originalImage } from "../../services/apiConfigs";
import tmdbApi from "../../services/tmdbApi";
import { useVideoModal } from "../../context/VideoModal/VideoModal.context";

const QUICK_CHIPS = [
  "🧠 Mind-Bending Sci-Fi",
  "🍿 Weekend Binge Series",
  "⚡ High-Octane Action",
  "❤️ Heartwarming Comfort",
  "👻 Psychological Horror",
  "🕵️ Plot Twist Mystery",
  "😂 Late Night Comedy",
  "🚀 Space Odyssey",
];

interface AiCineBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
  contextMovie?: any;
}

const AiCineBotModal: React.FC<AiCineBotModalProps> = ({
  isOpen,
  onClose,
  initialPrompt = "",
  contextMovie,
}) => {
  const navigate = useNavigate();
  const videoModal = useVideoModal();

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [commentary, setCommentary] = useState("");
  const [movies, setMovies] = useState<AiMovieRecommendation[]>([]);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [apiKey, setApiKey] = useState("");

  // Restore saved key
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem("moviebuddy_gemini_key");
      if (savedKey) setApiKey(savedKey);
    } catch {}
  }, []);

  const handleSaveKey = (val: string) => {
    setApiKey(val);
    try {
      if (val.trim()) {
        localStorage.setItem("moviebuddy_gemini_key", val.trim());
      } else {
        localStorage.removeItem("moviebuddy_gemini_key");
      }
    } catch {}
  };

  const handleCurate = async (targetPrompt?: string) => {
    const activeQuery = targetPrompt || prompt;
    if (!activeQuery.trim() && !contextMovie) return;

    setLoading(true);
    try {
      const res = await getAiMovieRecommendations(
        activeQuery,
        contextMovie
          ? {
              title: contextMovie.title || contextMovie.name,
              mediaType: contextMovie.media_type || "movie",
            }
          : undefined,
        apiKey
      );

      setCommentary(res.commentary);
      setMovies(res.movies);
    } catch (e) {
      console.error("CineBot generation error:", e);
    } finally {
      setLoading(false);
    }
  };

  // Run on open if initialPrompt or contextMovie is provided
  useEffect(() => {
    if (isOpen) {
      if (initialPrompt) {
        setPrompt(initialPrompt);
        handleCurate(initialPrompt);
      } else if (contextMovie && movies.length === 0) {
        const query = `Deep vibe match for ${contextMovie.title || contextMovie.name}`;
        setPrompt(query);
        handleCurate(query);
      } else if (movies.length === 0) {
        // default initial curate
        handleCurate("Mind-bending sci-fi thrillers");
      }
    }
  }, [isOpen, initialPrompt, contextMovie]);

  const handlePlayTrailer = async (movie: AiMovieRecommendation) => {
    if (!movie.id) return;
    try {
      const type = movie.mediaType === "tv" ? "tv" : "movie";
      const res = await tmdbApi.getVideo<any>(type, movie.id);
      const videos = res.data?.results || [];
      const trailer =
        videos.find(
          (v: any) => v.type === "Trailer" && v.site === "YouTube"
        ) || videos[0];

      if (trailer?.key && videoModal?.open) {
        videoModal.open(trailer.key);
      }
    } catch (e) {
      console.warn("Could not load trailer for:", movie.title);
    }
  };

  const handleNavigateDetail = (movie: AiMovieRecommendation) => {
    onClose();
    const cleanTitle = (movie.name || movie.title || "detail")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
    const routePrefix = movie.mediaType === "tv" ? "tv-series" : "movies";
    navigate(`/${routePrefix}/${cleanTitle}/${movie.id || 0}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Modal Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl bg-[#0f0a1a] border border-purple-500/30 shadow-[0_20px_60px_rgba(179,0,255,0.25)] overflow-hidden text-white"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/[0.08] bg-[#160e26]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#451488] to-[#B300FF] flex items-center justify-center shadow-lg">
              <IoSparkles className="text-xl text-yellow-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                  CineBot AI
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#B300FF]/20 text-[#d975ff] border border-[#B300FF]/40">
                  Movie Guru
                </span>
              </div>
              <p className="text-xs text-light-gray mt-0.5">
                Curated cinema intelligence powered by Google Gemini 2.5 Flash
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowKeyInput((prev) => !prev)}
              title="API Key Configuration"
              className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-light-gray hover:text-white transition-colors"
            >
              <FaKey size={14} />
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Close Modal"
              className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-light-gray hover:text-white transition-colors"
            >
              <IoClose size={20} />
            </button>
          </div>
        </div>

        {/* Optional Custom API Key Drawer */}
        {showKeyInput && (
          <div className="p-4 bg-[#1b122f] border-b border-purple-500/20 flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full text-xs text-light-gray">
              <p className="font-semibold text-white mb-1">Custom Gemini API Key</p>
              <p className="text-[11px] opacity-80">
                A default key is configured. You can provide your personal Gemini key here anytime.
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => handleSaveKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full sm:w-64 px-3 py-1.5 rounded-xl bg-black/60 border border-white/20 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#B300FF]"
              />
              {apiKey && (
                <button
                  type="button"
                  onClick={() => handleSaveKey("")}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* Search & Prompt Section */}
        <div className="p-4 sm:p-6 bg-gradient-to-b from-[#160e26]/60 to-transparent flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCurate()}
                placeholder="Describe a movie vibe, concept, or 'movies like Arrival & Dune'..."
                className="w-full px-4 py-3 rounded-2xl bg-white/[0.05] border border-white/10 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#B300FF] shadow-inner transition-colors"
              />
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleCurate()}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#451488] to-[#B300FF] hover:brightness-110 font-bold text-sm shadow-[0_4px_20px_rgba(179,0,255,0.4)] transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <IoSparkles className="text-yellow-300" />
              )}
              <span>Curate</span>
            </button>
          </div>

          {/* Quick Mood Chips */}
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-none">
            {QUICK_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPrompt(chip);
                  handleCurate(chip);
                }}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/[0.04] hover:bg-[#B300FF]/20 border border-white/10 hover:border-[#B300FF]/50 text-light-gray hover:text-white transition-all whitespace-nowrap cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6 scrollbar-thin">
          {/* Loading Animation */}
          {loading && (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-full border-3 border-[#B300FF]/30 border-t-[#B300FF] animate-spin flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(179,0,255,0.4)]">
                <IoSparkles className="text-[#B300FF] text-xl animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-white">
                CineBot is analyzing cinematic archives...
              </h3>
              <p className="text-xs text-light-gray mt-1">
                Searching narrative arcs, visual motifs, and TMDB databases
              </p>
            </div>
          )}

          {/* Results Grid */}
          {!loading && movies.length > 0 && (
            <div className="space-y-5">
              {/* Critic Commentary Banner */}
              {commentary && (
                <div className="p-4 rounded-2xl bg-[#451488]/20 border border-[#B300FF]/30 flex items-start gap-3">
                  <span className="text-xl">🎬</span>
                  <p className="text-xs sm:text-sm text-purple-200 leading-relaxed italic font-medium">
                    &ldquo;{commentary}&rdquo;
                  </p>
                </div>
              )}

              {/* Movie Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {movies.map((movie, idx) => (
                  <div
                    key={idx}
                    className="group relative flex flex-col justify-between rounded-2xl bg-[#140b22]/90 hover:bg-[#1a0f2e] border border-white/[0.08] hover:border-[#B300FF]/50 transition-all duration-300 shadow-xl overflow-hidden"
                  >
                    <div>
                      {/* Full-width Movie Poster Container with 2:3 aspect ratio */}
                      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#181126]">
                        <img
                          src={
                            movie.posterPath
                              ? originalImage(movie.posterPath, 500)
                              : "/images/no-image.jpg"
                          }
                          alt={movie.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              "https://www.movienewz.com/img/films/poster-holder.jpg";
                          }}
                        />

                        {/* Subtle bottom shadow vignette */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#140b22] via-transparent to-black/50 pointer-events-none" />

                        {/* Top Badges */}
                        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
                          {/* Rating Pill */}
                          <div className="px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md text-[11px] font-bold text-amber-300 flex items-center gap-1 shadow-md border border-white/10">
                            <BsStarFill size={10} />
                            <span>{movie.voteAverage || "N/A"}</span>
                          </div>

                          {/* Media Type & Year Pill */}
                          <div className="px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider shadow-md border border-white/10 flex items-center gap-1">
                            <span>{movie.mediaType === "tv" ? "TV" : "Movie"}</span>
                            {movie.year && (
                              <span className="text-light-gray font-normal">• {movie.year}</span>
                            )}
                          </div>
                        </div>

                        {/* Hover Quick Trailer Play Button */}
                        {movie.id && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayTrailer(movie);
                            }}
                            className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer"
                            title="Play Trailer"
                          >
                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#451488] to-[#B300FF] flex items-center justify-center text-white shadow-[0_0_25px_rgba(179,0,255,0.7)] transform scale-75 group-hover:scale-100 transition-all duration-300">
                              <BsFillPlayFill size={26} className="translate-x-0.5" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Card Content & Details */}
                      <div className="p-3.5">
                        <h4
                          onClick={() => handleNavigateDetail(movie)}
                          className="text-sm font-bold text-white line-clamp-1 group-hover:text-[#B300FF] transition-colors cursor-pointer"
                          title={movie.title}
                        >
                          {movie.title}
                        </h4>

                        {/* AI Why it matches box */}
                        <div className="mt-2 text-[11px] text-purple-200/90 bg-white/[0.04] p-2.5 rounded-xl border border-white/[0.06] leading-relaxed line-clamp-3">
                          <span className="text-[#d975ff] font-bold text-[9px] uppercase tracking-wider block mb-0.5">
                            ✨ AI Match
                          </span>
                          {movie.reason}
                        </div>

                        {/* Vibe Tags */}
                        {Array.isArray(movie.vibeTags) && movie.vibeTags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {movie.vibeTags.slice(0, 3).map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className="px-1.5 py-0.5 rounded-md bg-[#B300FF]/15 text-[#d975ff] text-[9px] font-semibold border border-[#B300FF]/25"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="p-3.5 pt-0 grid grid-cols-2 gap-2 mt-auto">
                      {movie.id ? (
                        <button
                          type="button"
                          onClick={() => handlePlayTrailer(movie)}
                          className="px-2.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-white flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <BsFillPlayFill size={14} className="text-[#B300FF]" />
                          <span>Trailer</span>
                        </button>
                      ) : (
                        <div />
                      )}

                      <button
                        type="button"
                        onClick={() => handleNavigateDetail(movie)}
                        className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-[#451488] to-[#B300FF] text-xs font-bold text-white flex items-center justify-center gap-1 transition-all hover:brightness-110 shadow-md cursor-pointer ml-auto w-full"
                      >
                        <span>Details</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiCineBotModal;

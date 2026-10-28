import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoClose, IoSparkles } from "react-icons/io5";
import { BsFillPlayFill, BsFillPlayCircleFill } from "react-icons/bs";
import { AiTwotoneStar } from "react-icons/ai";
import { FaKey, FaPlay } from "react-icons/fa";
import {
  getAiMovieRecommendations,
  AiMovieRecommendation,
} from "../../services/aiMovieService";
import { originalImage } from "../../services/apiConfigs";
import tmdbApi from "../../services/tmdbApi";
import { urlMap } from "../../Types/common";

const MOOD_SUGGESTIONS = [
  "🧠 Mind-Bending Sci-Fi",
  "🍿 Weekend Binge Series",
  "⚡ High-Octane Action",
  "❤️ Heartwarming Comfort",
  "👻 Psychological Horror",
  "🕵️ Plot Twist Mystery",
  "😂 Late Night Comedy",
  "🌌 Atmospheric Space Odyssey",
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

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [commentary, setCommentary] = useState("");
  const [movies, setMovies] = useState<AiMovieRecommendation[]>([]);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [apiKey, setApiKey] = useState("");

  // In-Modal Trailer Player State
  const [activeTrailer, setActiveTrailer] = useState<{
    movieTitle: string;
    videoUrl: string | null;
    loading: boolean;
    error: string | null;
  } | null>(null);

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
    const activeQuery = targetPrompt !== undefined ? targetPrompt : prompt;
    if (!activeQuery.trim() && !contextMovie) return;

    setLoading(true);
    setActiveTrailer(null);

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

  // ONLY auto-curate if opened with an explicit initialPrompt or contextMovie (NO auto-searching on default open!)
  useEffect(() => {
    if (isOpen) {
      if (initialPrompt) {
        setPrompt(initialPrompt);
        handleCurate(initialPrompt);
      } else if (contextMovie) {
        const query = `Movies similar to ${contextMovie.title || contextMovie.name}`;
        setPrompt(query);
        handleCurate(query);
      }
      // Note: If opened fresh from navbar, we do NOT auto-search; user enters terms.
    } else {
      // Reset active trailer when closed
      setActiveTrailer(null);
    }
  }, [isOpen, initialPrompt, contextMovie]);

  // Play Trailer Handler
  const handlePlayTrailer = async (movie: AiMovieRecommendation) => {
    setActiveTrailer({
      movieTitle: movie.title,
      videoUrl: null,
      loading: true,
      error: null,
    });

    try {
      let trailerKey: string | null = null;

      if (movie.id) {
        const type = movie.mediaType === "tv" ? "tv" : "movie";
        const res = await tmdbApi.getVideo<any>(type, movie.id);
        const videos = res.data?.results || [];

        // 1. YouTube Trailer
        const trailer = videos.find(
          (v: any) => v.site === "YouTube" && v.type === "Trailer"
        );
        // 2. Any YouTube clip
        const fallback = videos.find((v: any) => v.site === "YouTube");

        trailerKey = (trailer || fallback)?.key || null;
      }

      if (trailerKey) {
        setActiveTrailer({
          movieTitle: movie.title,
          videoUrl: `https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`,
          loading: false,
          error: null,
        });
      } else {
        // Fallback search query on YouTube
        const query = encodeURIComponent(`${movie.title} official trailer`);
        setActiveTrailer({
          movieTitle: movie.title,
          videoUrl: `https://www.youtube.com/embed?listType=search&list=${query}&autoplay=1`,
          loading: false,
          error: null,
        });
      }
    } catch (e) {
      console.warn("Could not load trailer for:", movie.title);
      const query = encodeURIComponent(`${movie.title} official trailer`);
      setActiveTrailer({
        movieTitle: movie.title,
        videoUrl: `https://www.youtube.com/embed?listType=search&list=${query}&autoplay=1`,
        loading: false,
        error: null,
      });
    }
  };

  const handleNavigateDetail = (movie: AiMovieRecommendation) => {
    onClose();
    const cleanTitle = encodeURIComponent(
      (movie.name || movie.title || "detail").toLowerCase()
    ).replace(/%20/g, "-");
    const routePrefix = urlMap[movie.mediaType === "tv" ? "tv" : "movie"];
    navigate(`${routePrefix}/${cleanTitle}/${movie.id || 0}`);
  };

  const handleWatchStream = (movie: AiMovieRecommendation) => {
    onClose();
    const type = movie.mediaType === "tv" ? "tv" : "movie";
    navigate(`/stream/${type}/${movie.id || 0}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn font-poppins">
      {/* Modal Box */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl bg-[#0f0f0f] border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.9)] overflow-hidden text-white"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-black-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-dark-purple/20 border border-dark-purple/40 flex items-center justify-center">
              <IoSparkles className="text-dark-purple text-lg animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-medium text-white tracking-wide">
                  CineBot AI
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-dark-purple/20 text-dark-purple border border-dark-purple/40">
                  Movie Recommender
                </span>
              </div>
              <p className="text-xs text-light-gray mt-0.5">
                Powered by Google Gemini 2.5 & TMDB
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowKeyInput((prev) => !prev)}
              title="Configure Custom API Key"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-light-gray hover:text-white transition-colors cursor-pointer"
            >
              <FaKey size={13} />
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Close"
              className="p-2 rounded-lg bg-white/5 hover:bg-dark-purple text-light-gray hover:text-white transition-colors cursor-pointer"
            >
              <IoClose size={20} />
            </button>
          </div>
        </div>

        {/* API Key Drawer */}
        {showKeyInput && (
          <div className="p-3 bg-black-2 border-b border-white/10 flex flex-col sm:flex-row items-center gap-3 text-xs">
            <div className="flex-1 w-full text-light-gray">
              <span className="text-white font-medium">Custom Gemini Key: </span>
              <span className="opacity-80">
                A shared key is already active. You can provide your personal Gemini API key here.
              </span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => handleSaveKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full sm:w-64 px-3 py-1.5 rounded-lg bg-black border border-white/20 text-xs text-white focus:outline-none focus:border-dark-purple"
              />
              {apiKey && (
                <button
                  type="button"
                  onClick={() => handleSaveKey("")}
                  className="text-xs text-red-400 hover:text-red-300 font-medium"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 bg-black-2 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCurate()}
                placeholder="Search by vibe, plot, genre, or 'movies like Interstellar'..."
                className="w-full px-4 py-2.5 rounded-xl bg-black border border-white/10 text-sm text-white placeholder-light-gray/60 focus:outline-none focus:border-dark-purple transition-colors"
              />
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={() => handleCurate()}
              className="px-5 py-2.5 rounded-xl bg-dark-purple hover:bg-deep-purple font-medium text-xs sm:text-sm text-white transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <IoSparkles />
              )}
              <span>Curate</span>
            </button>
          </div>

          {/* Mood Suggestion Chips */}
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-none">
            {MOOD_SUGGESTIONS.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPrompt(chip);
                  handleCurate(chip);
                }}
                className="px-3 py-1 rounded-full text-xs bg-white/5 hover:bg-dark-purple/30 border border-white/10 hover:border-dark-purple text-light-gray hover:text-white transition-all whitespace-nowrap cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin">
          {/* Active Trailer Player */}
          {activeTrailer && (
            <div className="mb-6 p-4 rounded-xl bg-black-2 border border-dark-purple/40">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-dark-purple animate-ping" />
                  <span className="text-xs font-semibold text-white">
                    Trailer: {activeTrailer.movieTitle}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTrailer(null)}
                  className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-light-gray hover:text-white text-xs transition-colors cursor-pointer"
                >
                  <IoClose size={16} />
                </button>
              </div>

              <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black border border-white/10">
                {activeTrailer.loading ? (
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-light-gray">
                    <span className="w-6 h-6 border-2 border-dark-purple border-t-transparent rounded-full animate-spin mr-2" />
                    Loading trailer...
                  </div>
                ) : activeTrailer.videoUrl ? (
                  <iframe
                    src={activeTrailer.videoUrl}
                    title={`${activeTrailer.movieTitle} Trailer`}
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-light-gray">
                    No video trailer available.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Loading Animation */}
          {loading && (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full border-2 border-dark-purple/30 border-t-dark-purple animate-spin flex items-center justify-center mb-3">
                <IoSparkles className="text-dark-purple text-base animate-pulse" />
              </div>
              <h3 className="text-base font-medium text-white">
                CineBot is searching cinema databases...
              </h3>
              <p className="text-xs text-light-gray mt-1">
                Finding narrative matches and fetching TMDB details
              </p>
            </div>
          )}

          {/* Fresh Empty State (When user opens modal without search yet) */}
          {!loading && movies.length === 0 && (
            <div className="py-16 flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-dark-purple">
                <IoSparkles size={24} />
              </div>
              <h3 className="text-base font-medium text-white mb-1">
                What are you in the mood to watch?
              </h3>
              <p className="text-xs text-light-gray leading-relaxed mb-6">
                Type any vibe, topic, or favorite film above, or pick one of the quick suggestions to explore curated recommendations.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {MOOD_SUGGESTIONS.slice(0, 4).map((mood, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPrompt(mood);
                      handleCurate(mood);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-dark-purple/30 border border-white/10 hover:border-dark-purple text-xs text-light-gray hover:text-white transition-all cursor-pointer"
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results Grid */}
          {!loading && movies.length > 0 && (
            <div className="space-y-4">
              {/* Commentary */}
              {commentary && (
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
                  <span className="text-base text-dark-purple">🎬</span>
                  <p className="text-xs sm:text-sm text-light-gray leading-relaxed italic">
                    &ldquo;{commentary}&rdquo;
                  </p>
                </div>
              )}

              {/* Cards Grid Matching MovieBuddy's Platform Design */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {movies.map((movie, idx) => (
                  <div
                    key={movie.id || idx}
                    className="card group flex flex-col justify-between rounded-xl bg-black-2 border border-white/10 hover:border-dark-purple/50 transition-all duration-300 overflow-hidden"
                  >
                    <div>
                      {/* Movie Poster */}
                      <div
                        onClick={() => handlePlayTrailer(movie)}
                        className="relative aspect-2/3 w-full overflow-hidden bg-black cursor-pointer"
                        title="Click to play trailer"
                      >
                        <img
                          src={
                            movie.posterPath
                              ? originalImage(movie.posterPath, 400)
                              : "/images/no-image.jpg"
                          }
                          alt={movie.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              "https://www.movienewz.com/img/films/poster-holder.jpg";
                          }}
                        />

                        {/* Star Rating Badge */}
                        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[10px] text-amber-400 flex items-center gap-1 border border-white/10">
                          <AiTwotoneStar size={11} />
                          <span>{movie.voteAverage ? movie.voteAverage.toFixed(1) : "N/A"}</span>
                        </div>

                        {/* Media Type Badge */}
                        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[9px] uppercase text-white font-medium border border-white/10">
                          {movie.mediaType === "tv" ? "TV" : "Movie"}
                        </div>

                        {/* Center Hover Play Circle matching Card.tsx */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full text-dark-purple text-[36px] flex scale-50 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 shadow-xl">
                          <BsFillPlayCircleFill />
                        </div>
                      </div>

                      {/* Card Info */}
                      <div className="p-3">
                        <h4
                          onClick={() => handleNavigateDetail(movie)}
                          className="text-xs sm:text-sm font-light text-white truncate hover:text-dark-purple transition-colors cursor-pointer"
                          title={movie.title}
                        >
                          {movie.title}
                        </h4>

                        <div className="flex items-center text-light-gray text-[11px] mt-0.5">
                          <span>{movie.year || "N/A"}</span>
                        </div>

                        {/* AI Reason */}
                        <div className="mt-2 text-[10px] text-light-gray/90 bg-white/5 p-2 rounded-lg leading-relaxed line-clamp-2">
                          <span className="text-dark-purple font-medium mr-1">Why:</span>
                          {movie.reason}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-3 pt-0 grid grid-cols-2 gap-2 mt-auto">
                      <button
                        type="button"
                        onClick={() => handlePlayTrailer(movie)}
                        className="py-1.5 px-2 rounded-lg bg-white/5 hover:bg-dark-purple text-xs text-white flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="Watch Trailer"
                      >
                        <BsFillPlayFill size={13} />
                        <span>Trailer</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleWatchStream(movie)}
                        className="py-1.5 px-2 rounded-lg bg-dark-purple hover:bg-deep-purple text-xs text-white flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="Stream on MovieBuddy"
                      >
                        <FaPlay size={9} />
                        <span>Watch</span>
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

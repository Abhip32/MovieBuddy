import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoClose, IoSparkles, IoBookmark, IoBookmarkOutline } from "react-icons/io5";
import { BsFillPlayFill, BsStarFill, BsDice5 } from "react-icons/bs";
import { FaKey, FaFilm, FaTv, FaPlay, FaInfoCircle } from "react-icons/fa";
import { MdMovie, MdOutlineLiveTv, MdLocalMovies } from "react-icons/md";
import {
  getAiMovieRecommendations,
  getSurpriseMovie,
  AiMovieRecommendation,
} from "../../services/aiMovieService";
import { originalImage } from "../../services/apiConfigs";
import tmdbApi from "../../services/tmdbApi";

// Auteur & Cinematic Director Vibes (Distinct from generic chat prompts)
const AUTEUR_VIBES = [
  { label: "Nolan Mind-Bending", desc: "Non-linear timelines & cerebral spectacle", icon: "🌀" },
  { label: "Villeneuve Sci-Fi", desc: "Colossal atmospheric world-building", icon: "🌌" },
  { label: "Tarantino Grit", desc: "Stylized dialogue & razor-sharp tension", icon: "🚬" },
  { label: "Fincher Dark Noir", desc: "Obsessive investigations & psychological dread", icon: "🕯️" },
  { label: "Ghibli Warmth", desc: "Whimsical nostalgia & magical escapism", icon: "🌸" },
  { label: "Wong Kar-wai Neon", desc: "Poetic longing, rain & urban melancholy", icon: "🍷" },
];

const ERA_FILTERS = ["Any Era", "80s & 90s Cult", "2000s Peak Cinema", "2020s Modern"];

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
  const [selectedEra, setSelectedEra] = useState("Any Era");
  const [loading, setLoading] = useState(false);
  const [commentary, setCommentary] = useState("");
  const [movies, setMovies] = useState<AiMovieRecommendation[]>([]);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [apiKey, setApiKey] = useState("");

  // In-Modal Cinema Screening Theater State
  const [activeTheater, setActiveTheater] = useState<{
    isOpen: boolean;
    movie: AiMovieRecommendation | null;
    videoUrl: string | null;
    loading: boolean;
    error: string | null;
  }>({
    isOpen: false,
    movie: null,
    videoUrl: null,
    loading: false,
    error: null,
  });

  // Watchlist state
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Restore saved key & watchlist
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem("moviebuddy_gemini_key");
      if (savedKey) setApiKey(savedKey);

      const savedList = localStorage.getItem("moviebuddy_watchlist_ids");
      if (savedList) setSavedIds(JSON.parse(savedList));
    } catch {}
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const toggleWatchlist = (e: React.MouseEvent, movie: AiMovieRecommendation) => {
    e.stopPropagation();
    if (!movie.id) return;
    try {
      let updated: number[];
      if (savedIds.includes(movie.id)) {
        updated = savedIds.filter((id) => id !== movie.id);
        showToast(`Removed "${movie.title}" from Watchlist`);
      } else {
        updated = [...savedIds, movie.id];
        showToast(`Saved "${movie.title}" to Watchlist 🍿`);
      }
      setSavedIds(updated);
      localStorage.setItem("moviebuddy_watchlist_ids", JSON.stringify(updated));
    } catch {}
  };

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

  const handleCurate = async (targetPrompt?: string, eraOverride?: string) => {
    const activeQuery = targetPrompt !== undefined ? targetPrompt : prompt;
    if (!activeQuery.trim() && !contextMovie) return;

    setLoading(true);
    setActiveTheater({ isOpen: false, movie: null, videoUrl: null, loading: false, error: null });

    const era = eraOverride || selectedEra;
    const finalPrompt = era !== "Any Era" ? `${activeQuery} (Era: ${era})` : activeQuery;

    try {
      const res = await getAiMovieRecommendations(
        finalPrompt,
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
      console.error("CineMatch generation error:", e);
    } finally {
      setLoading(false);
    }
  };

  // Film Roulette Surprise
  const handleSurpriseMe = async () => {
    setLoading(true);
    try {
      const surprise = await getSurpriseMovie("Thrilling and visually mind-blowing", selectedEra, apiKey);
      if (surprise) {
        setCommentary(`Director's Hidden Gem Pick: "${surprise.title}". Selected especially for pure cinematic brilliance.`);
        setMovies([surprise]);
        // Automatically open theater for surprise pick
        handleOpenTheater(surprise);
      }
    } catch (e) {
      console.error(e);
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
        const query = `Cinematic auteur matches for ${contextMovie.title || contextMovie.name}`;
        setPrompt(query);
        handleCurate(query);
      } else if (movies.length === 0) {
        handleCurate("Nolan Mind-Bending");
      }
    }
  }, [isOpen, initialPrompt, contextMovie]);

  // Open the Instant Cinema Screening Room
  const handleOpenTheater = async (movie: AiMovieRecommendation) => {
    setActiveTheater({
      isOpen: true,
      movie,
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

        // Priority 1: Official Trailer
        const official = videos.find(
          (v: any) => v.site === "YouTube" && v.type === "Trailer"
        );
        // Priority 2: Teaser or any YouTube video
        const fallbackVideo = videos.find((v: any) => v.site === "YouTube");

        trailerKey = (official || fallbackVideo)?.key || null;
      }

      if (trailerKey) {
        setActiveTheater({
          isOpen: true,
          movie,
          videoUrl: `https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`,
          loading: false,
          error: null,
        });
      } else {
        // Fallback to YouTube embed search query
        const query = encodeURIComponent(`${movie.title} official trailer`);
        setActiveTheater({
          isOpen: true,
          movie,
          videoUrl: `https://www.youtube.com/embed?listType=search&list=${query}&autoplay=1`,
          loading: false,
          error: null,
        });
      }
    } catch (err: any) {
      console.warn("Trailer fetch fallback:", err);
      const query = encodeURIComponent(`${movie.title} official trailer`);
      setActiveTheater({
        isOpen: true,
        movie,
        videoUrl: `https://www.youtube.com/embed?listType=search&list=${query}&autoplay=1`,
        loading: false,
        error: null,
      });
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

  const handleWatchStream = (movie: AiMovieRecommendation) => {
    onClose();
    const type = movie.mediaType === "tv" ? "tv" : "movie";
    navigate(`/stream/${type}/${movie.id || 0}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-fadeIn select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-8 z-[100] px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-extrabold text-xs shadow-2xl animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Main Studio Deck */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl max-h-[94vh] flex flex-col rounded-3xl bg-[#090514] border-2 border-[#b300ff]/30 shadow-[0_20px_70px_rgba(179,0,255,0.3)] overflow-hidden text-white"
      >
        {/* Cinema Ambient Projector Rays */}
        <div className="absolute -top-32 -left-32 w-72 h-72 bg-[#b300ff]/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-72 h-72 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Studio Marquee Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/[0.08] bg-[#100722] z-10">
          <div className="flex items-center gap-3">
            {/* Holographic Cinema Lens Icon */}
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#3b0764] via-[#7e22ce] to-[#f59e0b] p-0.5 shadow-[0_0_20px_rgba(179,0,255,0.5)]">
              <div className="w-full h-full rounded-[14px] bg-[#0d041e] flex items-center justify-center relative overflow-hidden">
                <FaFilm className="text-amber-400 text-lg animate-pulse" />
                <span className="absolute -bottom-1 text-[8px] font-black text-[#d975ff] tracking-widest">
                  35MM
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight bg-gradient-to-r from-white via-amber-200 to-[#d975ff] bg-clip-text text-transparent">
                  CineLens Studio
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-[#b300ff]/30 to-amber-500/30 text-amber-300 border border-amber-400/40 shadow-sm">
                  Auteur AI
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-2">
                <span>Director-grade cinema matching powered by Gemini 2.5</span>
                <span className="hidden sm:inline text-gray-600">•</span>
                <span className="hidden sm:inline text-amber-400/80 font-mono">2.39:1 CinemaScope</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSurpriseMe}
              title="Surprise Film Roulette"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm"
            >
              <BsDice5 size={14} className="animate-spin-slow" />
              <span className="hidden sm:inline">Surprise Me</span>
            </button>

            <button
              type="button"
              onClick={() => setShowKeyInput((prev) => !prev)}
              title="Gemini Key Config"
              className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <FaKey size={13} />
            </button>

            <button
              type="button"
              onClick={onClose}
              title="Close Studio"
              className="p-2 rounded-xl bg-white/[0.05] hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <IoClose size={20} />
            </button>
          </div>
        </div>

        {/* API Key Drawer */}
        {showKeyInput && (
          <div className="p-3 bg-[#150a2e] border-b border-[#b300ff]/20 flex flex-col sm:flex-row items-center gap-3 z-10 text-xs">
            <div className="flex-1 w-full text-gray-300">
              <span className="font-bold text-white">Custom Gemini API Key: </span>
              <span className="text-[11px] text-gray-400">
                Defaults to project key. You can supply your own personal key.
              </span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => handleSaveKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full sm:w-64 px-3 py-1.5 rounded-xl bg-black/60 border border-white/20 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
              {apiKey && (
                <button
                  type="button"
                  onClick={() => handleSaveKey("")}
                  className="text-xs text-rose-400 hover:text-rose-300 font-bold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* Interactive Cinema Search & Auteur Deck */}
        <div className="p-4 sm:p-5 bg-gradient-to-b from-[#100722] to-transparent border-b border-white/[0.06] flex-shrink-0 z-10 space-y-3">
          {/* Main Prompt Input Bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCurate()}
                placeholder="Name a film vibe, e.g. 'Cyberpunk Noir like Blade Runner 2049' or 'Atmospheric space odyssey'..."
                className="w-full px-4 py-3 rounded-2xl bg-black/50 border border-white/10 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 shadow-inner transition-colors"
              />
            </div>

            {/* Era Selector Dropdown */}
            <select
              value={selectedEra}
              onChange={(e) => {
                setSelectedEra(e.target.value);
                handleCurate(undefined, e.target.value);
              }}
              className="h-11 px-3 rounded-2xl bg-black/50 border border-white/10 text-xs font-bold text-amber-300 focus:outline-none cursor-pointer"
            >
              {ERA_FILTERS.map((era) => (
                <option key={era} value={era} className="bg-[#100722] text-white">
                  {era}
                </option>
              ))}
            </select>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleCurate()}
              className="h-11 px-5 rounded-2xl bg-gradient-to-r from-[#7e22ce] to-[#f59e0b] hover:brightness-110 font-black text-xs sm:text-sm text-black flex items-center gap-2 shadow-[0_4px_20px_rgba(245,158,11,0.3)] transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
              ) : (
                <IoSparkles className="text-black" />
              )}
              <span>Curate</span>
            </button>
          </div>

          {/* Auteur Director Vibe Selector (Distinct Feature!) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 shrink-0 flex items-center gap-1">
              <span>🎬 Auteur Style:</span>
            </span>
            {AUTEUR_VIBES.map((vibe) => (
              <button
                key={vibe.label}
                type="button"
                onClick={() => {
                  setPrompt(vibe.label);
                  handleCurate(vibe.label);
                }}
                className="group px-3 py-1.5 rounded-xl text-xs font-bold bg-white/[0.04] hover:bg-[#b300ff]/20 border border-white/10 hover:border-amber-400/50 text-gray-300 hover:text-white transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
              >
                <span>{vibe.icon}</span>
                <span>{vibe.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin relative">
          {/* THEATER SCREENING ROOM OVERLAY (When a trailer/play is triggered) */}
          {activeTheater.isOpen && activeTheater.movie && (
            <div className="mb-6 rounded-3xl bg-[#080312] border-2 border-amber-400/60 p-4 sm:p-5 shadow-[0_0_50px_rgba(245,158,11,0.25)] animate-fadeIn">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <span className="text-xs font-mono text-rose-400 font-bold uppercase tracking-wider">
                    Theater Screening Room
                  </span>
                  <span className="text-gray-500">•</span>
                  <h3 className="text-sm sm:text-base font-black text-white truncate max-w-md">
                    {activeTheater.movie.title} ({activeTheater.movie.year || "Cinema"})
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setActiveTheater({
                      isOpen: false,
                      movie: null,
                      videoUrl: null,
                      loading: false,
                      error: null,
                    })
                  }
                  className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-gray-200 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                >
                  <IoClose size={16} />
                  <span>Exit Screening</span>
                </button>
              </div>

              {/* YouTube 16:9 Video Player */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/10">
                {activeTheater.loading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-[#0d041e]">
                    <div className="w-10 h-10 border-3 border-amber-400/30 border-t-amber-400 rounded-full animate-spin mb-3" />
                    <p className="text-xs font-bold text-amber-200">
                      Loading cinematic trailer stream...
                    </p>
                  </div>
                ) : activeTheater.videoUrl ? (
                  <iframe
                    src={activeTheater.videoUrl}
                    title={`${activeTheater.movie.title} Trailer`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
                    No stream available.
                  </div>
                )}
              </div>

              {/* Theater Control Deck & Quick Actions */}
              <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-white/10">
                <div className="flex-1 text-xs text-gray-300">
                  <p className="line-clamp-2 italic text-purple-200/90 text-[11px]">
                    &ldquo;{activeTheater.movie.reason}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* Watch Full Film Direct Link */}
                  <button
                    type="button"
                    onClick={() => handleWatchStream(activeTheater.movie!)}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer active:scale-95 transition-all"
                  >
                    <BsFillPlayFill size={16} />
                    <span>Watch Full Movie</span>
                  </button>

                  {/* Details Page Link */}
                  <button
                    type="button"
                    onClick={() => handleNavigateDetail(activeTheater.movie!)}
                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FaInfoCircle size={12} />
                    <span>Details</span>
                  </button>

                  {/* Bookmark Button */}
                  <button
                    type="button"
                    onClick={(e) => toggleWatchlist(e, activeTheater.movie!)}
                    title="Save to Watchlist"
                    className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-amber-400 transition-colors cursor-pointer"
                  >
                    {activeTheater.movie.id && savedIds.includes(activeTheater.movie.id) ? (
                      <IoBookmark size={15} />
                    ) : (
                      <IoBookmarkOutline size={15} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="relative w-16 h-16 rounded-full border-3 border-amber-400/20 border-t-amber-400 animate-spin flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                <FaFilm className="text-amber-400 text-xl animate-pulse" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-white">
                CineLens is analyzing cinematic narrative arcs...
              </h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm">
                Resolving director visual motifs, atmospheric lighting, and high-fidelity TMDB streams
              </p>
            </div>
          )}

          {/* Results Grid */}
          {!loading && movies.length > 0 && (
            <div className="space-y-5">
              {/* Curator Commentary Marquee */}
              {commentary && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#7e22ce]/20 via-[#3b0764]/30 to-amber-500/10 border border-amber-400/30 flex items-start gap-3 shadow-lg">
                  <span className="text-2xl shrink-0">📽️</span>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block mb-0.5">
                      Director&apos;s Cut Notes
                    </span>
                    <p className="text-xs sm:text-sm text-gray-200 leading-relaxed italic font-medium">
                      &ldquo;{commentary}&rdquo;
                    </p>
                  </div>
                </div>
              )}

              {/* Movie Cards Deck */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {movies.map((movie, idx) => {
                  const isSaved = movie.id ? savedIds.includes(movie.id) : false;
                  return (
                    <div
                      key={movie.id || idx}
                      onClick={() => handleOpenTheater(movie)}
                      className="group relative flex flex-col justify-between rounded-2xl bg-[#120822] hover:bg-[#190c30] border-2 border-white/[0.08] hover:border-amber-400/70 transition-all duration-300 shadow-xl overflow-hidden cursor-pointer"
                    >
                      <div>
                        {/* Poster Container with 2:3 Aspect Ratio */}
                        <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#180e2d]">
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

                          {/* Gradient Vignette */}
                          <div className="absolute inset-0 bg-gradient-to-t from-[#120822] via-transparent to-black/60 pointer-events-none" />

                          {/* Top Badges */}
                          <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
                            {/* Rating */}
                            <div className="px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md text-[11px] font-bold text-amber-300 flex items-center gap-1 shadow-md border border-white/10">
                              <BsStarFill size={10} />
                              <span>{movie.voteAverage || "N/A"}</span>
                            </div>

                            {/* Media Type & Year */}
                            <div className="px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider shadow-md border border-white/10 flex items-center gap-1">
                              <span>{movie.mediaType === "tv" ? "TV" : "Film"}</span>
                              {movie.year && (
                                <span className="text-gray-400 font-normal">• {movie.year}</span>
                              )}
                            </div>
                          </div>

                          {/* Hover Play Trailer Button Overlay */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 via-[#b300ff] to-purple-600 flex items-center justify-center text-white shadow-[0_0_30px_rgba(245,158,11,0.8)] transform scale-80 group-hover:scale-100 transition-all duration-300">
                              <BsFillPlayFill size={30} className="translate-x-0.5" />
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 mt-2 bg-black/70 px-2.5 py-0.5 rounded-full border border-amber-400/40">
                              Screen Trailer
                            </span>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="p-3.5">
                          <div className="flex items-start justify-between gap-2">
                            <h4
                              className="text-sm font-extrabold text-white line-clamp-1 group-hover:text-amber-300 transition-colors"
                              title={movie.title}
                            >
                              {movie.title}
                            </h4>

                            <button
                              type="button"
                              onClick={(e) => toggleWatchlist(e, movie)}
                              title={isSaved ? "In Watchlist" : "Add to Watchlist"}
                              className="text-gray-400 hover:text-amber-400 p-0.5 transition-colors"
                            >
                              {isSaved ? (
                                <IoBookmark size={16} className="text-amber-400" />
                              ) : (
                                <IoBookmarkOutline size={16} />
                              )}
                            </button>
                          </div>

                          {/* AI Match Commentary */}
                          <div className="mt-2 text-[11px] text-purple-200/90 bg-white/[0.04] p-2.5 rounded-xl border border-white/[0.06] leading-relaxed line-clamp-3">
                            <span className="text-amber-400 font-bold text-[9px] uppercase tracking-wider block mb-0.5">
                              ✨ Auteur Match
                            </span>
                            {movie.reason}
                          </div>

                          {/* Vibe Tags */}
                          {Array.isArray(movie.vibeTags) && movie.vibeTags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {movie.vibeTags.slice(0, 3).map((tag, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="px-1.5 py-0.5 rounded-md bg-[#b300ff]/15 text-[#d975ff] text-[9px] font-bold border border-[#b300ff]/25"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Action Controls */}
                      <div className="p-3.5 pt-0 grid grid-cols-2 gap-2 mt-auto">
                        {/* Play Trailer Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenTheater(movie);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95"
                        >
                          <BsFillPlayFill size={14} />
                          <span>Trailer</span>
                        </button>

                        {/* Watch / Stream Directly */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWatchStream(movie);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-black font-extrabold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer shadow-md active:scale-95"
                        >
                          <FaPlay size={10} />
                          <span>Watch</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiCineBotModal;

import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { IoSparkles, IoClose } from "react-icons/io5";
import { BsFillPlayFill, BsFillPlayCircleFill } from "react-icons/bs";
import { AiTwotoneStar } from "react-icons/ai";
import { FaKey, FaPlay } from "react-icons/fa";
import Wrapper from "../../components/Wrapper/Wrapper";
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

const CURATED_THEMES = [
  {
    title: "Mind-Bending & Paradoxes",
    prompt: "Mind-bending sci-fi movies with reality questions and twists",
    icon: "🧠",
    desc: "Stories that challenge reality, alternate timelines, and perception.",
  },
  {
    title: "High-Stakes Heists & Suspense",
    prompt: "Intelligent heist movies and cat-and-mouse thrillers",
    icon: "💎",
    desc: "Cerebral masterminds, complex plans, and gripping tension.",
  },
  {
    title: "Atmospheric Neo-Noir",
    prompt: "Atmospheric cyberpunk and neo-noir mystery films",
    icon: "🌃",
    desc: "Rain-slicked streets, cynical detectives, and neon shadows.",
  },
  {
    title: "Cozy & Heartwarming",
    prompt: "Heartwarming, comforting movies for a relaxed evening",
    icon: "☕",
    desc: "Feel-good cinema, lovable characters, and gentle narratives.",
  },
];

const CineBot: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [commentary, setCommentary] = useState("");
  const [movies, setMovies] = useState<AiMovieRecommendation[]>([]);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [apiKey, setApiKey] = useState("");

  // In-Place Active Trailer Player State
  const [activeTrailer, setActiveTrailer] = useState<{
    movieTitle: string;
    videoUrl: string | null;
    loading: boolean;
    error: string | null;
  } | null>(null);

  // Restore saved API key
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
    if (!activeQuery.trim()) return;

    setLoading(true);
    setActiveTrailer(null);

    // Sync query param
    setSearchParams({ q: activeQuery.trim() });

    try {
      const res = await getAiMovieRecommendations(
        activeQuery.trim(),
        undefined,
        apiKey
      );

      setCommentary(res.commentary);
      setMovies(res.movies);
    } catch (e) {
      console.error("CineBot curation error:", e);
    } finally {
      setLoading(false);
    }
  };

  // If URL has ?q=... on load, curate automatically
  useEffect(() => {
    const query = searchParams.get("q");
    if (query && query !== prompt) {
      setPrompt(query);
      handleCurate(query);
    }
  }, []);

  // Smooth scroll active trailer into view when expanded
  useEffect(() => {
    if (activeTrailer?.movieTitle) {
      const cardEl = document.getElementById(
        `cinebot-card-${encodeURIComponent(activeTrailer.movieTitle)}`
      );
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [activeTrailer?.movieTitle]);

  // Play Trailer Handler
  const handlePlayTrailer = async (movie: AiMovieRecommendation) => {
    // If clicking same trailer, toggle it off
    if (activeTrailer?.movieTitle === movie.title && !activeTrailer.loading) {
      setActiveTrailer(null);
      return;
    }

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
    const cleanTitle = encodeURIComponent(
      (movie.name || movie.title || "detail").toLowerCase()
    ).replace(/%20/g, "-");
    const routePrefix = urlMap[movie.mediaType === "tv" ? "tv" : "movie"];
    navigate(`${routePrefix}/${cleanTitle}/${movie.id || 0}`);
  };

  const handleWatchStream = (movie: AiMovieRecommendation) => {
    const type = movie.mediaType === "tv" ? "tv" : "movie";
    navigate(`/stream/${type}/${movie.id || 0}`);
  };

  return (
    <div className="min-h-screen pt-24 sm:pt-28 pb-16 bg-gradient-to-b from-[#140526] via-black-2 to-black text-white font-poppins relative overflow-hidden">
      {/* Ambient Top Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[900px] h-[350px] bg-dark-purple/15 blur-[120px] pointer-events-none rounded-full" />

      <Wrapper>
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-8 relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-dark-purple/20 text-dark-purple border border-dark-purple/40 mb-3 tracking-wider uppercase">
            <IoSparkles className="animate-pulse" />
            <span>AI Film Curator</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Discover Your Next Obsession
          </h1>

          <p className="mt-3 text-xs sm:text-sm md:text-base text-light-gray leading-relaxed max-w-2xl mx-auto">
            Search by feeling, micro-genres, shocking plot twists, or ask for &ldquo;movies like Interstellar with high emotional stakes&rdquo;.
          </p>

          {/* Custom API Key Button */}
          <div className="mt-3 flex justify-center">
            <button
              type="button"
              onClick={() => setShowKeyInput((prev) => !prev)}
              className="inline-flex items-center gap-1.5 text-xs text-light-gray hover:text-white transition-colors cursor-pointer opacity-80 hover:opacity-100"
            >
              <FaKey size={11} className="text-dark-purple" />
              <span>{showKeyInput ? "Hide Custom API Key" : "Configure Custom Gemini Key"}</span>
            </button>
          </div>

          {/* API Key Drawer */}
          {showKeyInput && (
            <div className="mt-4 p-3.5 rounded-xl bg-black/80 border border-white/10 text-xs text-left max-w-xl mx-auto animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => handleSaveKey(e.target.value)}
                  placeholder="Personal Gemini API key (AIzaSy...)"
                  className="w-full flex-1 px-3 py-2 rounded-lg bg-black-2 border border-white/20 text-xs text-white focus:outline-none focus:border-dark-purple"
                />
                {apiKey && (
                  <button
                    type="button"
                    onClick={() => handleSaveKey("")}
                    className="text-xs text-red-400 hover:text-red-300 font-medium px-2 py-1"
                  >
                    Clear
                  </button>
                )}
              </div>
              <p className="text-[11px] text-light-gray/70 mt-1.5">
                A shared MovieBuddy Gemini key is active by default. You can provide your own key here if desired.
              </p>
            </div>
          )}
        </div>

        {/* Hero Search Bar */}
        <div className="max-w-3xl mx-auto mb-6 relative z-10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCurate();
            }}
            className="flex items-center gap-2 p-1.5 sm:p-2 rounded-2xl bg-black-2/90 border border-white/15 focus-within:border-dark-purple shadow-[0_8px_30px_rgba(0,0,0,0.8)] transition-all"
          >
            <div className="relative flex-1 flex items-center pl-3">
              <IoSparkles className="text-dark-purple text-base sm:text-lg flex-shrink-0" />
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Search by vibe, plot, genre, or 'movies like Inception'..."
                className="w-full px-3 py-2.5 sm:py-3 bg-transparent text-xs sm:text-sm text-white placeholder-light-gray/60 focus:outline-none"
              />
              {prompt && (
                <button
                  type="button"
                  onClick={() => setPrompt("")}
                  className="p-1 rounded-full text-light-gray hover:text-white mr-1 cursor-pointer"
                >
                  <IoClose size={16} />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-dark-purple hover:bg-deep-purple font-medium text-xs sm:text-sm text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 flex-shrink-0 shadow-lg shadow-dark-purple/20"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <IoSparkles className="text-xs sm:text-sm" />
              )}
              <span>Curate</span>
            </button>
          </form>

          {/* Quick Mood Chips Carousel */}
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] text-light-gray/60 uppercase tracking-wider font-semibold whitespace-nowrap flex-shrink-0 hidden xs:inline">
              Vibes:
            </span>
            {MOOD_SUGGESTIONS.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPrompt(chip);
                  handleCurate(chip);
                }}
                className="px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs bg-white/5 hover:bg-dark-purple/30 border border-white/10 hover:border-dark-purple text-light-gray hover:text-white transition-all whitespace-nowrap cursor-pointer flex-shrink-0"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="relative z-10">
          {/* Loading State */}
          {loading && (
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-full border-2 border-dark-purple/30 border-t-dark-purple animate-spin flex items-center justify-center mb-4">
                <IoSparkles className="text-dark-purple text-xl animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                CineBot is searching cinema databases...
              </h3>
              <p className="text-xs sm:text-sm text-light-gray mt-1 max-w-sm">
                Analyzing narrative plots, thematic nuances, and fetching rich TMDB streaming data
              </p>
            </div>
          )}

          {/* Empty State / Inspiration Themes */}
          {!loading && movies.length === 0 && (
            <div className="py-8 max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-lg sm:text-xl font-bold text-white mb-1">
                  Or explore curated cinema themes
                </h2>
                <p className="text-xs sm:text-sm text-light-gray">
                  Tap any theme to instantly discover hand-picked masterworks
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {CURATED_THEMES.map((theme, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setPrompt(theme.prompt);
                      handleCurate(theme.prompt);
                    }}
                    className="p-5 rounded-2xl bg-black-2 border border-white/10 hover:border-dark-purple/60 hover:bg-[#1a1224] transition-all duration-300 cursor-pointer group flex items-start gap-4 shadow-lg"
                  >
                    <span className="text-3xl p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                      {theme.icon}
                    </span>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-dark-purple transition-colors">
                        {theme.title}
                      </h3>
                      <p className="text-xs text-light-gray mt-1 leading-relaxed">
                        {theme.desc}
                      </p>
                      <div className="mt-3 inline-flex items-center gap-1 text-xs text-dark-purple font-medium group-hover:translate-x-1 transition-transform">
                        <span>Explore theme</span>
                        <span>&rarr;</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations Results Grid */}
          {!loading && movies.length > 0 && (
            <div className="space-y-6">
              {/* Commentary Banner */}
              {commentary && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-dark-purple/20 via-black-2 to-black-2 border border-dark-purple/40 flex items-start gap-3.5 shadow-lg">
                  <span className="text-xl text-dark-purple flex-shrink-0">🎬</span>
                  <div>
                    <h4 className="text-xs uppercase font-semibold text-dark-purple tracking-wider mb-0.5">
                      Curator Commentary
                    </h4>
                    <p className="text-xs sm:text-sm text-white/90 leading-relaxed italic">
                      &ldquo;{commentary}&rdquo;
                    </p>
                  </div>
                </div>
              )}

              {/* Cards Grid: 1 col on mobile, 2 on sm, 3 on md, 4 on lg */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                {movies.map((movie, idx) => {
                  const isTrailerActive = activeTrailer?.movieTitle === movie.title;

                  // Netflix-style In-Place Trailer Preview: spans row, trailer & details take both places, other cards go down
                  if (isTrailerActive) {
                    return (
                      <div
                        id={`cinebot-card-${encodeURIComponent(movie.title)}`}
                        key={movie.id || idx}
                        className="col-span-full rounded-2xl bg-gradient-to-br from-black-2 via-[#141414] to-black border border-dark-purple/50 shadow-[0_8px_30px_rgba(179,0,255,0.2)] overflow-hidden transition-all duration-300 animate-fadeIn"
                      >
                        <div className="flex flex-col lg:flex-row items-stretch">
                          {/* Left: 16:9 Trailer Video Player */}
                          <div className="relative w-full lg:w-3/5 aspect-video bg-black flex-shrink-0 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-white/10">
                            {activeTrailer.loading ? (
                              <div className="flex flex-col items-center justify-center gap-2 p-6 text-light-gray text-xs">
                                <span className="w-8 h-8 border-2 border-dark-purple border-t-transparent rounded-full animate-spin" />
                                <span className="text-white font-medium">Loading trailer...</span>
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
                              <div className="flex flex-col items-center justify-center p-6 text-xs text-light-gray">
                                <span>No video trailer available.</span>
                              </div>
                            )}
                          </div>

                          {/* Right: Movie Details & Actions */}
                          <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between">
                            <div>
                              {/* Top Badges & Close Button */}
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-dark-purple/30 text-dark-purple border border-dark-purple/50">
                                    {movie.mediaType === "tv" ? "TV Series" : "Movie"}
                                  </span>
                                  {movie.year && (
                                    <span className="text-xs text-light-gray font-light">
                                      {movie.year}
                                    </span>
                                  )}
                                  {typeof movie.voteAverage === "number" && movie.voteAverage > 0 && (
                                    <span className="flex items-center gap-1 text-xs text-amber-400 bg-black/60 px-2 py-0.5 rounded border border-white/10">
                                      <AiTwotoneStar size={12} />
                                      <span>{movie.voteAverage.toFixed(1)}</span>
                                    </span>
                                  )}
                                </div>

                                {/* Close Trailer Button */}
                                <button
                                  type="button"
                                  onClick={() => setActiveTrailer(null)}
                                  title="Close trailer preview"
                                  className="p-1.5 rounded-lg bg-white/10 hover:bg-dark-purple text-light-gray hover:text-white transition-colors cursor-pointer flex-shrink-0"
                                >
                                  <IoClose size={18} />
                                </button>
                              </div>

                              {/* Title */}
                              <h3
                                onClick={() => handleNavigateDetail(movie)}
                                className="text-base sm:text-xl font-bold text-white hover:text-dark-purple transition-colors cursor-pointer"
                                title={movie.title}
                              >
                                {movie.title}
                              </h3>

                              {/* AI Reason */}
                              <div className="mt-2.5 p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-light-gray leading-relaxed">
                                <span className="text-dark-purple font-semibold mr-1.5">Why CineBot picked this:</span>
                                {movie.reason}
                              </div>

                              {/* Overview if present */}
                              {movie.overview && (
                                <p className="mt-2 text-xs text-light-gray/80 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                                  {movie.overview}
                                </p>
                              )}
                            </div>

                            {/* Actions Row */}
                            <div className="flex items-center gap-2.5 mt-4 pt-3 border-t border-white/10">
                              <button
                                type="button"
                                onClick={() => handleWatchStream(movie)}
                                className="flex-1 py-2 sm:py-2.5 px-4 rounded-xl bg-dark-purple hover:bg-deep-purple font-medium text-xs sm:text-sm text-white transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-dark-purple/20"
                              >
                                <FaPlay size={11} />
                                <span>Watch Stream</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleNavigateDetail(movie)}
                                className="py-2 sm:py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 font-medium text-xs sm:text-sm text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <span>More Info</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setActiveTrailer(null)}
                                className="py-2 sm:py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-light-gray hover:text-white transition-colors cursor-pointer"
                                title="Minimize trailer"
                              >
                                Close
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Inactive / Normal Card
                  const posterImg = movie.posterPath
                    ? originalImage(movie.posterPath, 400)
                    : movie.backdropPath
                    ? originalImage(movie.backdropPath, 500)
                    : "/images/no-image.jpg";
                  const backdropImg = movie.backdropPath
                    ? originalImage(movie.backdropPath, 500)
                    : posterImg;

                  return (
                    <div
                      id={`cinebot-card-${encodeURIComponent(movie.title)}`}
                      key={movie.id || idx}
                      className="card group flex flex-col justify-between rounded-xl bg-black-2 border border-white/10 hover:border-dark-purple/50 transition-all duration-300 overflow-hidden shadow-lg"
                    >
                      <div>
                        {/* Movie Visual: Wide 16:9 on mobile (1 card per row), 2:3 vertical poster on sm+ */}
                        <div
                          onClick={() => handlePlayTrailer(movie)}
                          className="relative aspect-video sm:aspect-2/3 w-full overflow-hidden bg-black cursor-pointer"
                          title="Click to play trailer"
                        >
                          <img
                            src={backdropImg}
                            alt={movie.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 block sm:hidden"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                "https://www.movienewz.com/img/films/poster-holder.jpg";
                            }}
                          />
                          <img
                            src={posterImg}
                            alt={movie.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 hidden sm:block"
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
                        <div className="p-3.5">
                          <h4
                            onClick={() => handleNavigateDetail(movie)}
                            className="text-xs sm:text-sm font-medium text-white truncate hover:text-dark-purple transition-colors cursor-pointer"
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
                      <div className="p-3.5 pt-0 grid grid-cols-2 gap-2 mt-auto">
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
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </Wrapper>
    </div>
  );
};

export default CineBot;

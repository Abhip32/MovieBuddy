import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  IoPeople,
  IoArrowForward,
  IoCheckmarkCircleOutline,
  IoSearch,
  IoClose,
  IoStar,
  IoFilm,
  IoTv,
} from "react-icons/io5";
import { FaCrown, FaUsers, FaPlay, FaRegComments, FaSmile } from "react-icons/fa";
import Wrapper from "../../components/Wrapper/Wrapper";
import { generateRoomCode } from "../../services/watchPartyService";
import tmdbApi from "../../services/tmdbApi";
import { originalImage } from "../../services/apiConfigs";
import { Movie, TV } from "../../Types/Movie";

export interface SelectedPartyMedia {
  id: string;
  mediaType: "movie" | "tv";
  title: string;
  category: string;
  poster_path?: string;
  year?: string;
  rating?: number;
}

const STARTER_OPTIONS: SelectedPartyMedia[] = [
  {
    id: "157336",
    mediaType: "movie",
    title: "Interstellar",
    category: "Sci-Fi Film",
    poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    year: "2014",
    rating: 8.4,
  },
  {
    id: "27205",
    mediaType: "movie",
    title: "Inception",
    category: "Sci-Fi Film",
    poster_path: "/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    year: "2010",
    rating: 8.4,
  },
  {
    id: "155",
    mediaType: "movie",
    title: "The Dark Knight",
    category: "Action Film",
    poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    year: "2008",
    rating: 8.5,
  },
  {
    id: "872585",
    mediaType: "movie",
    title: "Oppenheimer",
    category: "Drama Film",
    poster_path: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    year: "2023",
    rating: 8.1,
  },
  {
    id: "1396",
    mediaType: "tv",
    title: "Breaking Bad",
    category: "TV Series",
    poster_path: "/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg",
    year: "2008",
    rating: 8.9,
  },
  {
    id: "100088",
    mediaType: "tv",
    title: "The Last of Us",
    category: "TV Series",
    poster_path: "/uKvVjHNqB5VmOrdxqAt2V7JMrHG.jpg",
    year: "2023",
    rating: 8.6,
  },
  {
    id: "66732",
    mediaType: "tv",
    title: "Stranger Things",
    category: "TV Series",
    poster_path: "/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    year: "2016",
    rating: 8.6,
  },
];

const WatchParty: React.FC = () => {
  const navigate = useNavigate();

  // Host form states
  const [hostName, setHostName] = useState(
    localStorage.getItem("moviebuddy_party_username") || ""
  );
  const [selectedMedia, setSelectedMedia] = useState<SelectedPartyMedia>(STARTER_OPTIONS[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SelectedPartyMedia[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [hostCustomCode, setHostCustomCode] = useState("");

  // Search TMDB live for movies & TV series
  useEffect(() => {
    const query = searchQuery.trim();
    if (!query || query.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const handler = setTimeout(async () => {
      try {
        const [moviesRes, tvRes] = await Promise.all([
          tmdbApi.search<Movie>("movie", query),
          tmdbApi.search<TV>("tv", query),
        ]);

        const movieItems: SelectedPartyMedia[] = (moviesRes.data.results || [])
          .slice(0, 5)
          .map((m) => ({
            id: String(m.id),
            mediaType: "movie",
            title: m.title || "Untitled Movie",
            category: "Movie",
            poster_path: m.poster_path,
            year: m.release_date ? new Date(m.release_date).getFullYear().toString() : undefined,
            rating: typeof m.vote_average === "number" ? m.vote_average : undefined,
          }));

        const tvItems: SelectedPartyMedia[] = (tvRes.data.results || [])
          .slice(0, 5)
          .map((t) => ({
            id: String(t.id),
            mediaType: "tv",
            title: t.name || "Untitled Series",
            category: "TV Series",
            poster_path: t.poster_path,
            year: t.first_air_date ? new Date(t.first_air_date).getFullYear().toString() : undefined,
            rating: typeof t.vote_average === "number" ? t.vote_average : undefined,
          }));

        const combined = [...movieItems, ...tvItems].sort(
          (a, b) => (b.rating || 0) - (a.rating || 0)
        );
        setSearchResults(combined);
        setShowDropdown(true);
      } catch (err) {
        console.error("Watch Party search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectMedia = (item: SelectedPartyMedia) => {
    setSelectedMedia(item);
    setSearchQuery("");
    setShowDropdown(false);
  };

  // Join form states
  const [joinName, setJoinName] = useState(
    localStorage.getItem("moviebuddy_party_username") || ""
  );
  const [joinInput, setJoinInput] = useState("");
  const [joinError, setJoinError] = useState("");
  const [hostError, setHostError] = useState("");

  const handleCreateParty = (e: React.FormEvent) => {
    e.preventDefault();
    const finalHost = hostName.trim();
    if (!finalHost) {
      setHostError("Please enter your name to host the party");
      return;
    }
    setHostError("");

    try {
      localStorage.setItem("moviebuddy_party_username", finalHost);
    } catch {}

    const roomCode = hostCustomCode.trim()
      ? hostCustomCode.trim().toUpperCase()
      : generateRoomCode();

    navigate(`/stream/${selectedMedia.mediaType}/${selectedMedia.id}?party=${roomCode}&host=true`);
  };

  const handleJoinParty = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = joinName.trim();
    if (!finalName) {
      setJoinError("Please enter your name before joining");
      return;
    }

    const rawInput = joinInput.trim();
    if (!rawInput) {
      setJoinError("Please enter a room code or invite link");
      return;
    }
    setJoinError("");

    try {
      localStorage.setItem("moviebuddy_party_username", finalName);
    } catch {}

    // Check if input is a full URL or path
    if (rawInput.includes("party=")) {
      try {
        const urlObj = new URL(
          rawInput.startsWith("http") ? rawInput : `http://dummy.com/${rawInput.replace(/^\/+/, "")}`
        );
        const partyParam = urlObj.searchParams.get("party");
        if (partyParam) {
          // If path contains stream route, navigate to that exact pathname + query
          if (urlObj.pathname.includes("/stream/")) {
            navigate(`${urlObj.pathname}?party=${partyParam.toUpperCase()}`);
            return;
          }
          navigate(`/stream/movie/157336?party=${partyParam.toUpperCase()}`);
          return;
        }
      } catch {
        // Fallback regex if URL constructor fails
        const match = rawInput.match(/party=([A-Za-z0-9_-]+)/);
        if (match) {
          navigate(`/stream/movie/157336?party=${match[1].toUpperCase()}`);
          return;
        }
      }
    }

    // Clean room code
    const cleanCode = rawInput.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    if (cleanCode.length < 3) {
      setJoinError("Please enter a valid room code (at least 3 characters)");
      return;
    }

    navigate(`/stream/movie/157336?party=${cleanCode}`);
  };

  return (
    <div className="min-h-screen pt-24 sm:pt-28 pb-16 bg-gradient-to-b from-[#140526] via-black-2 to-black text-white font-poppins relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[650px] h-[320px] bg-dark-purple/15 blur-[120px] pointer-events-none rounded-full" />

      <Wrapper>
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-dark-purple/20 text-dark-purple border border-dark-purple/40 mb-3 tracking-wider uppercase">
            <FaUsers className="text-sm" />
            <span>MovieBuddy Watch Party</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Watch Movies Together in Real-Time
          </h1>

          <p className="mt-3 text-xs sm:text-sm md:text-base text-light-gray leading-relaxed max-w-2xl mx-auto">
            Create a private viewing room or join friends using a room code. Chat live, burst synchronized reactions across the screen, and enjoy films together.
          </p>
        </div>

        {/* Action Cards: Host & Join */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12 relative z-10">
          {/* Card 1: Host a Party */}
          <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-black-2 to-[#140b20] border border-white/10 hover:border-dark-purple/50 transition-all duration-300 shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-dark-purple/20 border border-dark-purple/40 flex items-center justify-center mb-4 text-dark-purple">
                <FaCrown size={22} />
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-white mb-1">
                Host a Watch Party
              </h2>
              <p className="text-xs text-light-gray leading-relaxed mb-5">
                Start a party room. You control playback and can invite friends with a shareable code.
              </p>

              <form onSubmit={handleCreateParty} className="space-y-4">
                {/* Host Name Input */}
                <div>
                  <label className="block text-[11px] font-semibold text-light-gray uppercase tracking-wider mb-1.5">
                    Your Name (Host): <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={hostName}
                    onChange={(e) => {
                      setHostName(e.target.value);
                      if (hostError) setHostError("");
                    }}
                    placeholder="Enter your name or nickname..."
                    maxLength={24}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/15 text-xs sm:text-sm text-white placeholder-light-gray/50 focus:outline-none focus:border-dark-purple transition-colors"
                  />
                  {hostError && (
                    <p className="text-[11px] text-red-400 mt-1">{hostError}</p>
                  )}
                </div>

                {/* Search & Choose Any Movie or TV Series */}
                <div ref={dropdownRef} className="relative">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-semibold text-light-gray uppercase tracking-wider">
                      Choose Any Movie or TV Series:
                    </label>
                    <span className="text-[10px] text-purple-300 font-medium">
                      Search TMDB catalog
                    </span>
                  </div>

                  {/* Search Input Bar */}
                  <div className="relative flex items-center">
                    <IoSearch className="absolute left-3.5 text-light-gray pointer-events-none" size={15} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowDropdown(true);
                      }}
                      onFocus={() => {
                        if (searchResults.length > 0) setShowDropdown(true);
                      }}
                      placeholder="Search any title (e.g. Inception, Stranger Things, Gladiator)..."
                      className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-black border border-white/15 text-xs sm:text-sm text-white placeholder-light-gray/50 focus:outline-none focus:border-dark-purple transition-colors"
                    />
                    {isSearching ? (
                      <div className="absolute right-3 w-3.5 h-3.5 border-2 border-t-transparent border-purple-400 rounded-full animate-spin" />
                    ) : searchQuery ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setSearchResults([]);
                          setShowDropdown(false);
                        }}
                        className="absolute right-3 text-light-gray hover:text-white"
                      >
                        <IoClose size={16} />
                      </button>
                    ) : null}
                  </div>

                  {/* Live Search Results Dropdown */}
                  {showDropdown && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-50 max-h-60 overflow-y-auto rounded-xl bg-black-2 border border-white/15 shadow-2xl divide-y divide-white/5 scrollbar-thin">
                      {searchResults.map((item) => (
                        <div
                          key={`${item.mediaType}-${item.id}`}
                          onClick={() => handleSelectMedia(item)}
                          className="p-2.5 hover:bg-white/10 cursor-pointer flex items-center gap-3 transition-colors"
                        >
                          <div className="w-9 h-12 rounded bg-black flex-shrink-0 overflow-hidden border border-white/10">
                            {item.poster_path ? (
                              <img
                                src={originalImage(item.poster_path, 200)}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[9px] text-light-gray">
                                {item.mediaType === "movie" ? "FILM" : "TV"}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className="text-xs font-semibold text-white truncate">{item.title}</p>
                            <div className="flex items-center gap-2 text-[10px] text-light-gray mt-0.5">
                              <span className="uppercase px-1.5 py-0.2 rounded bg-white/10 text-white font-bold text-[9px]">
                                {item.mediaType === "movie" ? "Movie" : "TV Series"}
                              </span>
                              {item.year && <span>{item.year}</span>}
                              {item.rating && (
                                <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                                  <IoStar size={10} /> {item.rating.toFixed(1)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Selected Item Confirmation Card */}
                  <div className="mt-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-9 h-12 rounded bg-black flex-shrink-0 overflow-hidden border border-white/10">
                        {selectedMedia.poster_path ? (
                          <img
                            src={originalImage(selectedMedia.poster_path, 200)}
                            alt={selectedMedia.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[8px] text-purple-300">
                            {selectedMedia.mediaType.toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-dark-purple/80 text-white font-bold">
                            {selectedMedia.mediaType.toUpperCase()}
                          </span>
                          <span className="text-xs font-bold text-white truncate">{selectedMedia.title}</span>
                        </div>
                        <p className="text-[10px] text-light-gray mt-0.5">
                          Ready to sync • ID #{selectedMedia.id} {selectedMedia.year ? `(${selectedMedia.year})` : ""}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-purple-300 font-semibold px-2 py-1 rounded-lg bg-dark-purple/20 border border-dark-purple/40 flex-shrink-0">
                      Selected
                    </span>
                  </div>

                  {/* Popular Quick Picks */}
                  <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-light-gray">Quick Picks:</span>
                    {STARTER_OPTIONS.slice(0, 4).map((pop) => (
                      <button
                        key={pop.id}
                        type="button"
                        onClick={() => setSelectedMedia(pop)}
                        className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors cursor-pointer ${
                          selectedMedia.id === pop.id
                            ? "bg-dark-purple text-white border-dark-purple font-semibold shadow-sm shadow-dark-purple/50"
                            : "bg-white/5 text-light-gray border-white/10 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        {pop.title}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Room Code (Optional) */}
                <div>
                  <label className="block text-[11px] font-semibold text-light-gray uppercase tracking-wider mb-1.5">
                    Custom Room Code (Optional):
                  </label>
                  <input
                    type="text"
                    value={hostCustomCode}
                    onChange={(e) => setHostCustomCode(e.target.value.toUpperCase())}
                    placeholder="e.g. MOVIENIGHT (or leave empty for auto)"
                    maxLength={10}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-dark-purple font-mono uppercase transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-dark-purple hover:bg-deep-purple font-semibold text-xs sm:text-sm text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-dark-purple/25 active:scale-[0.99]"
                >
                  <FaPlay size={11} />
                  <span>Create Watch Party</span>
                </button>
              </form>
            </div>
          </div>

          {/* Card 2: Join a Party */}
          <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-black-2 to-[#140b20] border border-white/10 hover:border-dark-purple/50 transition-all duration-300 shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-dark-purple/20 border border-dark-purple/40 flex items-center justify-center mb-4 text-dark-purple">
                <IoPeople size={24} />
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-white mb-1">
                Join a Watch Party
              </h2>
              <p className="text-xs text-light-gray leading-relaxed mb-5">
                Have a room code or invite link from a friend? Enter your name and code to hop right in.
              </p>

              <form onSubmit={handleJoinParty} className="space-y-4">
                {/* User Name Input */}
                <div>
                  <label className="block text-[11px] font-semibold text-light-gray uppercase tracking-wider mb-1.5">
                    Your Name: <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={joinName}
                    onChange={(e) => {
                      setJoinName(e.target.value);
                      if (joinError) setJoinError("");
                    }}
                    placeholder="Enter your name or nickname..."
                    maxLength={24}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/15 text-xs sm:text-sm text-white placeholder-light-gray/50 focus:outline-none focus:border-dark-purple transition-colors"
                  />
                </div>

                {/* Room Code or Link Input */}
                <div>
                  <label className="block text-[11px] font-semibold text-light-gray uppercase tracking-wider mb-1.5">
                    Room Code or Invite Link: <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={joinInput}
                    onChange={(e) => {
                      setJoinInput(e.target.value);
                      if (joinError) setJoinError("");
                    }}
                    placeholder="e.g. X7K9PQ or paste invite link..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-dark-purple font-mono transition-colors"
                  />
                  {joinError && (
                    <p className="text-[11px] text-red-400 mt-1">{joinError}</p>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-light-gray leading-relaxed">
                  💡 Tip: You can also start watching any title on MovieBuddy and click the <strong className="text-white">&ldquo;Start Watch Party&rdquo;</strong> button to generate an instant invite link!
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-white/10 hover:bg-dark-purple font-semibold text-xs sm:text-sm text-white transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/10 hover:border-dark-purple shadow-lg active:scale-[0.99]"
                >
                  <IoArrowForward size={15} />
                  <span>Join Watch Party</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="max-w-4xl mx-auto pt-6 border-t border-white/10 relative z-10">
          <h3 className="text-center text-xs font-semibold uppercase tracking-wider text-light-gray mb-6">
            How MovieBuddy Watch Party Works
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-black-2/60 border border-white/5 flex flex-col items-center text-center">
              <div className="w-9 h-9 rounded-full bg-dark-purple/20 text-dark-purple flex items-center justify-center mb-2.5">
                <FaPlay size={12} />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">1. Host or Join</h4>
              <p className="text-[11px] text-light-gray leading-relaxed">
                Start a party with any movie or TV series and share your 6-digit room code with friends.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-black-2/60 border border-white/5 flex flex-col items-center text-center">
              <div className="w-9 h-9 rounded-full bg-dark-purple/20 text-dark-purple flex items-center justify-center mb-2.5">
                <FaRegComments size={14} />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">2. Live Party Chat</h4>
              <p className="text-[11px] text-light-gray leading-relaxed">
                Chat in real time directly alongside the stream with participant badges and system updates.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-black-2/60 border border-white/5 flex flex-col items-center text-center">
              <div className="w-9 h-9 rounded-full bg-dark-purple/20 text-dark-purple flex items-center justify-center mb-2.5">
                <FaSmile size={14} />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">3. Live Emoji Bursts</h4>
              <p className="text-[11px] text-light-gray leading-relaxed">
                Fire synchronized reaction emojis that float upward across the video screen for all members.
              </p>
            </div>
          </div>
        </div>
      </Wrapper>
    </div>
  );
};

export default WatchParty;

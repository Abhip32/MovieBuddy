import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoSparkles, IoPeople, IoPlay, IoArrowForward } from "react-icons/io5";
import { FaCrown, FaUsers, FaPlay } from "react-icons/fa";
import Wrapper from "../../components/Wrapper/Wrapper";
import { generateRoomCode } from "../../services/watchPartyService";

interface CommunityParty {
  id: string;
  roomCode: string;
  title: string;
  mediaType: "movie" | "tv";
  tmdbId: number;
  season?: number;
  episode?: number;
  host: string;
  viewers: number;
  backdrop: string;
  tagline: string;
}

const FEATURED_PARTIES: CommunityParty[] = [
  {
    id: "party_interstellar",
    roomCode: "COSMIC",
    title: "Interstellar",
    mediaType: "movie",
    tmdbId: 157336,
    host: "NolanBuff",
    viewers: 7,
    backdrop: "https://image.tmdb.org/t/p/w1280/rAiYTua50bDmZZKvf5wDRU7RXZm.jpg",
    tagline: "Late night cosmic deep dive into wormholes & time dilation.",
  },
  {
    id: "party_breaking_bad",
    roomCode: "HEISEN",
    title: "Breaking Bad",
    mediaType: "tv",
    tmdbId: 1396,
    season: 1,
    episode: 1,
    host: "WalterPink",
    viewers: 9,
    backdrop: "https://image.tmdb.org/t/p/w1280/9faGSFi5jam6pDWGNd0ip80ioqa.jpg",
    tagline: "Piloting through Albuquerque crime with live party chat.",
  },
  {
    id: "party_inception",
    roomCode: "DREAM9",
    title: "Inception",
    mediaType: "movie",
    tmdbId: 27205,
    host: "Ariadne",
    viewers: 5,
    backdrop: "https://image.tmdb.org/t/p/w1280/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
    tagline: "Synchronized heist into dreams within dreams.",
  },
  {
    id: "party_the_last_of_us",
    roomCode: "CLICKR",
    title: "The Last of Us",
    mediaType: "tv",
    tmdbId: 100088,
    season: 1,
    episode: 1,
    host: "JoelMiller",
    viewers: 6,
    backdrop: "https://image.tmdb.org/t/p/w1280/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg",
    tagline: "Post-apocalyptic trek across America. Synced reactions enabled.",
  },
];

const WatchParty: React.FC = () => {
  const navigate = useNavigate();

  const [joinCode, setJoinCode] = useState("");
  const [userName, setUserName] = useState(
    localStorage.getItem("moviebuddy_party_username") || ""
  );

  // Quick Host Party Form
  const [hostMovieId, setHostMovieId] = useState("157336"); // default Interstellar
  const [hostMediaType, setHostMediaType] = useState<"movie" | "tv">("movie");
  const [hostCustomCode, setHostCustomCode] = useState("");

  const handleSaveUserName = (name: string) => {
    setUserName(name);
    try {
      localStorage.setItem("moviebuddy_party_username", name.trim());
    } catch {}
  };

  const handleCreateParty = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUser = userName.trim() || "Host";
    handleSaveUserName(finalUser);

    const roomCode = hostCustomCode.trim() || generateRoomCode();
    navigate(`/stream/${hostMediaType}/${hostMovieId}?party=${roomCode}&host=true`);
  };

  const handleJoinParty = (e: React.FormEvent) => {
    e.preventDefault();
    let raw = joinCode.trim();
    if (!raw) return;

    const finalUser = userName.trim() || "MovieFan";
    handleSaveUserName(finalUser);

    // Extract code if user pasted a full URL
    if (raw.includes("party=")) {
      const match = raw.match(/party=([A-Za-z0-9_-]+)/);
      if (match) raw = match[1];
    }

    // Default to streaming Interstellar or route directly if target known
    navigate(`/stream/movie/157336?party=${raw.toUpperCase()}`);
  };

  const handleJoinCommunityParty = (party: CommunityParty) => {
    const finalUser = userName.trim() || "Guest";
    handleSaveUserName(finalUser);

    if (party.mediaType === "tv") {
      navigate(
        `/stream/tv/${party.tmdbId}?party=${party.roomCode}&season=${party.season || 1}&episode=${party.episode || 1}`
      );
    } else {
      navigate(`/stream/movie/${party.tmdbId}?party=${party.roomCode}`);
    }
  };

  return (
    <div className="min-h-screen pt-24 sm:pt-28 pb-16 bg-gradient-to-b from-[#16062b] via-black-2 to-black text-white font-poppins relative overflow-hidden">
      {/* Ambient Top Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-dark-purple/15 blur-[130px] pointer-events-none rounded-full" />

      <Wrapper>
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto mb-10 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-dark-purple/20 text-dark-purple border border-dark-purple/40 mb-3 tracking-wider uppercase">
            <FaUsers className="text-sm" />
            <span>MovieBuddy Watch Party</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Watch Movies Together in Real-Time
          </h1>

          <p className="mt-3 text-xs sm:text-sm md:text-base text-light-gray leading-relaxed max-w-2xl mx-auto">
            Host a virtual cinema room, invite your friends with a shareable link, chat live, and burst synchronized emoji reactions across the screen.
          </p>

          {/* User Nickname Input */}
          <div className="mt-5 inline-flex items-center gap-2 p-1.5 pl-3 rounded-full bg-black-2 border border-white/10 text-xs">
            <span className="text-light-gray">Your Display Name:</span>
            <input
              type="text"
              value={userName}
              onChange={(e) => handleSaveUserName(e.target.value)}
              placeholder="e.g. Alex"
              className="px-3 py-1 rounded-full bg-black border border-white/10 text-white focus:outline-none focus:border-dark-purple"
            />
          </div>
        </div>

        {/* Action Cards: Create & Join */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-14 relative z-10">
          {/* Card 1: Create a Party */}
          <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-black-2 to-[#140b20] border border-white/10 hover:border-dark-purple/60 transition-all duration-300 shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-dark-purple/20 border border-dark-purple/40 flex items-center justify-center mb-4 text-dark-purple">
                <FaCrown size={22} />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mb-1">
                Host a New Party
              </h2>
              <p className="text-xs text-light-gray leading-relaxed mb-5">
                Generate an instant room with shareable link. You control the synchronized stream for your group.
              </p>

              <form onSubmit={handleCreateParty} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-light-gray uppercase tracking-wider mb-1">
                    Featured Starter Movie:
                  </label>
                  <select
                    value={hostMovieId}
                    onChange={(e) => {
                      setHostMovieId(e.target.value);
                      if (e.target.value === "1396") setHostMediaType("tv");
                      else setHostMediaType("movie");
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-dark-purple"
                  >
                    <option value="157336">Interstellar (Sci-Fi Film)</option>
                    <option value="27205">Inception (Sci-Fi Film)</option>
                    <option value="155">The Dark Knight (Action Film)</option>
                    <option value="1396">Breaking Bad (TV Series)</option>
                    <option value="100088">The Last of Us (TV Series)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-light-gray uppercase tracking-wider mb-1">
                    Custom Room Code (Optional):
                  </label>
                  <input
                    type="text"
                    value={hostCustomCode}
                    onChange={(e) => setHostCustomCode(e.target.value.toUpperCase())}
                    placeholder="e.g. MOVIENIGHT"
                    maxLength={10}
                    className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-dark-purple font-mono uppercase"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-dark-purple hover:bg-deep-purple font-semibold text-xs sm:text-sm text-white transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-dark-purple/30"
                >
                  <FaPlay size={10} />
                  <span>Launch Watch Party</span>
                </button>
              </form>
            </div>
          </div>

          {/* Card 2: Join with Code */}
          <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-black-2 to-[#140b20] border border-white/10 hover:border-dark-purple/60 transition-all duration-300 shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-dark-purple/20 border border-dark-purple/40 flex items-center justify-center mb-4 text-dark-purple">
                <IoPeople size={24} />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mb-1">
                Join Friend&apos;s Party
              </h2>
              <p className="text-xs text-light-gray leading-relaxed mb-5">
                Have a 6-digit room code or invite link from a friend? Enter it below to dive straight into the party room.
              </p>

              <form onSubmit={handleJoinParty} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-light-gray uppercase tracking-wider mb-1">
                    Room Code or Invite URL:
                  </label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="e.g. MB-7492 or paste link"
                    className="w-full px-3 py-2 rounded-xl bg-black border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-dark-purple font-mono"
                  />
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-light-gray">
                  💡 Tip: You can also start any movie or series stream on MovieBuddy and click the <strong className="text-white">&ldquo;Watch Party&rdquo;</strong> button to invite friends anytime!
                </div>

                <button
                  type="submit"
                  disabled={!joinCode.trim()}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-dark-purple font-semibold text-xs sm:text-sm text-white transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <IoArrowForward size={14} />
                  <span>Join Party</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Featured Live Community Rooms */}
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>Live Community Parties</span>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
              </h2>
              <p className="text-xs text-light-gray mt-0.5">
                Hop into public viewing lounges and watch alongside fellow cinema fans
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURED_PARTIES.map((party) => (
              <div
                key={party.id}
                onClick={() => handleJoinCommunityParty(party)}
                className="group relative rounded-2xl bg-black-2 border border-white/10 hover:border-dark-purple/60 overflow-hidden shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                {/* Visual Backdrop */}
                <div className="relative aspect-video w-full overflow-hidden bg-black">
                  <img
                    src={party.backdrop}
                    alt={party.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black-2 via-black/40 to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-dark-purple text-[10px] uppercase font-bold text-white shadow-md">
                      {party.mediaType === "tv" ? "TV Series" : "Movie"}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-[10px] font-semibold text-green-400 flex items-center gap-1 border border-white/10">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      <span>{party.viewers} Watching</span>
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-[10px] font-mono text-purple-300 border border-white/10">
                    #{party.roomCode}
                  </div>

                  {/* Play Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-dark-purple transition-colors">
                        {party.title}
                      </h3>
                      <p className="text-[11px] text-light-gray">
                        Host: {party.host}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-full bg-dark-purple text-white shadow-lg group-hover:scale-110 transition-transform">
                      <FaPlay size={11} />
                    </div>
                  </div>
                </div>

                {/* Description Footer */}
                <div className="p-3 bg-black-2/80 text-xs text-light-gray border-t border-white/5 flex items-center justify-between">
                  <p className="truncate max-w-[260px] sm:max-w-xs">{party.tagline}</p>
                  <span className="text-dark-purple font-medium text-[11px] group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                    Join &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Wrapper>
    </div>
  );
};

export default WatchParty;

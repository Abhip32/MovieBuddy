import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import otakuService, { AniListMedia } from "../../services/otakuService";
import { FaUsers, FaServer } from "react-icons/fa";
import { IoStar, IoVolumeHigh, IoLanguage, IoArrowBack, IoInformationCircleOutline } from "react-icons/io5";
import {
  WatchPartySession,
  generateRoomCode,
  PartySyncState,
} from "../../services/watchPartyService";
import { WatchPartyDock } from "../../components/WatchParty/WatchPartyDock";

type StreamServer = "animeembed" | "filmu";
type AudioTrack = "sub" | "dub";

const OtakuStreaming: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const partyCode = searchParams.get("party");
  const isHostParam = searchParams.get("host") === "true";
  const initialEpParam = searchParams.get("ep") || "1";

  const [anime, setAnime] = useState<AniListMedia | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Playback States
  const [selectedServer, setSelectedServer] = useState<StreamServer>("animeembed");
  const [audioTrack, setAudioTrack] = useState<AudioTrack>("sub");
  const [currentEpisode, setCurrentEpisode] = useState<number>(parseInt(initialEpParam) || 1);
  const [src, setSrc] = useState<string>("");
  const [episodeRangeIndex, setEpisodeRangeIndex] = useState<number>(0);

  // Watch Party session
  const [partySession, setPartySession] = useState<WatchPartySession | null>(null);

  // Fetch AniList Anime Detail
  const fetchAnimeData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await otakuService.getAnimeDetail(parseInt(id));
      setAnime(data);
    } catch {
      // Handle error gracefully
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAnimeData();
  }, [fetchAnimeData]);

  // Watch Party Setup
  useEffect(() => {
    if (!partyCode) {
      setPartySession(null);
      return;
    }

    const savedName =
      localStorage.getItem("moviebuddy_party_username") ||
      (isHostParam ? "Host" : "OtakuFan");

    const session = new WatchPartySession(partyCode, savedName, isHostParam);
    setPartySession(session);

    return () => {
      session.destroy();
    };
  }, [partyCode, isHostParam]);

  const totalEpisodeCount = useMemo(() => {
    if (anime?.format === "MOVIE") return 1;
    return anime?.episodes || 12;
  }, [anime]);

  // Compute stream URL directly using AniList ID
  useEffect(() => {
    if (!id) return;
    setIsLoading(true);

    if (selectedServer === "animeembed") {
      setSrc(`https://www.animeembed.com/embed/ani/${id}/${currentEpisode}?track=${audioTrack}`);
    } else {
      setSrc(`https://embed.filmu.in/anime/${id}?ep=${currentEpisode}`);
    }
  }, [id, selectedServer, audioTrack, currentEpisode]);

  const handleSelectEpisode = (ep: number) => {
    setCurrentEpisode(ep);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("ep", String(ep));
    setSearchParams(newParams);

    // Broadcast stream sync to Watch Party members if Host
    if (partySession && partySession.isHost) {
      partySession.syncStream({
        mediaType: "tv",
        contentId: id!,
        contentTitle: anime?.title.english || anime?.title.romaji,
        episode: String(ep),
        hostName: partySession.user.name,
        updatedAt: Date.now(),
      });
    }
  };

  const handleStartWatchParty = () => {
    const newRoom = generateRoomCode();
    const newParams = new URLSearchParams(searchParams);
    newParams.set("party", newRoom);
    newParams.set("host", "true");
    setSearchParams(newParams);
  };

  const handleLeaveParty = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("party");
    newParams.delete("host");
    setSearchParams(newParams);
  };

  const handleSyncWithHost = (sync: PartySyncState) => {
    if (sync.episode) {
      const epNum = parseInt(sync.episode);
      if (!isNaN(epNum)) setCurrentEpisode(epNum);
    }
  };

  // Group linear episodes in batches of 50
  const episodeRanges = useMemo(() => {
    const ranges: { label: string; start: number; end: number }[] = [];
    const step = 50;
    for (let i = 1; i <= totalEpisodeCount; i += step) {
      const end = Math.min(i + step - 1, totalEpisodeCount);
      ranges.push({ label: `${i} - ${end}`, start: i, end });
    }
    return ranges;
  }, [totalEpisodeCount]);

  const activeRange = episodeRanges[episodeRangeIndex] || {
    start: 1,
    end: totalEpisodeCount,
  };

  const animeTitle = anime?.title.english || anime?.title.romaji || "Otaku Anime Stream";

  useEffect(() => {
    if (anime) {
      document.title = `${animeTitle} - Otaku Stream`;
    }
    return () => {
      document.title = "MovieBuddy";
    };
  }, [anime, animeTitle]);

  if (!anime) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-t-transparent border-dark-purple rounded-full animate-spin" />
      </div>
    );
  }

  const isMovie = anime.format === "MOVIE";

  return (
    <div className="p-4 sm:p-6 md:p-10 min-h-screen bg-black text-white font-poppins">
      <div
        className={`mt-16 sm:mt-20 mx-auto ${
          partySession ? "max-w-[1600px]" : "max-w-6xl"
        }`}
      >
        <div
          className={
            partySession ? "grid grid-cols-1 lg:grid-cols-12 gap-6" : ""
          }
        >
          {/* Main Player Column */}
          <div className={partySession ? "lg:col-span-8 xl:col-span-8" : ""}>
            {/* Top Navigation & Title */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Link
                  to={`/otaku/detail/${id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors"
                >
                  <IoInformationCircleOutline size={14} />
                  <span>View Details</span>
                </Link>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-dark-purple/30 text-purple-300 border border-dark-purple/50 uppercase tracking-wider">
                  AniList #{id}
                </span>

                {anime.averageScore && (
                  <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                    <IoStar size={12} /> {(anime.averageScore / 10).toFixed(1)}
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white flex flex-wrap items-center gap-2">
                <span>{animeTitle}</span>
                {!isMovie && (
                  <span className="text-base sm:text-lg font-normal text-purple-300">
                    – Episode {currentEpisode}
                  </span>
                )}
              </h1>

              {anime.title.romaji && anime.title.romaji !== animeTitle && (
                <p className="text-xs text-light-gray/80 italic mt-0.5">
                  {anime.title.romaji}
                </p>
              )}
            </div>

            {/* Server & Sub/Dub Audio Controls Bar */}
            <div className="mb-4 p-3 rounded-2xl bg-black-2 border border-white/10 flex flex-wrap items-center justify-between gap-3 shadow-lg">
              {/* Server Selectors */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-light-gray font-semibold flex items-center gap-1 mr-1">
                  <FaServer size={11} className="text-purple-400" /> Server:
                </span>

                <button
                  onClick={() => setSelectedServer("animeembed")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                    selectedServer === "animeembed"
                      ? "bg-dark-purple text-white border-dark-purple shadow-[0_0_12px_rgba(179,0,255,0.4)]"
                      : "bg-white/5 hover:bg-white/10 text-light-gray border-white/10"
                  }`}
                >
                  Server 1 (AnimeEmbed)
                </button>

                <button
                  onClick={() => setSelectedServer("filmu")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                    selectedServer === "filmu"
                      ? "bg-dark-purple text-white border-dark-purple"
                      : "bg-white/5 hover:bg-white/10 text-light-gray border-white/10"
                  }`}
                >
                  Server 2 (FilmU)
                </button>
              </div>

              {/* Sub / Dub & Watch Party Buttons */}
              <div className="flex items-center gap-2 flex-wrap ml-auto">
                {/* Sub / Dub Toggle */}
                {selectedServer === "animeembed" && (
                  <div className="inline-flex rounded-xl bg-black border border-white/15 p-0.5">
                    <button
                      onClick={() => setAudioTrack("sub")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        audioTrack === "sub"
                          ? "bg-dark-purple text-white"
                          : "text-light-gray hover:text-white"
                      }`}
                    >
                      <IoLanguage size={12} />
                      <span>SUB (JP)</span>
                    </button>
                    <button
                      onClick={() => setAudioTrack("dub")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        audioTrack === "dub"
                          ? "bg-dark-purple text-white"
                          : "text-light-gray hover:text-white"
                      }`}
                    >
                      <IoVolumeHigh size={12} />
                      <span>DUB (EN)</span>
                    </button>
                  </div>
                )}

                {/* Watch Party Launch */}
                {!partySession ? (
                  <button
                    onClick={handleStartWatchParty}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-dark-purple to-[#8a00c2] hover:opacity-90 font-medium text-xs text-white flex items-center gap-1.5 border border-purple-400/30 shadow-[0_0_12px_rgba(179,0,255,0.3)] cursor-pointer"
                  >
                    <FaUsers size={13} />
                    <span>Watch Party</span>
                  </button>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-dark-purple/20 border border-dark-purple/50 text-[11px] text-purple-200">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span>Party: <strong className="font-mono text-white">{partyCode}</strong></span>
                  </div>
                )}
              </div>
            </div>

            {/* Video Player */}
            <div className="relative w-full h-0 pb-[56.25%] mb-6 rounded-2xl overflow-hidden bg-gray-900 border border-white/10 shadow-2xl">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                  <div className="w-12 h-12 border-4 border-t-transparent border-dark-purple rounded-full animate-spin" />
                </div>
              )}
              {src && (
                <iframe
                  key={src}
                  title="Otaku Anime Player"
                  src={src}
                  className="absolute inset-0 w-full h-full rounded-2xl"
                  allowFullScreen
                  allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                  referrerPolicy="no-referrer"
                  onLoad={() => setIsLoading(false)}
                />
              )}
            </div>

            {/* Linear Episode Grid (for Series) */}
            {!isMovie && totalEpisodeCount > 1 && (
              <div className="p-4 sm:p-5 rounded-2xl bg-black-2 border border-white/10 mb-8 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Select Episode
                    </h3>
                    <span className="text-xs text-light-gray font-normal">
                      ({totalEpisodeCount} Total)
                    </span>
                  </div>

                  {/* Range Selector for Long Anime (> 50 episodes) */}
                  {episodeRanges.length > 1 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      {episodeRanges.map((range, idx) => (
                        <button
                          key={range.label}
                          onClick={() => setEpisodeRangeIndex(idx)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                            episodeRangeIndex === idx
                              ? "bg-dark-purple text-white border-dark-purple"
                              : "bg-white/5 hover:bg-white/10 text-light-gray border-white/10"
                          }`}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Episode Buttons Grid */}
                <div className="grid grid-cols-5 xs:grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                  {Array.from(
                    { length: activeRange.end - activeRange.start + 1 },
                    (_, i) => activeRange.start + i
                  ).map((epNum) => {
                    const isSelected = epNum === currentEpisode;
                    return (
                      <button
                        key={epNum}
                        onClick={() => handleSelectEpisode(epNum)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center border ${
                          isSelected
                            ? "bg-dark-purple text-white border-dark-purple shadow-[0_0_10px_rgba(179,0,255,0.4)] scale-105"
                            : "bg-white/5 hover:bg-white/15 text-light-gray hover:text-white border-white/10"
                        }`}
                      >
                        <span className="text-[10px] font-normal text-purple-300">EP</span>
                        <span>{epNum}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Anime Synopsis & Genres */}
            <div className="p-4 sm:p-5 rounded-2xl bg-black-2 border border-white/10 space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Synopsis
              </h3>
              <p className="text-xs sm:text-sm text-light-gray leading-relaxed">
                {anime.description || "No synopsis available for this anime."}
              </p>

              {anime.genres && anime.genres.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-2">
                  <span className="text-xs text-light-gray">Genres:</span>
                  {anime.genres.map((g) => (
                    <span
                      key={g}
                      className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] text-purple-300 font-medium"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Watch Party Dock Column */}
          {partySession && (
            <div className="lg:col-span-4 xl:col-span-4 flex flex-col h-[580px] lg:h-[calc(100vh-140px)] sticky top-20">
              <WatchPartyDock
                session={partySession}
                currentContentTitle={animeTitle}
                onLeave={handleLeaveParty}
                onSyncWithHost={handleSyncWithHost}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OtakuStreaming;

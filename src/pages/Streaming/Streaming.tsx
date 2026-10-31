import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import tmdbApi, { TmdbMediaType } from '../../services/tmdbApi';
import { FaUsers, FaCrown } from 'react-icons/fa';
import { IoPeople, IoClose } from 'react-icons/io5';
import {
  WatchPartySession,
  generateRoomCode,
  PartySyncState,
} from '../../services/watchPartyService';
import { WatchPartyDock } from '../../components/WatchParty/WatchPartyDock';

interface Content {
  name?: string;
  title?: string;
  imdb_id?: string;
  number_of_seasons?: number;
  seasons?: Array<{
    season_number?: number;
    episode_count: number;
  }>;
}

const Streaming: React.FC = () => {
  const { type, id, season, episode } = useParams<{
    type: string;
    id: string;
    season?: string;
    episode?: string;
  }>();

  const [searchParams, setSearchParams] = useSearchParams();
  const partyCode = searchParams.get('party');
  const isHostParam = searchParams.get('host') === 'true';

  const [src, setSrc] = useState<string>('');
  const [content, setContent] = useState<Content | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedSeason, setSelectedSeason] = useState<string>(season || '1');
  const [selectedEpisode, setSelectedEpisode] = useState<string>(episode || '1');
  const [currentStreamServer, setCurrentStreamServer] = useState<number>(1);
  const [partySession, setPartySession] = useState<WatchPartySession | null>(null);

  // User name entry states
  const [activeUserName, setActiveUserName] = useState<string>(
    () => localStorage.getItem('moviebuddy_party_username') || ''
  );
  const [guestNameInput, setGuestNameInput] = useState<string>('');
  const [showHostNameModal, setShowHostNameModal] = useState<boolean>(false);
  const [hostNameInput, setHostNameInput] = useState<string>('');
  const [joinNameError, setJoinNameError] = useState<string>('');

  useEffect(() => {
    if (season) setSelectedSeason(season);
    if (episode) setSelectedEpisode(episode);
  }, [season, episode]);

  // Watch Party session initialization
  useEffect(() => {
    if (!partyCode || !activeUserName.trim()) {
      setPartySession(null);
      return;
    }

    const session = new WatchPartySession(
      partyCode,
      activeUserName.trim(),
      isHostParam
    );
    setPartySession(session);

    return () => {
      session.destroy();
    };
  }, [partyCode, isHostParam, activeUserName]);

  const fetchContent = useCallback(async () => {
    if (!id || (type !== 'movie' && type !== 'tv')) return;
    try {
      const { data } = await tmdbApi.getDetail<Content>(
        type as TmdbMediaType,
        parseInt(id)
      );
      setContent(data);
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        // Handle 404 errors if needed
      }
    }
  }, [type, id]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const getStreamSrc = useCallback(
    (serverNum: number, sNum: string, epNum: string) => {
      if (!id) return '';
      if (serverNum === 1) {
        // Stream 1: EmbedWave
        return type === 'movie'
          ? `https://embedwave.cc/embed/movie/${id}`
          : `https://embedwave.cc/embed/tv/${id}/${sNum}/${epNum}`;
      } else if (serverNum === 2) {
        // Stream 2: VidSrc v2 (High reliability for animation & shows)
        return type === 'movie'
          ? `https://vidsrc.cc/v2/embed/movie/${id}`
          : `https://vidsrc.cc/v2/embed/tv/${id}/${sNum}/${epNum}`;
      } else if (serverNum === 3) {
        // Stream 3: MultiEmbed
        return type === 'movie'
          ? `https://multiembed.mov/?video_id=${id}`
          : `https://multiembed.mov/?video_id=${id}&s=${sNum}&e=${epNum}`;
      } else {
        // Stream 4: VidSrc xyz
        return type === 'movie'
          ? `https://vidsrc.xyz/embed/movie/${id}`
          : `https://vidsrc.xyz/embed/tv/${id}/${sNum}/${epNum}`;
      }
    },
    [id, type]
  );

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setSrc(getStreamSrc(currentStreamServer, selectedSeason, selectedEpisode));
  }, [id, selectedSeason, selectedEpisode, currentStreamServer, getStreamSrc]);

  const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSeason = e.target.value;
    setSelectedSeason(newSeason);
    setSelectedEpisode('1');

    if (partySession && partySession.isHost) {
      partySession.syncStream({
        mediaType: 'tv',
        contentId: id!,
        contentTitle: content?.name || content?.title,
        season: newSeason,
        episode: '1',
        hostName: partySession.user.name,
        updatedAt: Date.now(),
      });
    }
  };

  const handleEpisodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newEpisode = e.target.value;
    setSelectedEpisode(newEpisode);

    if (partySession && partySession.isHost) {
      partySession.syncStream({
        mediaType: 'tv',
        contentId: id!,
        contentTitle: content?.name || content?.title,
        season: selectedSeason,
        episode: newEpisode,
        hostName: partySession.user.name,
        updatedAt: Date.now(),
      });
    }
  };

  const handleReloadStream = () => {
    if (!id) return;
    setIsLoading(true);
    setSrc('');
    setTimeout(() => {
      setSrc(getStreamSrc(currentStreamServer, selectedSeason, selectedEpisode));
    }, 50);
  };

  const handleStartWatchPartyClick = () => {
    const saved = localStorage.getItem('moviebuddy_party_username');
    if (saved && saved.trim()) {
      launchPartyAsHost(saved.trim());
    } else {
      setHostNameInput('');
      setShowHostNameModal(true);
    }
  };

  const launchPartyAsHost = (name: string) => {
    try {
      localStorage.setItem('moviebuddy_party_username', name);
    } catch {}
    setActiveUserName(name);
    setShowHostNameModal(false);

    const newRoom = generateRoomCode();
    const newParams = new URLSearchParams(searchParams);
    newParams.set('party', newRoom);
    newParams.set('host', 'true');
    setSearchParams(newParams);
  };

  const handleConfirmHostModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostNameInput.trim()) return;
    launchPartyAsHost(hostNameInput.trim());
  };

  const handleJoinPartySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = guestNameInput.trim();
    if (!trimmed) {
      setJoinNameError('Please enter your name to join');
      return;
    }
    setJoinNameError('');
    try {
      localStorage.setItem('moviebuddy_party_username', trimmed);
    } catch {}
    setActiveUserName(trimmed);
  };

  const handleLeaveParty = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('party');
    newParams.delete('host');
    setSearchParams(newParams);
  };

  const handleSyncWithHost = (sync: PartySyncState) => {
    if (sync.season) setSelectedSeason(sync.season);
    if (sync.episode) setSelectedEpisode(sync.episode);
  };

  useEffect(() => {
    if (content) {
      document.title = content.name || content.title || 'Streaming';
    }
    return () => {
      document.title = 'MovieBuddy';
    };
  }, [content]);

  if (!content) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-t-transparent border-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const isPartyActiveOrPending = Boolean(partyCode);

  return (
    <div className="p-4 sm:p-6 md:p-10 min-h-screen bg-black text-white">
      {/* Host Name Modal */}
      {showHostNameModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-black-2 border border-white/15 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative animate-fadeIn">
            <button
              onClick={() => setShowHostNameModal(false)}
              className="absolute top-4 right-4 text-light-gray hover:text-white cursor-pointer"
            >
              <IoClose size={20} />
            </button>
            <div className="w-10 h-10 rounded-xl bg-dark-purple/20 text-dark-purple flex items-center justify-center mb-3">
              <FaCrown size={20} />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Host Watch Party</h3>
            <p className="text-xs text-light-gray mb-4">
              Enter your name so your friends know who is hosting.
            </p>
            <form onSubmit={handleConfirmHostModal} className="space-y-3">
              <input
                type="text"
                value={hostNameInput}
                onChange={(e) => setHostNameInput(e.target.value)}
                placeholder="Enter your name (e.g. Alex)..."
                maxLength={24}
                autoFocus
                className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/20 text-sm text-white focus:outline-none focus:border-dark-purple"
              />
              <button
                type="submit"
                disabled={!hostNameInput.trim()}
                className="w-full py-2.5 rounded-xl bg-dark-purple hover:bg-deep-purple font-semibold text-sm text-white transition-colors cursor-pointer disabled:opacity-40"
              >
                Start Party
              </button>
            </form>
          </div>
        </div>
      )}

      <div
        className={`mt-16 sm:mt-20 mx-auto ${
          isPartyActiveOrPending ? 'max-w-[1600px]' : 'max-w-6xl'
        }`}
      >
        <div
          className={
            isPartyActiveOrPending ? 'grid grid-cols-1 lg:grid-cols-12 gap-6' : ''
          }
        >
          {/* Main Player Column */}
          <div
            className={
              isPartyActiveOrPending ? 'lg:col-span-8 xl:col-span-8' : ''
            }
          >
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-5 flex flex-wrap items-center gap-2">
              <span>{content.name || content.title}</span>
              {type === 'tv' && (
                <span className="text-base sm:text-lg font-normal text-purple-300">
                  {' '}– Season {selectedSeason}, Episode {selectedEpisode}
                </span>
              )}
            </h1>

            {/* Action Buttons: Multi-Stream Servers & Watch Party */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { num: 1, label: "Stream 1" },
                  { num: 2, label: "Stream 2 (VidSrc)" },
                  { num: 3, label: "Stream 3 (MultiEmbed)" },
                  { num: 4, label: "Stream 4" },
                ].map((srv) => (
                  <button
                    key={srv.num}
                    type="button"
                    onClick={() => setCurrentStreamServer(srv.num)}
                    className={`px-3.5 py-1.5 rounded-xl transition text-xs sm:text-sm font-semibold cursor-pointer border ${
                      currentStreamServer === srv.num
                        ? "bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-600/30"
                        : "bg-white/10 hover:bg-white/15 text-light-gray border-white/10"
                    }`}
                  >
                    {srv.label}
                  </button>
                ))}
              </div>

              {!partyCode ? (
                <button
                  type="button"
                  onClick={handleStartWatchPartyClick}
                  className="px-4 py-2 rounded transition text-sm sm:text-base bg-gradient-to-r from-dark-purple to-[#8a00c2] hover:opacity-90 font-medium flex items-center gap-2 border border-purple-400/30 shadow-[0_0_15px_rgba(179,0,255,0.3)] cursor-pointer"
                >
                  <FaUsers size={16} />
                  <span>Start Watch Party</span>
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-purple/20 border border-dark-purple/50 text-xs text-purple-200">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span>
                    Party Room: <strong className="font-mono text-white">{partyCode}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Video Player */}
            <div className="relative w-full h-0 pb-[56.25%] mb-6 rounded-lg overflow-hidden bg-gray-900 border border-white/10 shadow-2xl">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                  <div className="w-12 h-12 border-4 border-t-transparent border-gray-400 rounded-full animate-spin"></div>
                </div>
              )}
              {src && (
                <iframe
                  key={src}
                  title="Streaming Player"
                  src={src}
                  className="absolute inset-0 w-full h-full rounded"
                  allowFullScreen
                  allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                  referrerPolicy="no-referrer"
                  onLoad={() => setIsLoading(false)}
                />
              )}
            </div>

            {/* Season & Episode Selectors */}
            {type === 'tv' && content.number_of_seasons && (
              <div className="bg-gray-800 p-4 rounded-lg space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-medium">Season:</label>
                  <select
                    value={selectedSeason}
                    onChange={handleSeasonChange}
                    className="block w-full p-2 bg-gray-900 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
                  >
                    {[...Array(content.number_of_seasons).keys()].map((s) => (
                      <option key={s + 1} value={s + 1}>
                        Season {s + 1}
                      </option>
                    ))}
                  </select>
                </div>

                {content.seasons && (
                  <div>
                    <label className="block mb-1 text-sm font-medium">Episode:</label>
                    <select
                      value={selectedEpisode}
                      onChange={handleEpisodeChange}
                      className="block w-full p-2 bg-gray-900 border border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
                    >
                      {[
                        ...Array(
                          (
                            content.seasons.find(
                              (s) => s.season_number === parseInt(selectedSeason)
                            ) || content.seasons[parseInt(selectedSeason) - 1]
                          )?.episode_count || 0
                        ).keys(),
                      ].map((e) => (
                        <option key={e + 1} value={e + 1}>
                          Episode {e + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Watch Party Side Dock Column */}
          {partyCode && (
            <div className="lg:col-span-4 xl:col-span-4 flex flex-col h-[580px] lg:h-[calc(100vh-140px)] sticky top-20">
              {partySession ? (
                <WatchPartyDock
                  session={partySession}
                  currentContentTitle={content.name || content.title || 'Movie'}
                  onLeave={handleLeaveParty}
                  onSyncWithHost={handleSyncWithHost}
                />
              ) : (
                /* Prompt user to enter name before joining party session */
                <div className="flex flex-col items-center justify-center p-6 sm:p-8 bg-black-2 border border-white/10 rounded-2xl text-center h-full shadow-2xl">
                  <div className="w-14 h-14 rounded-2xl bg-dark-purple/20 text-dark-purple border border-dark-purple/40 flex items-center justify-center mb-4">
                    <IoPeople size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1.5">
                    Join Watch Party
                  </h3>
                  <p className="text-xs text-light-gray max-w-xs mb-5 leading-relaxed">
                    You have an invite to party <strong className="text-purple-300 font-mono">#{partyCode}</strong>. Enter your name to join the live chat and stay in sync.
                  </p>

                  <form onSubmit={handleJoinPartySubmit} className="w-full max-w-xs space-y-3.5">
                    <div>
                      <input
                        type="text"
                        value={guestNameInput}
                        onChange={(e) => {
                          setGuestNameInput(e.target.value);
                          if (joinNameError) setJoinNameError('');
                        }}
                        placeholder="Enter your name or nickname..."
                        maxLength={24}
                        autoFocus
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black border border-white/20 text-xs sm:text-sm text-white placeholder-light-gray/50 focus:outline-none focus:border-dark-purple transition-colors"
                      />
                      {joinNameError && (
                        <p className="text-[11px] text-red-400 mt-1 text-left">
                          {joinNameError}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 rounded-xl bg-dark-purple hover:bg-deep-purple font-semibold text-xs sm:text-sm text-white transition-colors cursor-pointer shadow-lg shadow-dark-purple/30"
                    >
                      Enter Watch Party
                    </button>

                    <button
                      type="button"
                      onClick={handleLeaveParty}
                      className="text-xs text-light-gray hover:text-white transition-colors cursor-pointer block mx-auto underline pt-1"
                    >
                      Watch Solo Instead
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Streaming;

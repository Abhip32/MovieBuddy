import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import tmdbApi, { TmdbMediaType } from '../../services/tmdbApi';

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
  const { type, id, season, episode } = useParams<{ type: string; id: string; season?: string; episode?: string }>();
  
  const [src, setSrc] = useState<string>('');
  const [content, setContent] = useState<Content | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedSeason, setSelectedSeason] = useState<string>(season || '1');
  const [selectedEpisode, setSelectedEpisode] = useState<string>(episode || '1');

  useEffect(() => {
    if (season) setSelectedSeason(season);
    if (episode) setSelectedEpisode(episode);
  }, [season, episode]);

  const fetchContent = useCallback(async () => {
    if (!id || (type !== 'movie' && type !== 'tv')) return;
    try {
      const { data } = await tmdbApi.getDetail<Content>(type as TmdbMediaType, parseInt(id));
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

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    if (type === 'movie') {
      setSrc(`https://embedwave.cc/embed/movie/${id}`);
    } else {
      setSrc(`https://embedwave.cc/embed/tv/${id}/${selectedSeason}/${selectedEpisode}`);
    }
  }, [type, id, selectedSeason, selectedEpisode]);

  const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSeason(e.target.value);
    setSelectedEpisode('1');
  };

  const handleEpisodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEpisode(e.target.value);
  };

  const handleReloadStream = () => {
    if (!id) return;
    setIsLoading(true);
    setSrc('');
    setTimeout(() => {
      if (type === 'movie') {
        setSrc(`https://embedwave.cc/embed/movie/${id}`);
      } else {
        setSrc(`https://embedwave.cc/embed/tv/${id}/${selectedSeason}/${selectedEpisode}`);
      }
    }, 50);
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

  return (
    <div className="p-4 sm:p-6 md:p-10 min-h-screen bg-black text-white">
      <div className="mt-16 sm:mt-20 max-w-6xl mx-auto">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-5">
          {content.name || content.title}
          {type === 'tv' && (
            <span className="block sm:inline text-base sm:text-lg font-normal text-purple-300">
              {' '}– Season {selectedSeason}, Episode {selectedEpisode}
            </span>
          )}
        </h1>

        {/* Stream Buttons */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={handleReloadStream}
            className="w-full sm:w-auto px-4 py-2 rounded transition text-sm sm:text-base bg-purple-600 hover:bg-purple-700 font-medium"
          >
            Stream 1
          </button>
        </div>

        {/* Video Player */}
        <div className="relative w-full h-0 pb-[56.25%] mb-6 rounded-lg overflow-hidden bg-gray-900">
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
                        content.seasons.find((s) => s.season_number === parseInt(selectedSeason)) ||
                        content.seasons[parseInt(selectedSeason) - 1]
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
    </div>
  );
};

export default Streaming;

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import tmdbApi from '../../services/tmdbApi';

interface Content {
  name?: string;
  title?: string;
  imdb_id?: string;
  number_of_seasons?: number;
  seasons?: Array<{
    episode_count: number;
  }>;
}

const Streaming: React.FC = () => {
  const { type, id, season, episode } = useParams<{ type: any; id: any; season?: string; episode?: string }>();
  
  const [src, setSrc] = useState<string>('');
  const [content, setContent] = useState<Content | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedSeason, setSelectedSeason] = useState<string>(season || '1');
  const [selectedEpisode, setSelectedEpisode] = useState<string>(episode || '1');
  const [currentScreen, setCurrentScreen] = useState<number>(1);

  const fetchContent = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await tmdbApi.getDetail<Content>(type, parseInt(id));
      if (type === 'tv') {
        const externalIds = await tmdbApi.getExternalIds('tv', parseInt(id));
        (data as any).externalIds = externalIds.data;
      }
      setContent(data);

      const imdbId = type === 'movie' ? data?.imdb_id : (data as any).externalIds.imdb_id;
      if (currentScreen === 1) {
        setSrc(type === 'movie' ? 
          `https://vidsrc.cc/v2/embed/movie/${imdbId}` :
          `https://vidsrc.cc/v2/embed/tv/${imdbId}/${selectedSeason}/${selectedEpisode}`
        );
      }
      else if (currentScreen === 2) {
        setSrc(type === 'movie' ? 
           `https://vidsrc.xyz/embed/movie/${imdbId}` :
          `https://vidsrc.xyz/embed/tv/${imdbId}/${selectedSeason}/${selectedEpisode}`
        );
      }
      else if (currentScreen === 3) {
        setSrc(type === 'movie' ? 
          `https://multiembed.mov/?video_id=${imdbId}` :
          `https://multiembed.mov/?video_id=${imdbId}&s=${selectedSeason}&e=${selectedEpisode}`
        );
      }

      setIsLoading(false);
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        // Handle 404 errors if needed
      }
    }
  }, [type, id, selectedSeason, selectedEpisode, currentScreen]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => setSelectedSeason(e.target.value);
  const handleEpisodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => setSelectedEpisode(e.target.value);
  const switchToStream1 = () => setCurrentScreen(1);
  const switchToStream2 = () => setCurrentScreen(2);
  const switchToStream3 = () => setCurrentScreen(3);
  useEffect(() => {
    if (content) {
      document.title = content.name || content.title || 'Streaming';
    }
    return () => {
      document.title = "MovieBuddy";
    }
  }, [content]);

return (
  <div className="p-4 sm:p-6 md:p-10 min-h-screen bg-black text-white">
    {content && (
      <div className="mt-16 sm:mt-20 max-w-6xl mx-auto">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-5">
          {content.name || content.title}
          {type === 'tv' && (
            <span className="block sm:inline text-base sm:text-lg font-normal text-purple-300">
              {' '}– Season {selectedSeason}, Episode {selectedEpisode}
            </span>
          )}
        </h1>

        {/* Stream Switch Buttons */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
          {[1, 2, 3].map((num) => (
            <button
              key={num}
              onClick={() => setCurrentScreen(num)}
              className={`w-full sm:w-auto px-4 py-2 rounded transition text-sm sm:text-base ${
                currentScreen === num ? 'bg-purple-600' : 'bg-gray-700'
              } hover:bg-purple-700`}
            >
              Stream {num}
            </button>
          ))}
        </div>

        {/* Video Player */}
        <div className="relative w-full h-0 pb-[56.25%] mb-6 rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="w-12 h-12 border-4 border-t-transparent border-gray-400 rounded-full animate-spin"></div>
            </div>
          ) : (
            <iframe
              title="Streaming Player"
              src={src}
              className="absolute inset-0 w-full h-full rounded"
              allowFullScreen
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
                  {[...Array(content.seasons[parseInt(selectedSeason) - 1]?.episode_count || 0).keys()].map((e) => (
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
    )}
  </div>
);

};

export default Streaming;

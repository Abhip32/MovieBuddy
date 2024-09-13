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
    <div className="p-6 sm:p-10 min-h-screen bg-black text-white">
      {content && (
        <div className="my-20">
          <h1 className="text-2xl sm:text-3xl mt-2 sm:mt-5 mb-5">
            {content.name || content.title} 
            {type === 'tv' && ` - Season ${selectedSeason}, Episode ${selectedEpisode}`}
          </h1>
          <div className="mb-4 flex gap-2">
            <button
              onClick={switchToStream1}
              className={`px-4 py-2 rounded transition ${currentScreen === 1 ? 'bg-purple-600' : 'bg-gray-700'} hover:bg-purple-700`}
            >
              Stream 1
            </button>
            <button
              onClick={switchToStream2}
              className={`px-4 py-2 rounded transition ${currentScreen === 2 ? 'bg-purple-600' : 'bg-gray-700'} hover:bg-purple-700`}
            >
              Stream 2
            </button>
            <button
              onClick={switchToStream3}
              className={`px-4 py-2 rounded transition ${currentScreen === 3 ? 'bg-purple-600' : 'bg-gray-700'} hover:bg-purple-700`}
            >
              Stream 3
            </button>
          </div>
          <div className="relative w-full h-0 pb-[56.25%]">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-t-4 border-gray-400 border-solid rounded-full animate-spin"></div>
              </div>
            ) : (
              <iframe
                title="screen"
                src={src}
                className="absolute inset-0 w-full h-full"
                allowFullScreen
                onLoad={() => setIsLoading(false)}
              />
            )}
          </div>
          {type === 'tv' && content.number_of_seasons && (
            <div className="bg-gray-800 p-4 mt-4 rounded">
              <label className="block mb-2">Season:</label>
              <select
                value={selectedSeason}
                onChange={handleSeasonChange}
                className="block w-full p-2 mb-4 bg-gray-900 border border-gray-700 rounded"
              >
                {[...Array(content.number_of_seasons).keys()].map(season => (
                  <option key={season + 1} value={season + 1}>
                    Season {season + 1}
                  </option>
                ))}
              </select>
              {content.seasons && (
                <>
                  <label className="block mb-2">Episode:</label>
                  <select
                    value={selectedEpisode}
                    onChange={handleEpisodeChange}
                    className="block w-full p-2 bg-gray-900 border border-gray-700 rounded"
                  >
                    {[...Array(content.seasons[parseInt(selectedSeason) - 1]?.episode_count || 0).keys()].map(episode => (
                      <option key={episode + 1} value={episode + 1}>
                        Episode {episode + 1}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Streaming;

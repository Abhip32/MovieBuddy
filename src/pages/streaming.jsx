import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AspectRatio, Box, Select, Text, Button, Spinner, Center } from '@chakra-ui/react';
import axios from 'axios';

const Streaming = () => {
  const { type, id, season, episode } = useParams();
  const [src, setSrc] = useState('');
  const [content, setContent] = useState({});
  const [isLoading, setIsLoading] = useState(true); // Initialize as true
  const [selectedSeason, setSelectedSeason] = useState(season || '1');
  const [selectedEpisode, setSelectedEpisode] = useState(episode || '1');
  const [currentScreen, setCurrentScreen] = useState(1); // Track current screen

  const fetchContent = async () => {
    setIsLoading(true); // Set to true when fetching content
    try {
      const { data } = await axios.get(`
        https://api.themoviedb.org/3/${type}/${id}?api_key=${process.env.REACT_APP_API_KEY}&page=1
      `);

      if (type === 'tv') {
        const externalIds = await fetchExternalIdsForTVSeries(id);
        data.externalIds = externalIds;
      }

      setContent(data);

      // Set src based on current screen
      if (currentScreen === 1) {
        if (type === 'movie' && data) {
          setSrc(`https://vidsrc.to/embed/movie/${data?.imdb_id}`);
        } else if (type === 'tv' && data) {
          setSrc(`https://vidsrc.to/embed/tv/${data?.externalIds.imdb_id}/${selectedSeason}/${selectedEpisode}`);
        }
      } else if (currentScreen === 2) {
        if (type === 'movie' && data) {
          setSrc(`https://multiembed.mov/?video_id=${data?.imdb_id}`);
        } else if (type === 'tv' && data) {
          setSrc(`https://multiembed.mov/?video_id=${data?.externalIds.imdb_id}&s=${selectedSeason}&e=${selectedEpisode}`);
        }
      }

      setIsLoading(false); // Set to false after setting content and source
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Handle 404 errors if needed
      }
    }
  };

  const fetchExternalIdsForTVSeries = async (seriesId) => {
    try {
      const { data } = await axios.get(`
        https://api.themoviedb.org/3/tv/${seriesId}/external_ids?api_key=${process.env.REACT_APP_API_KEY}`
      );
      return data;
    } catch (error) {
      console.error('Error fetching external IDs for TV series:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchContent();
  }, [type, id, selectedSeason, selectedEpisode, currentScreen]); // Add currentScreen to dependencies

  const handleSeasonChange = (e) => {
    setSelectedSeason(e.target.value);
  };

  const handleEpisodeChange = (e) => {
    setSelectedEpisode(e.target.value);
  };

  // Function to switch to Stream 1
  const switchToStream1 = () => {
    setCurrentScreen(1);
  };

  // Function to switch to Stream 2
  const switchToStream2 = () => {
    setCurrentScreen(2);
  };

  const handleIframeLoad = () => {
    setIsLoading(false); // Set to false when iframe loads
  };

  if (content) {
    document.title = content?.name || content?.title;
  }

  return (
    <Box padding={'10vw'} minH={'100vh'} bg={'black'}>
      {content && (
        <Box mb={4}>
          <Text fontSize={{ base: 'md', md: 'xl' }} color={'white'} mt={5} mb={5}>
            {content?.name || content?.title} {type === 'tv' && (`Season ${selectedSeason} Episode ${selectedEpisode}`)}
          </Text>
          <Box mb={4} display="flex" gap={'2'} justifyContent="flex-start">
            <Button  onClick={switchToStream1} colorScheme={currentScreen === 1 ? 'purple' : 'gray'}>
              Stream 1
            </Button>
            <Button onClick={switchToStream2} colorScheme={currentScreen === 2 ? 'purple' : 'gray'}>
              Stream 2
            </Button>
          </Box>
          <AspectRatio maxW='100vw' ratio={16 / 9}>
            {isLoading ? (
              <Center>
                <Spinner size="xl" color="white" />
              </Center>
            ) : (
              <iframe
                title='screen'
                src={src}
                allowFullScreen
                onLoad={handleIframeLoad}
              />
            )}
          </AspectRatio>

          {type === 'tv' && content.number_of_seasons && (
            <Box bg='white' padding={'20px'} mt={4}>
              <Text>Season:</Text>
              <Select value={selectedSeason} onChange={handleSeasonChange}>
                {[...Array(content.number_of_seasons).keys()].map((season) => (
                  <option key={season + 1} value={season + 1}>
                    Season {season + 1}
                  </option>
                ))}
              </Select>
              {content.seasons && (
                <>
                  <Text>Episode:</Text>
                  <Select value={selectedEpisode} onChange={handleEpisodeChange}>
                    {[...Array(content.seasons[selectedSeason - 1].episode_count).keys()].map((episode) => (
                      <option key={episode + 1} value={episode + 1}>
                        Episode {episode + 1}
                      </option>
                    ))}
                  </Select>
                </>
              )}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Streaming;

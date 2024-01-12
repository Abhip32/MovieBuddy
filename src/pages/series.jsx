import { Box, Tabs, Tab, TabList, TabPanel, TabPanels, HStack, Button,SimpleGrid } from '@chakra-ui/react';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import useGenre from '../utils/useGenere';
import Slider from 'react-slick';
import SingleData from '../Components/Common/Card';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Pagination from '../Components/Pagination/pagination';
import SearchBox from '../Components/SearchBox/SearchBox';

const Series = () => {
  const [treadingContent, setTreadingContent] = useState([]);
  const [page, setPage] = useState(1);
  const [numOfPages, setNumOfPages] = useState();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [filterGenre, setFilterGenre] = useState([]);
  const [genreTitle, setGenreTitle] = useState();
  const [getGener, setGetGenre] = useState([]);
  const [color, setColor] = useState('grey');
  const genreforURL = useGenre(filterGenre);
  const [selectedGenre, setSelectedGenre] = useState(10759);

  const fetchMovieApi = async (genreId) => {
    try {
      const { data } = await axios.get(
        `https://api.themoviedb.org/3/discover/tv?api_key=${process.env.REACT_APP_API_KEY}&page=${page}&language=en-US&sort_by=popularity.desc&with_genres=${genreId}`
      );
      setTreadingContent(data.results);
      setNumOfPages(100);
      setIsLoading(true);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchGenres = async () => {
    try {
      const { data } = await axios.get(
        `https://api.themoviedb.org/3/genre/tv/list?api_key=${process.env.REACT_APP_API_KEY}&language=en-US`
      );
      // eslint-disable-next-line
      setGetGenre(data.genres);
      console.log(data.genres);
    } catch (e) {
      console.log(e);
    }
  };

  const fetchSearchApi = async () => {
    if (searchTerm) {
      const SEARCH_API = `https://api.themoviedb.org/3/search/tv?api_key=${process.env.REACT_APP_API_KEY}&query=${searchTerm}&page=${page}&sort_by=popularity.desc&page=1`;
      const { data } = await axios.get(SEARCH_API);
      setTreadingContent(data.results);
      setNumOfPages(data.total_pages);
      setIsLoading(true);
    }
  };

  const handleTabClick = (genreId) => {
    setSelectedGenre(genreId);
    setPage(1); // Reset page to 1 when a new genre is selected
    if (searchTerm) {
      fetchSearchApi();
    } else {
      fetchMovieApi(genreId);
    }
  };

  useEffect(() => {
    window.scroll(0, 0);
    fetchMovieApi(selectedGenre)
    fetchGenres();
    return () => {
      setTreadingContent([]);
    };
    // eslint-disable-next-line
  }, []);

  return (
    <Box minH={'100vh'} bgGradient={'linear(to-b,#451488,#16072b)'}>
      <Box bgColor={'#451488'} paddingLeft={'10px'} paddingRight={'10px'} pt={'100px'}>
      <SearchBox placeholder='search series..' searchTerm={searchTerm} setSearchTerm={setSearchTerm} fetchSearchApi={fetchSearchApi}/>
        <HStack
          color={' #D3D3D3'}
          width={'95vw'}
          padding={'5vw'}
          overflowX={'scroll'}
          overflowY={'hidden'}
          border={'none'}
          sx={{
            '::-webkit-scrollbar': { width: '0.5em' },
            '::-webkit-scrollbar-thumb': { backgroundColor: 'transparent' },
          }}
        >
          {getGener.map((genre) => (
            <Box
              fontWeight={'bolder'}
              margin={'2px'}
              minW={'150px'}
              textAlign={'center'}
              key={genre.id}
              onClick={() => handleTabClick(genre.id)}
              style={genre.id === selectedGenre ? { color: 'white', paddingBottom:'5px', fontWeight:'bolder',fontSize:'20px', background:'linear-gradient(to top,violet 1%,transparent,transparent,transparent)'} : { color: '#D3D3D3' }}>
              {genre.name}
            </Box>
          ))}
          </HStack>
          <Box>
          <SimpleGrid columns={[1, 2, 3, 4]} spacing={4} mt={8}>
        {/* Use SimpleGrid to create a responsive grid */}
        {treadingContent &&
          treadingContent.map((n) => (
            <SingleData key={n.id} {...n} mediaType="tv" />
          ))}
      </SimpleGrid>
          </Box>
      </Box>
      <Pagination page={page} numOfPages={numOfPages} setPage={setPage} fetchMovieApi={fetchMovieApi} selectedGenre={selectedGenre} setTreadingContent={setTreadingContent}/>
    </Box>
  );
};

export default Series;

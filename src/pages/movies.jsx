import React, { useState, useEffect } from 'react';
import { Box, HStack, SimpleGrid } from '@chakra-ui/react';
import axios from 'axios';
import SingleData from '../Components/Common/Card';
import Pagination from '../Components/Pagination/pagination';
import SearchBox from '../Components/SearchBox/SearchBox';

const Movies = () => {
  const [treadingContent, setTreadingContent] = useState([]);
  const [page, setPage] = useState(1);
  const [numOfPages, setNumOfPages] = useState();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [getGener, setGetGenre] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(28);

  const fetchMovieApi = async (genreId, page) => {
    try {
      const { data } = await axios.get(
        `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.REACT_APP_API_KEY}&page=${page}&language=en-US&sort_by=popularity.desc&with_genres=${genreId}`
      );
      setTreadingContent(data.results);
      setNumOfPages(data.total_pages);
      setIsLoading(true);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchGenres = async () => {
    try {
      const { data } = await axios.get(
        `https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.REACT_APP_API_KEY}&language=en-US`
      );
      setGetGenre(data.genres);
    } catch (e) {
      console.log(e);
    }
  };

  const fetchSearchApi = async (searchTerm,page) => {
    if (searchTerm) {
      const SEARCH_API = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.REACT_APP_API_KEY}&query=${searchTerm}&page=${page}&sort_by=popularity.desc&page=1`;
      const { data } = await axios.get(SEARCH_API);
      setTreadingContent(data.results);
      setNumOfPages(data.total_pages);
      setIsLoading(true);
    }
  };

  const handleTabClick = (genreId) => {
    setSelectedGenre(genreId);
    setPage(1);

    if (searchTerm) {
      fetchSearchApi();
    } else {
      fetchMovieApi(genreId, page);
    }
  };

  useEffect(() => {
    window.scroll(0, 0);
    fetchMovieApi(selectedGenre, page);
    fetchGenres();
    return () => {
      setTreadingContent([]);
    };
    // eslint-disable-next-line
  }, [selectedGenre, page]);

  return (
    <Box minH={'100vh'} bgGradient={'linear(to-b,#451488,#16072b)'}>
      <Box bgColor={'#451488'} pt={'100px'} pb={'100px'}>
        <SearchBox placeholder='search movies..' searchTerm={searchTerm} setSearchTerm={setSearchTerm} fetchSearchApi={fetchSearchApi}/>

        <HStack
          color={' #D3D3D3'}
          width={'95vw'}
          padding={'3vw'}
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
            cursor={'pointer'}
              fontWeight={'bolder'}
              margin={'2px'}
              minW={'130px'}
              textAlign={'center'}
              key={genre.id}
              onClick={() => handleTabClick(genre.id)}
              style={
                genre.id === selectedGenre
                  ? {
                      color: 'white',
                      paddingBottom: '5px',
                      fontWeight: 'bolder',
                      fontSize: '20px',
                      borderRadius:'100px',
                      background:
                        'linear-gradient(to top,violet 1%,transparent,transparent,transparent)',
                    }
                  : { color: '#D3D3D3' }
              }
            >
              {genre.name}
            </Box>
          ))}
        </HStack>
        
        <SimpleGrid columns={[2, 2, 3, 4]} spacing={4} mt={8} paddingLeft={'5vw'} paddingRight={'5vw'}>
          {treadingContent &&
            treadingContent.map((n) => (
              <SingleData key={n.id} {...n} mediaType="movie" />
            ))}
        </SimpleGrid>
      </Box>
      <Pagination
        page={page}
        setPage={setPage}
        numOfPages={numOfPages}
        fetchMovieApi={fetchMovieApi}
        fetchSearchApi={fetchSearchApi}
        searchTerm={searchTerm}
        selectedGenre={selectedGenre}
        setTreadingContent={setTreadingContent}
      />
    </Box>
  );
};

export default Movies;

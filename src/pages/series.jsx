import React, { useState, useEffect } from 'react';
import { Box, SimpleGrid } from '@chakra-ui/react';
import axios from 'axios';
import SingleData from '../Components/Common/Card';
import Pagination from '../Components/Pagination/pagination';
import SearchBox from '../Components/SearchBox/SearchBox';
import Genres from '../Components/Common/Genres';
import SkeletonGrid from '../Components/Common/NoDataGrid';

const Series = () => {
  const [treadingContent, setTreadingContent] = useState([]);
  const [page, setPage] = useState(1);
  const [numOfPages, setNumOfPages] = useState();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [getGener, setGetGenre] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(10759);

  const fetchMovieApi = async (genreId, page) => {
    try {
      const { data } = await axios.get(
        `https://api.themoviedb.org/3/discover/tv?api_key=${process.env.REACT_APP_API_KEY}&page=${page}&language=en-US&sort_by=popularity.desc&with_genres=${genreId}`
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
        `https://api.themoviedb.org/3/genre/tv/list?api_key=${process.env.REACT_APP_API_KEY}&language=en-US`
      );
      setGetGenre(data.genres);
    } catch (e) {
      console.log(e);
    }
  };

  const fetchSearchApi = async (searchTerm,page) => {
    if (searchTerm) {
      const SEARCH_API = `https://api.themoviedb.org/3/search/tv?api_key=${process.env.REACT_APP_API_KEY}&query=${searchTerm}&sort_by=popularity.desc&page=${page}`;
      const { data } = await axios.get(SEARCH_API);
      setTreadingContent(data.results);
      setNumOfPages(data.total_pages);
      setIsLoading(true);
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
        <SearchBox placeholder='search series..' searchTerm={searchTerm} setSearchTerm={setSearchTerm} fetchSearchApi={fetchSearchApi}/>
        <Genres genre={getGener} setSelectedGenre={setSelectedGenre} setPage={setPage} fetchSearchApi={fetchSearchApi} fetchMovieApi={fetchMovieApi} searchTerm={searchTerm} page={page} selectedGenre={selectedGenre}/>
        <SimpleGrid columns={[2, 2, 3, 5]} spacing={4} mt={8} paddingLeft={'5vw'} paddingRight={'5vw'}>
          {treadingContent &&
            treadingContent.map((n) => (
              <SingleData key={n.id} {...n} mediaType="tv" />
            ))}

        </SimpleGrid>

        {treadingContent.length == 0 &&
            <SkeletonGrid/>}
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

export default Series;

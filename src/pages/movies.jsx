import React, { useState, useEffect, useMemo } from 'react';
import { Box, SimpleGrid } from '@chakra-ui/react';
import axios from 'axios';
import SingleData from '../Components/Common/Card';
import Pagination from '../Components/Pagination/pagination';
import SearchBox from '../Components/SearchBox/SearchBox';
import SkeletonGrid from '../Components/Common/NoDataGrid';
import Genres from '../Components/Common/Genres';

const Movies = () => {
  const [treadingContent, setTreadingContent] = useState([]);
  const [page, setPage] = useState(1);
  const [numOfPages, setNumOfPages] = useState();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(28);

  const fetchMovieApi = async (genreId, page) => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(
        `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.REACT_APP_API_KEY}&page=${page}&language=en-US&sort_by=popularity.desc&with_genres=${genreId}`
      );
      setTreadingContent(data.results);
      setNumOfPages(data.total_pages);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGenres = async () => {
    try {
      const { data } = await axios.get(
        `https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.REACT_APP_API_KEY}&language=en-US`
      );
      setGenres(data.genres);
    } catch (e) {
      console.log(e);
    }
  };

  const fetchSearchApi = async (searchTerm, page) => {
    setIsLoading(true);
    try {
      if (searchTerm) {
        const SEARCH_API = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.REACT_APP_API_KEY}&query=${searchTerm}&sort_by=popularity.desc&page=${page}`;
        const { data } = await axios.get(SEARCH_API);
        setTreadingContent(data.results);
        setNumOfPages(data.total_pages);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    window.scroll(0, 0);
    if (!searchTerm) {
      fetchMovieApi(selectedGenre, page);
    }
    fetchGenres();
    return () => {
      setTreadingContent([]);
    };
    // eslint-disable-next-line
  }, [selectedGenre, page]);

  const memoizedGenres = useMemo(() => {
    return genres;
  }, [genres]);

  const memoizedTreadingContent = useMemo(() => {
    return treadingContent;
  }, [treadingContent]);

  return (
    <Box minH={'100vh'} bgGradient={'linear(to-b,#451488,#16072b)'}>
      <Box bgColor={'#451488'} pt={'100px'} pb={'100px'}>
        <SearchBox
          placeholder="search movies.."
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          fetchSearchApi={fetchSearchApi}
        />

        {!searchTerm && (
          <Genres
            genre={memoizedGenres}
            setSelectedGenre={setSelectedGenre}
            setPage={setPage}
            fetchSearchApi={fetchSearchApi}
            fetchMovieApi={fetchMovieApi}
            searchTerm={searchTerm}
            page={page}
            selectedGenre={selectedGenre}
          />
        )}

        {isLoading ? (
          <SkeletonGrid />
        ) : (
          <SimpleGrid columns={[2, 2, 3, 5]} spacing={4} mt={8} paddingLeft={'5vw'} paddingRight={'5vw'}>
            {memoizedTreadingContent.map((n) => (
              <SingleData key={n.id} {...n} mediaType="movie" />
            ))}
          </SimpleGrid>
        )}
      </Box>
      {!isLoading && (
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
      )}
    </Box>
  );
};

export default Movies;

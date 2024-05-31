import React, { useState, useEffect } from 'react';
import { Box, Text, Skeleton,Spinner } from '@chakra-ui/react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Carousel from '../Components/Home/Carousel';
import SingleData from '../Components/Common/Card';
import axios from 'axios';

const Home = () => {
  const [allContent, setAllContent] = useState([]);
  const [popularSeries, setPopularSeries] = useState([]);
  const [TopRatedMovies, setTopRatedMovies] = useState([]);
  const [TopRatedSeries, setTopRatedSeries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPopularMovieApi = async () => {
    try {
      const { data } = await axios.get(`https://api.themoviedb.org/3/movie/now_playing?api_key=${process.env.REACT_APP_API_KEY}&page=1`);
      const alldata = data.results;
      const filter = alldata.slice(0, 7);
      setAllContent(filter);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPopularSeriesApi = async () => {
    try {
      const { data } = await axios.get(`https://api.themoviedb.org/3/tv/on_the_air?api_key=${process.env.REACT_APP_API_KEY}&page=1`);
      const alldata = data.results;
      const filter = alldata.slice(0, 7);
      setPopularSeries(filter);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTopRatedMoviesApi = async () => {
    try {
      const { data } = await axios.get(`https://api.themoviedb.org/3/movie/top_rated?api_key=${process.env.REACT_APP_API_KEY}&page=1`);
      const alldata = data.results;
      setTopRatedMovies(alldata);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTopRatedSeriesApi = async () => {
    try {
      const { data } = await axios.get(`https://api.themoviedb.org/3/tv/top_rated?api_key=${process.env.REACT_APP_API_KEY}&page=1`);
      const alldata = data.results;
      setTopRatedSeries(alldata);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    window.scroll(0, 0);
    Promise.all([
      fetchPopularMovieApi(),
      fetchPopularSeriesApi(),
      fetchTopRatedMoviesApi(),
      fetchTopRatedSeriesApi()
    ]).then(() => {
      setIsLoading(false);
    }).catch((error) => {
      console.error(error);
    });
    return () => {
      setPopularSeries([]);
      setAllContent([]);
    };
  }, []);

  const carouselSettings = {
    slidesToShow: 6,
    slidesToScroll: 1,
    infinite: true,
    arrows: true,
    speed: 500,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
    ],
  };

  return (
    <Box minH="100vh" bgGradient='linear(to-5,  #451488,#16072b 70%,)' color="white">
      <Carousel />
      <Box marginTop={'-20px'} paddingLeft={'5vw'} paddingRight={'5vw'} bgGradient='linear(to-b,  #451488 70%,#16072b ,)' paddingBottom={'20px'}>
        <Box paddingTop={'50px'}>
          <Text fontSize={{ base: 'md', md: '2xl' }} fontWeight="bolder">Movies On Air</Text>
          <br />
          {isLoading ? (
            <Slider {...carouselSettings}>
              {Array.from({ length: 7 }).map((_, index) => (
                <Skeleton key={index} height="300px" margin="0px 5px" />
              ))}
            </Slider>
          ) : (
            <Slider {...carouselSettings}>
              {allContent.map((n) => (
                <SingleData key={n.id} {...n} mediaType="movie" />
              ))}
            </Slider>
          )}
        </Box>
        <Box paddingTop={'50px'}>
          <Text fontSize={{ base: 'md', md: '2xl' }} fontWeight="bolder">TV Series On Air</Text>
          <br />
          {isLoading ? (
            <Slider {...carouselSettings}>
            {Array.from({ length: 7 }).map((_, index) => (
              <Skeleton key={index} height="300px" margin="0px 5px" />
            ))}
          </Slider>
          ) : (
            <Slider {...carouselSettings}>
              {popularSeries.map((n) => (
                <SingleData key={n.id} {...n} mediaType="tv" />
              ))}
            </Slider>
          )}
        </Box>
        <Box paddingTop={'50px'}>
          <Text fontSize={{ base: 'md', md: '2xl' }} fontWeight="bolder">Top Rated Movies</Text>
          <br />
          {isLoading ? (
            <Slider {...carouselSettings}>
            {Array.from({ length: 7 }).map((_, index) => (
              <Skeleton key={index} height="300px" margin="0px 5px" />
            ))}
          </Slider>
          ) : (
            <Slider {...carouselSettings}>
              {TopRatedMovies.map((n) => (
                <SingleData key={n.id} {...n} mediaType="movie" />
              ))}
            </Slider>
          )}
        </Box>
        <Box paddingTop={'50px'}>
          <Text fontSize={{ base: 'md', md: '2xl' }} fontWeight="bolder">Top Rated TV Series</Text>
          <br />
          {isLoading ? (
            <Slider {...carouselSettings}>
            {Array.from({ length: 7 }).map((_, index) => (
              <Skeleton key={index} height="300px" margin="0px 5px" />
            ))}
          </Slider>
          ) : (
            <Slider {...carouselSettings}>
              {TopRatedSeries.map((n) => (
                <SingleData key={n.id} {...n} mediaType="tv" />
              ))}
            </Slider>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Home;

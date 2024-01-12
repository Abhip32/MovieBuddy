import React, { useState, useEffect } from 'react';
import { Box, Text, Flex, Skeleton, SkeletonCircle, SkeletonText } from '@chakra-ui/react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import axios from 'axios';
import { AiFillPlayCircle, AiFillPlusCircle } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';

const Carousel = () => {
  const [content, setAllContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const settings = {
    dots: false,
    arrows: false,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 3000,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  const fetchPopularMovieApi = async () => {
    try {
      const { data } = await axios.get(
        `https://api.themoviedb.org/3/trending/all/day?api_key=${process.env.REACT_APP_API_KEY}`
      );
      const alldata = data.results;
      const filter = alldata.slice(0, 10);
      const red = filter.reverse();

      setAllContent(red);
      console.log(red);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPopularMovieApi();
  }, []);

  const placeholder = (
    <Box width={'100vw'} height={'100vh'} backgroundColor="gray.200">
        <Skeleton height='100%'/>
    </Box>
  );

  const items = content.map((item, index) => (
    <Box
      key={index}
      position="relative"
      width={'100vw'}
      height={'100vh'}
      backgroundImage={`url('https://www.themoviedb.org/t/p/w1920_and_h800_multi_faces/${item.backdrop_path}')`}
      backgroundSize={'cover'}
      backgroundPosition={'center'}
    >
      <Box
        position={'absolute'}
        maxH={'40%'}
        w={'100%'}
        bottom={'0px'}
        padding={'20px'}
        paddingBottom={'50vh'}
        bgGradient="linear(to-t, #451488, transparent)"
      >
        <Flex alignItems={'center'} justifyContent={'flex-start'} gap={'5'}>
          <Box width={'50%'}>
            <Text color={'white'} fontSize={{ base: 'xs', md: 'sm' }} fontWeight={'bold'}>
              {item.media_type === 'tv' ? 'TV SERIES' : 'MOVIE'}
            </Text>
            <Text
              display={'flex'}
              fontSize={{ base: 'md', md: '4xl' }}
              fontWeight="bolder"
              mb={2}
              noOfLines={2}
            >
              {item.title || item.name} 
            </Text>
            <Text
              mb={2}
              noOfLines={1}
              fontSize="sm"
              display={{ base: 'none', md: 'block' }}
              textAlign="justify"
            >
              {item.overview}
            </Text>
          </Box>
        </Flex>
        <Box display={'flex'} gap={'5'} alignItems={'center'}>
          <AiFillPlayCircle size={'6vh'} cursor="pointer" onClick={() => navigate(`/${item.mediaType || item.media_type}/${item.id}`)} />
          <AiFillPlusCircle size={'6vh'} cursor="pointer" />
          &nbsp;{Math.round(item.vote_average * 10) / 10}
           <Text> {(
                                            item?.first_air_date ||
                                            item?.release_date 
                                        ).substring(0, 4)}{" "}&nbsp;</Text>
        </Box>
      </Box>
    </Box>
  ));

  return loading ? (
    <Slider {...settings} zIndex={0}>
      {placeholder}
    </Slider>
  ) : (
    <Slider {...settings} zIndex={0}>{items}</Slider>
  );
};

export default Carousel;

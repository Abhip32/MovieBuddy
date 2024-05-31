import React, { useCallback, useRef } from 'react';
import { HStack, Button, Box } from '@chakra-ui/react';
import { AiOutlineLeft, AiOutlineRight } from 'react-icons/ai';

const Genres = ({ genre, setSelectedGenre, setPage, searchTerm, fetchSearchApi, fetchMovieApi, selectedGenre, page }) => {
  const genresContainerRef = useRef(null);

  const scroll = useCallback((offset) => {
    if (genresContainerRef.current) {
      genresContainerRef.current.scrollBy({
        left: offset,
        behavior: 'smooth',
      });
    }
  }, []);

  const handleTabClick = useCallback((genreId) => {
    setSelectedGenre(genreId);
    setPage(1);
    const apiFunction = searchTerm ? fetchSearchApi : fetchMovieApi;
    apiFunction(genreId, 1);
  }, [setSelectedGenre, setPage, searchTerm, fetchSearchApi, fetchMovieApi]);

  return (
    <Box width="100%" padding="3vw" overflow="hidden" color="#D3D3D3" >
      <HStack justify="space-between" align="center" display={'flex'} alignItems={'center'}> 
        <Button onClick={() => scroll(-200)}>
          <AiOutlineLeft />
        </Button>
        <HStack
          id="genresContainer"
          ref={genresContainerRef}
          overflowX="auto"
          overflowY="hidden"
          whiteSpace="nowrap"
          sx={{
            '::-webkit-scrollbar': { height: '0.5em' },
            '::-webkit-scrollbar-thumb': { backgroundColor: 'transparent' },
          }}
        >
          {genre.map((genreItem) => (
            <Box
              key={genreItem.id}
              cursor="pointer"
              fontWeight="bold"
              padding={'10px'}
              minW='fit-content'
              textAlign="center"
              onClick={() => handleTabClick(genreItem.id)}
              sx={{
                color: genreItem.id === selectedGenre ? 'white' : '#D3D3D3',
                paddingBottom: genreItem.id === selectedGenre && '-5px',
                fontWeight: genreItem.id === selectedGenre && 'bold',
                fontSize: genreItem.id === selectedGenre && '20px',
                borderRadius: genreItem.id === selectedGenre && '100px',
                background: genreItem.id === selectedGenre && 'linear-gradient(to bottom, violet 1%, transparent 100%)',
              }}
            >
              {genreItem.name}
            </Box>
          ))}
        </HStack>
        <Button onClick={() => scroll(200)}>
          <AiOutlineRight />
        </Button>
      </HStack>
    </Box>
  );
};

export default React.memo(Genres);

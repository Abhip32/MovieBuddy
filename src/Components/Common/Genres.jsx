import React from 'react'
import { HStack,Button,Box } from '@chakra-ui/react'
import { AiOutlineLeft,AiOutlineRight } from 'react-icons/ai';

const Genres = (props) => {

    
    const scrollLeft = () => {
        const genresContainer = document.getElementById('genresContainer');
        if (genresContainer) {
          genresContainer.scrollBy({
            left: -200,
            behavior: 'smooth',
          });
        }
      };
      
      const scrollRight = () => {
        const genresContainer = document.getElementById('genresContainer');
        if (genresContainer) {
          genresContainer.scrollBy({
            left: 200,
            behavior: 'smooth',
          });
        }
      };
      


  const handleTabClick = (genreId) => {
    props.setSelectedGenre(genreId);
    props.setPage(1);

    if (props.searchTerm) {
      props.fetchSearchApi();
    } else {
      props.fetchMovieApi(genreId, props.page);
    }
  };

  return (
    <div>
        
        <HStack
          color={' #D3D3D3'}
          width={'97vw'}
          padding={'3vw'}
          overflowX={'scroll'}
          overflowY={'hidden'}
          border={'none'}
          sx={{
            '::-webkit-scrollbar': { width: '0.5em' },
            '::-webkit-scrollbar-thumb': { backgroundColor: 'transparent' },
          }}
        >
        <Button onClick={scrollLeft}><AiOutlineLeft/></Button>
        <HStack  id="genresContainer"overflowX={'hidden'}>
        {props.genre.map((genre) => (
            <Box
              cursor={'pointer'}
              fontWeight={'bolder'}
              margin={'2px'}
              minW={'130px'}
              textAlign={'center'}
              key={genre.id}
              onClick={() => handleTabClick(genre.id)}
              style={
                genre.id === props.selectedGenre
                  ? {
                      color: 'white',
                      paddingBottom: '5px',
                      fontWeight: 'bolder',
                      fontSize: '20px',
                      borderRadius: '100px',
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
                <Button onClick={scrollRight}><AiOutlineRight/></Button>
        </HStack>
    </div>
  )
}

export default Genres
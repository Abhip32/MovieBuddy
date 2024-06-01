import React from 'react';
import { Box, Button, Flex, Image, Text } from "@chakra-ui/react";
import { FaPlay } from "react-icons/fa";
import ModalVideo from 'react-modal-video';
import { img_300, unavailable } from "../../api/config/DefaultImages";
import { useNavigate } from "react-router-dom";

const TopSection = ({ content, isOpen, video, mediaType, setOpen }) => {
    const navigate = useNavigate();

    return (
        <Flex
            position='relative'
            bgImage={`linear-gradient(to right, #451488, rgba(128, 0, 128, 0.2)), url(https://www.themoviedb.org/t/p/w1920_and_h800_multi_faces/${content.backdrop_path})`}
            bgSize="cover"
            bgPosition="center"
            padding='100px'
            justifyContent='space-around'
            alignItems='center'
            direction={{ base: 'column', md: 'row' }}
        >
            <Image
                src={content.poster_path ? `${img_300}/${content.poster_path}` : unavailable}
                alt=""
                height={{ base: '320px', md: '420px' }}
                borderRadius="5px"
                boxShadow="inset 2px 2px 2px 0px rgba(255, 255, 255, 0.5), 7px 7px 20px 0px rgba(0, 0, 0, 0.1), 4px 4px 5px 0px rgba(0, 0, 0, 0.1)"
            />

            <Flex
                direction="column"
                minWidth="300px"
                flexBasis="50%"
                margin="60px 0px"
                color='white'
                textAlign="start"
            >
                <Text fontSize="2.2rem">{content?.original_title || content?.name}</Text>
                <Flex marginTop="10px" alignItems='center' direction='row'>
                    <Text>{(content.first_air_date || content.release_date || "-----").substring(0, 4)}&nbsp;</Text>
                    <Text>{mediaType === "tv" ? "TV Series" : "Movie"}&nbsp;</Text>
                    <Text color="#2fc9f3" fontSize="14px" fontWeight="600">&nbsp;TMDB - ⭐{content.vote_average}</Text>
                </Flex>
                <Flex style={{ display: "flex", fontSize: "12px", marginBottom: "0px" }}>
                    {content.genres.map((n, i) => (
                        <Text key={n.id} fontSize="md" marginLeft="6px">
                            {i > 0 && ", "}
                            {n.name}
                        </Text>
                    ))}
                </Flex>
                <Box>
                    <Text fontSize="15px">{content.tagline}</Text>
                </Box>
                <Box textAlign='justify' mt={5} mb={5}>
                    <Text fontSize="15px">{content.overview}</Text>
                </Box>
                <Box>
                    <ul>
                        <li><Text>DURATION: {mediaType === "tv" ? `${content.episode_run_time[0]} min episodes` : `${content.runtime} min`}</Text></li>
                        {mediaType === "tv" && <li><Text>SEASONS: {content.number_of_seasons}</Text></li>}
                        <li>
                            <Text>STUDIO:{" "}
                                {content.production_companies.map((studio, i) => (
                                    <span key={studio.id} marginLeft={i > 0 ? "5px" : "0"}>
                                        {i > 0 && ", "}
                                        {studio.name}
                                    </span>
                                ))}
                            </Text>
                        </li>
                        {mediaType === "movie" && <li><Text>RELEASE DATE: {content.release_date}</Text></li>}
                        <li><Text>STATUS: {content.status}</Text></li>
                    </ul>
                </Box>
                <Flex mt={10}>
                    <Box position="relative" marginRight="3" marginBottom={{ base: 3, md: 0 }}>
                        {isOpen && (
                            <>
                                <Box
                                    position="fixed"
                                    top="0"
                                    left="0"
                                    width="100%"
                                    height="100%"
                                    backgroundColor="rgba(0, 0, 0, 0.5)"
                                    zIndex="999"
                                ></Box>
                                <Box
                                    position="fixed"
                                    top="20%"
                                    left={{ base: "0%", md: "35%" }}
                                    zIndex="1000"
                                >
                                    <ModalVideo channel="youtube" autoplay isOpen={isOpen} videoId={video} onClose={() => setOpen(false)} />
                                </Box>
                            </>
                        )}
                        <a style={{ borderRadius: 28, display: 'flex', alignItems: 'center' }} onClick={() => setOpen(true)}>
                            <Flex cursor='pointer' alignItems='center' justifyContent='center' w='150px' padding='6px' backgroundColor='transparant' border='1px solid white' borderRadius='20px'>
                                <Text ml={2} fontWeight='bolder' color='white'>Trailer</Text>
                            </Flex>
                        </a>
                    </Box>
                    {mediaType === 'movie' && (
                        <a onClick={() => navigate(`/streaming/movie/${content.imdb_id}`)}>
                            <Flex alignItems='center' justifyContent='center' w='150px' padding='6px' bgGradient='linear(90deg, #800080, #CF9FFF)' borderRadius='20px'>
                                <FaPlay style={{ color: "white" }} size='20' />
                                <Text ml={2} fontWeight='bolder' color='white'>Play</Text>
                            </Flex>
                        </a>
                    )}
                    {mediaType === 'tv' && (
                        <a onClick={() => navigate(`/streaming/tv/${content.id}`)}>
                            <Button alignItems='center' justifyContent='center' w='150px' padding='6px' bgGradient='linear(90deg, #800080, #CF9FFF)' borderRadius='20px'>
                                <FaPlay style={{ color: "white" }} size='20' />
                                <Text _hover={{cursor:'pointer'}} ml={2} fontWeight='bolder' color='white'>Play</Text>
                            </Button>
                        </a>
                    )}
                </Flex>
            </Flex>
        </Flex>
    );
}

export default TopSection;

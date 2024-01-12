import {
    Box,
    Flex,
    Image,
    Text,
    Badge,
    Button,
    IconButton,
    Select,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    Tabs,
    Skeleton,
} from "@chakra-ui/react";
import { AiFillPlayCircle } from "react-icons/ai";
import { img_300, img_500, unavailable } from "../../api/config/DefaultImages";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import SingleData from "../Common/Card";
import Slider from "react-slick";
import { FaPlay } from "react-icons/fa";
import ModalVideo from 'react-modal-video'
import Gallery from "./Carousel";
import TopSection from "./TopSection";

const SinglePage = () => {
    const [isOpen, setOpen] = useState(false)

    const carouselSettings = {
        slidesToShow: 7,
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

    const [content, setContent] = useState();
    const [season, setSeason] = useState(1);
    const [episode, setEpisode] = useState(1);
    const [similarMovies, setSimilarMovies] = useState();
    const [video, setVideo] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [color, setColor] = useState("grey");
    const navigate = useNavigate();
    const { id, mediaType } = useParams();

    const fetchData = async () => {
        try {
            const { data } = await axios.get(` 
          https://api.themoviedb.org/3/${mediaType}/${id}?api_key=${process.env.REACT_APP_API_KEY}&page=1`);
            if (mediaType === 'tv') {
                const externalIds = await fetchExternalIdsForTVSeries(id);
                data.externalIds = externalIds;
            }

            setContent(data);
            console.log(data);
            setIsLoading(true);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                navigate("/error");
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

    const fetchSimilarMovies = async () => {
        try {
            const { data } = await axios.get(` 
          https://api.themoviedb.org/3/${mediaType}/${id}/similar?api_key=${process.env.REACT_APP_API_KEY}`);
            const dataSlice = data.results;
            const filter = dataSlice.slice(0, 7);
            setSimilarMovies(filter);
            setIsLoading(true);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchVideos = async () => {
        try {
            const { data } = await axios.get(` 
          https://api.themoviedb.org/3/${mediaType}/${id}/videos?api_key=${process.env.REACT_APP_API_KEY}`);
            setVideo(data.results[0].key);
            setIsLoading(true);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {

        fetchData();
        fetchSimilarMovies();
        fetchVideos();

    }, [id, setContent, episode, season, setSeason, setEpisode]);

    return (
        <>
            {isLoading ? (
                <>
                    <Box>
                        {content && (
                            <TopSection content={content} isOpen={isOpen} video={video} mediaType={mediaType} setOpen={setOpen} season={season} />
                        )}
                    </Box>

                    {mediaType === 'tv' &&
                        <Tabs bgColor={'#451488'} paddingLeft={'10px'} paddingRight={'10px'}>
                            <TabList color={' #D3D3D3'} width={'95vw'} overflowX={'scroll'} overflowY={'hidden'} border={'none'} sx={{ '::-webkit-scrollbar': { width: '0.5em', }, '::-webkit-scrollbar-thumb': { backgroundColor: 'transparent', }, }}>
                                {content?.seasons?.map((season) => (
                                    // Add a condition to check if season_number is a number and greater than or equal to 1
                                    (typeof season.season_number === 'number' && season.season_number >= 1) ? (
                                        <Tab
                                            fontWeight={'bolder'}
                                            margin={'2px'}
                                            minW={'150px'}
                                            key={season.season_number}
                                            _selected={{
                                                backgroundImage: 'linear-gradient(to right,white,purple)',
                                                backgroundSize: '100% 3px',
                                                backgroundPosition: '0% 100%',
                                                backgroundRepeat: 'no-repeat',
                                                w: '100px',
                                                fontSize: 'xl',
                                                color:'white'
                                            }}
                                        >
                                            Season {season.season_number}
                                        </Tab>
                                    ) : null
                                ))}
                            </TabList>
                            <TabPanels >
                                {content?.seasons?.map((season) => (
                                    // Add a condition to check if season_number is a number and greater than or equal to 1
                                    (typeof season.season_number === 'number' && season.season_number >= 1) ? (
                                        <TabPanel key={season.season_number}>
                                            <Flex bgGradient="linear(to-l, purple 1%, transparent 90%)" overflowX="auto" sx={{ '::-webkit-scrollbar': { width: '0.5em', }, '::-webkit-scrollbar-thumb': { backgroundColor: 'transparent', }, }}>
                                                {Array.from({ length: season.episode_count }, (_, index) => (
                                                    <a
                                                        href={`https://multiembed.mov/?video_id=${content.externalIds.imdb_id}&s=${season.season_number}&e=${index + 1}`}
                                                    >
                                                        <Box marginRight="10px" display={'flex'} alignItems={'center'} flexDirection={'column'}>
                                                            <Image
                                                                paddingTop={'7px'}
                                                                height={'300px'}
                                                                minW={'200px'}
                                                                src={season.poster_path ? `${img_300}/${season.poster_path}` : unavailable}
                                                                alt={`Season ${season.season_number} Episode ${index + 1}`}
                                                                objectFit="cover"
                                                            />
                                                            <Text color={'white'}>Episode {index + 1}</Text>
                                                        </Box>
                                                    </a>
                                                ))}
                                            </Flex>
                                        </TabPanel>
                                    ) : null
                                ))}


                            </TabPanels>
                        </Tabs>

                    }

                    <Box padding={'5vw'} color={'white'} bgGradient='linear(to-b,  #451488 70%,#16072b ,)' paddingBottom={'20px'}>
                        <Box >
                            <Box className="cast__title">
                                <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bolder" paddingBottom="20px">
                                    Cast
                                </Text>
                            </Box>
                            <Box>
                                <Gallery mediaType={mediaType} id={id} />
                            </Box>
                        </Box>
                        <Box className="similar__shows" mt={20} mb={20}>
                            <Box >
                                <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="bolder" >Beacuse you like  {content?.name || content?.original_title}</Text>
                                <br />
                                <Slider {...carouselSettings}>
                                    {similarMovies &&
                                        similarMovies.map((n) => (
                                            <SingleData key={n.id} {...n} mediaType="movie" />
                                        ))}
                                </Slider>
                            </Box>
                        </Box>
                    </Box>
                </>
            ) : (
                <Box
                    className="load_app"
                    minheight="100vh"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                >
                    <Skeleton minH='100vh'/>
                </Box>
            )}
        </>
    );
};

export default SinglePage;

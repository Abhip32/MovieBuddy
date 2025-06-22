import React, { useEffect, useState } from 'react';
import Wrapper from '../../components/Wrapper/Wrapper';
import { BsClockHistory } from 'react-icons/bs';
import { AiFillStar } from 'react-icons/ai';
import { SlArrowRight } from 'react-icons/sl';
import tmdbApi, { TmdbMediaType } from '../../services/tmdbApi';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { DetailMovie, DetailTV, Movie, TV, TrendingVideo } from '../../Types/Movie';
import { originalImage } from '../../services/apiConfigs';
import { Cast, Crew } from '../../Types/Cast';
import ListMovieHorizontal from '../../components/ListMovieHorizontal/ListMovieHorizontal';
import { VideoResult } from '../../Types/Video';
import Error404Page from '../Error/Error404Page';
import axios, { AxiosError } from 'axios';
import Error500Page from '../Error/Error500Page';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import SkeletonDetail from '../../components/Skeleton/SkeletonDetail';
import { useVideoModal } from '../../context/VideoModal/VideoModal.context';
import { siteMap } from '../../Types/common';
import ListCastHorizontal from '../../components/ListCastHorizontal/ListCastHorizontal';
import { BiPlay } from 'react-icons/bi';
import { HiPlay } from 'react-icons/hi2';

type Props = {
  mediaType: TmdbMediaType;
};

const Detail = ({ mediaType }: Props) => {
  const videoModal = useVideoModal();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [selectedSeason, setSelectedSeason] = useState<number | null>(1);
  const [episodes, setEpisodes] = useState<any[]>([]);

  if (!id || !Number(id)) return <Error404Page />;

  const { data, status, error, isFetching, isFetched } = useQuery({
    queryKey: ['detail', mediaType, id],
    queryFn: () => tmdbApi.getDetail<DetailMovie | DetailTV>(mediaType, +id),
    enabled: id !== undefined,
  });

  const queryCast = useQuery({
    queryKey: ['cast', mediaType, id],
    queryFn: () => tmdbApi.getCast<{ cast: Cast[]; crew: Crew[] }>(mediaType, +id),
    enabled: id !== undefined,
  });

  const recommendsQuery = useQuery({
    queryKey: ['recommends', mediaType, id],
    queryFn: () => tmdbApi.getRecommendations<Movie | TV | TrendingVideo>(mediaType, +id),
    enabled: id !== undefined,
  });

  const similarQuery = useQuery({
    queryKey: ['similar', mediaType, id],
    queryFn: () => tmdbApi.getSimilar<Movie | TV | TrendingVideo>(mediaType, +id),
    enabled: id !== undefined,
  });

  const fetchEpisodes = async (seasonNumber: number) => {
    try {
      const response = await tmdbApi.getEpisodes(+id, seasonNumber);
      setEpisodes((response.data as { episodes: any[] }).episodes);
    } catch (error) {
      console.error("Failed to fetch episodes:", error);
    }
  };

  useEffect(() => {
    if (selectedSeason !== null) {
      fetchEpisodes(selectedSeason);
    }
  }, [selectedSeason]);

  useEffect(() => {
    if (selectedSeason !== null) {
      fetchEpisodes(selectedSeason);
    }
    setSelectedSeason(1);
  }, [id]);

  const handleSeasonChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const seasonNumber = parseInt(event.target.value, 10);
    setSelectedSeason(seasonNumber);
  };

  const handleClickTrailer = (media_type: TmdbMediaType, id: number) => {
    tmdbApi
      .getVideo<VideoResult>(mediaType, id)
      .then((res) => {
        videoModal?.open(
          `${
            res.data.results[0].site === 'YouTube' ? siteMap.YouTube : siteMap.Vimeo || ''
          }${res.data.results[0].key || ''}`
        );
      })
      .catch(() => {
        videoModal?.open(`https://www.youtube.com`);
      });
  };

  const handleEpisodeClick = (season_id:number,episodeId: number) => {
    navigate(`streaming/tv/${season_id}/${episodeId}`);
  };

  const handlePlayClick = () => {
    navigate(`streaming/movie`);
  };

  if ((!data && isFetched) || error) {
    if (axios.isAxiosError(error) && (error as AxiosError).response?.status === 404) {
      return <Error404Page />;
    }
    return <Error500Page />;
  }

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <div className='detail-page bg-gradient-to-b from-deep-purple to-black'>
      {data && (
        <div
          className='detail'
          style={{ backgroundImage: `url(${originalImage(data.data.backdrop_path)})` }}
        >
          <Wrapper className='relative z-[1] flex flex-col md:flex-row gap-8 md:gap-16 py-5 min-h-[80vh]'>
            <div className='detail-card overflow-hidden self-center rounded-2xl w-60'>
              <LazyLoadImage
                src={originalImage(data.data.poster_path)}
                loading='lazy'
                alt={(data.data as DetailMovie).title || (data.data as DetailTV).name || ''}
              />
            </div>
            <div className='detail-content text-white md:flex-1'>
              <div className='name text-white text-4xl font-extrabold'>
                {(data.data as DetailMovie).title || (data.data as DetailTV).name || ''}
              </div>
              <div className='info flex items-center gap-2 md:gap-4 text-sm mt-4'>
                <span className='tracking-widest'>
                  {new Date(
                    (data.data as DetailMovie).release_date || (data.data as DetailTV).first_air_date
                  ).getFullYear() || 'N/A'}
                </span>
                <span className='flex items-center text-sm'>
                  <AiFillStar color='yellow' className='text-xl mr-1' /> {typeof data?.data?.vote_average === 'number' ? data.data.vote_average.toFixed(2) : 'N/A'}

                </span>
              </div>
              <div className='flex items-center gap-6 flex-wrap mt-6'>
                {data.data.genres.map((genre, index) => (
                  <span
                    key={genre.id.toString()}
                    className='genre-items text-sm border border-white rounded-3xl py-1 px-2'
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
              <div className='mt-6 text-white text-md lg:w-[80%]'>{data.data.overview}</div>
              {
  mediaType === 'movie' ? (
    <div className='flex items-center gap-6 flex-wrap mt-6'>
      <span>
        Runtime:
        {(data.data as DetailMovie).runtime || 'N/A'}
      </span>
    </div>
  ) : (
    <div className='flex items-center gap-6 flex-wrap mt-6'>
      <span>
        Seasons : &nbsp;
        {(data.data as DetailTV).number_of_seasons || 'N/A'}
      </span>
    </div>
  )
}
           
              <div className='flex-wrap mt-6'>
                <span>Studios: &nbsp;</span>
                <span>
                  {data.data.production_companies
                    .map((company) => company.name)
                    .join(', ')}
                </span>
              </div>
              <div className='flex items-center gap-6 flex-wrap mt-6'>
                <span>Release Date :</span>
                <span>
                  {(data.data as DetailMovie).release_date || (data.data as DetailTV).first_air_date}
                </span>
              </div>
              <div className='flex items-center gap-6 flex-wrap mt-6'>
                <span>Status :</span>
                <span>{data.data.status}</span>
              </div>
              <div className='flex flex-col md:flex-row gap-6'>
                <button
                  onClick={() => handleClickTrailer(mediaType, data.data.id)}
                  className='mt-6 flex items-center gap-3 uppercase tracking-wider group hover:bg-gray-800 hover:text-white px-6 py-3 rounded-full border transition-colors duration-300 ease-in-out w-[200px] text-sm font-semibold'
                >
                  <BiPlay className='text-xl' />
                  <span>Trailer</span>
                </button>
                <button
                  onClick={() => mediaType =="tv" ? handleEpisodeClick(1,1) : handlePlayClick()}
                  className='mt-6 bg-deep-purple flex items-center gap-3 uppercase tracking-wider group hover:bg-gray-800 hover:text-white px-6 py-3 rounded-full border border-transparent transition-colors duration-300 ease-in-out w-[200px] text-sm font-semibold border'
                >
                  <BiPlay className='text-xl' />
                  <span>Play</span>
                </button>
              </div>
            </div>
          </Wrapper>
        </div>
      )}
      {isFetching && <SkeletonDetail />}
      {mediaType === 'tv' && (data?.data as DetailTV) && (
  <div className='py-5'>
    <Wrapper>
      <h2 className='text-white text-2xl mb-4'>Seasons & Episodes</h2>
      <div className='flex items-center mb-4'>
        <label htmlFor='seasonSelect' className='text-white text-lg mr-4'>
          Select Season:
        </label>
        <select
          id='seasonSelect'
          className='bg-transparent text-white p-2 rounded border'
          value={selectedSeason ?? ''}
          onChange={handleSeasonChange}
        >
          <option value='' className='text-white'>
            Select a season
          </option>
          {(data?.data as DetailTV).seasons.map((season) =>
            season.season_number >= 1 ? (
              <option key={season.season_number} value={season.season_number} className='text-white'>
                Season {season.season_number}
              </option>
            ) : null
          )}
        </select>
      </div>
      <div className="max-h-[590px] mt-5 overflow-y-auto w-[90vw] mx-auto">
  {episodes.map((episode) => (
    <div
      key={episode.id}
      className="group text-white py-4 px-2 sm:px-4 rounded-lg cursor-pointer hover:bg-black/40 transition duration-300 flex flex-col sm:flex-row gap-4"
    >
      {/* Thumbnail */}
      <div className="relative w-full sm:w-[180px] h-[180px] sm:h-[100px] flex-shrink-0"  onClick={() => handleEpisodeClick(selectedSeason||1, episode.episode_number)}>
        <LazyLoadImage
          src={originalImage(episode.still_path, 300)}
          alt={`Episode ${episode.episode_number}`}
          className="w-full h-full object-cover rounded-lg"
        />
        {/* Play Button Overlay (visible when parent is hovered) */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
          <div className="bg-white bg-opacity-25 p-3 rounded-full">
            <HiPlay className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
        </div>
      </div>

      {/* Episode Info */}
      <div className="flex-1">
        <h3 className="font-semibold text-lg sm:text-xl">
          S{selectedSeason} E{episode.episode_number} - {episode.name}
        </h3>
        <p className="text-sm text-white opacity-70 mt-1 line-clamp-2">
          {episode.overview}
        </p>
      </div>
    </div>
  ))}
</div>


    </Wrapper>
  </div>
)}
      <div className=' py-5'>
        <Wrapper>
          {queryCast.data && queryCast.data.data.cast.length > 0 && (
            <>
              <h2 className='text-white text-2xl mb-4'>Cast</h2>
              <div className='list-movie-horizontal'>
                <ListCastHorizontal
                  className='pb-8 pt-6'
                  data={queryCast.data.data.cast}
                />
              </div>
            </>
          )}
          {queryCast.isFetching && <ListMovieHorizontal skeleton data={[]} mediaType='all' />}
        </Wrapper>
      </div>

      <div className='py-5'>
  <Wrapper>
    {similarQuery.data && similarQuery.data.data.results.length > 0 && (
      <>
        <h2 className='text-white text-2xl mb-4'>Similar</h2>
        <div className='list-movie-horizontal'>
          <ListMovieHorizontal
            className='pb-8 pt-6'
            data={(similarQuery.data.data.results as Movie[]) || (similarQuery.data.data.results as TV[]) || []}
            mediaType={mediaType}
          />
        </div>
      </>
    )}
    {similarQuery.isFetching && <ListMovieHorizontal skeleton data={[]} mediaType='all' />}
  </Wrapper>
</div>

      <div className='py-5'>
        <Wrapper>
          {recommendsQuery.data && recommendsQuery.data.data.results.length > 0 && (
            <>
              <h2 className='text-white text-2xl mb-4'>Recommends</h2>
              <div className='list-movie-horizontal'>
                <ListMovieHorizontal
                  className='pb-8 pt-6'
                  data={
                    (recommendsQuery.data.data.results as Movie[]) ||
                    (recommendsQuery.data.data.results as TV[]) ||
                    []
                  }
                  mediaType={mediaType}
                />
              </div>
            </>
          )}
          {recommendsQuery.isFetching && <ListMovieHorizontal skeleton data={[]} mediaType='all' />}
        </Wrapper>
      </div>
     
    </div>
  );
};

export default Detail;

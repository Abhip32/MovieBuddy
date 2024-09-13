import React, { useMemo, useState } from "react";

import { MdKeyboardArrowRight, MdLiveTv } from "react-icons/md";
import Wrapper from "../../components/Wrapper/Wrapper";
import GridContainer from "../../components/GridContainer/GridContainer";
import tmdbApi, { TmdbMediaType } from "../../services/tmdbApi";
import { Movie, TV } from "../../Types/Movie";
import ListMovieHorizontal from "../../components/ListMovieHorizontal/ListMovieHorizontal";
import Card from "../../components/Card/Card";
import { useQuery } from "@tanstack/react-query";
import { AiFillPlayCircle } from "react-icons/ai";
import classNames from "classnames";
import { Link } from "react-router-dom";
import { VideoResult } from "../../Types/Video";
import HeroSlide from "../../components/HeroSlide/HeroSlide";
import { siteMap } from "../../Types/common";
import SkeletonCard from "../../components/Skeleton/SkeletonCard";
import { useVideoModal } from "../../context/VideoModal/VideoModal.context";

type Props = {};

const Home = (props: Props) => {
  const [topRatingSelect, setTopRatingSelect] = useState<"movie" | "tv">(
    "movie"
  );
  const [popularSelect, setPopularSelect] = useState<"movie" | "tv">("movie");
  const videoModal = useVideoModal();

  const trendingQuery = useQuery({
    queryKey: ["trending"],
    queryFn: () => tmdbApi.getTrendingMovies(),
  });

  const topRatedMovieQuery = useQuery({
    queryKey: ["top_rated_movie"],
    queryFn: () => tmdbApi.getList<Movie>("movie", "top_rated"),
  });

  const topRatedTVQuery = useQuery({
    queryKey: ["top_rated_tv"],
    queryFn: () => tmdbApi.getList<TV>("tv", "top_rated"),
  });

  const popularMovieQuery = useQuery({
    queryKey: ["popular_movie"],
    queryFn: () => tmdbApi.getList<Movie>("movie", "popular"),
  });

  const popularTVQuery = useQuery({
    queryKey: ["popular_tv"],
    queryFn: () => tmdbApi.getList<TV>("tv", "popular"),
  });

  const latestMovieQuery = useQuery({
    queryKey: ["latest_movie", { page: 1 }],
    queryFn: () => tmdbApi.getDiscoverList<Movie>("movie"),
  });

  const latestTVQuery = useQuery({
    queryKey: ["latest_tv", { page: 1 }],
    queryFn: () => tmdbApi.getDiscoverList<TV>("tv"),
  });

  const trendingData = useMemo(() => {
    return trendingQuery.data?.data.results.slice(5);
  }, [trendingQuery.data]);

  const handleClickTrailer = (media_type: TmdbMediaType, id: number) => {
    tmdbApi
      .getVideo<VideoResult>(media_type, id)
      .then((res) => {
        videoModal?.open(
          `${
            res.data.results[0].site === "YouTube"
              ? siteMap.YouTube
              : siteMap.Vimeo || ""
          }${res.data.results[0].key || ""}`
        );
      })
      .catch((error) => {
        videoModal?.open(`https://www.youtube.com`);
      });
  };

  return (
    <div className="home">
      {/* hero slide */}
      <HeroSlide onClickTrailer={handleClickTrailer} />

      <div className="main-content bg-gradient-to-b from-deep-purple to-black ">
        {/* top trending */}
        <section className="pt-10">
          <Wrapper>
            <h2 className='text-bold text-white py-1 text-2xl relative'>
              Top Trending{" "}
            </h2>
            {trendingQuery.data && (
              <ListMovieHorizontal
                mediaType="all"
                className="pb-8 pt-6"
                data={trendingData || []}
              />
            )}
            {trendingQuery.isLoading && (
              <ListMovieHorizontal
                mediaType="all"
                className="pb-8 pt-6"
                data={[]}
                skeleton
              />
            )}
          </Wrapper>
        </section>

        
                {/* popular movies */}
                <section className="pt-10">
          <Wrapper>
            <h2 className='text-bold text-white py-1 text-2xl relative'>
              Popular Movies{" "}
            </h2>
            {popularMovieQuery.data && (
              <ListMovieHorizontal
                mediaType="movie"
                className="pb-8 pt-6"
                data={popularMovieQuery.data.data.results || []}
              />
            )}
            {popularMovieQuery.isLoading && (
              <ListMovieHorizontal
                mediaType="movie"
                className="pb-8 pt-6"
                data={[]}
                skeleton
              />
            )}
          </Wrapper>
        </section>


        
        {/* popular tv shows */}
        <section className="pt-10">
          <Wrapper>
            <h2 className='text-bold text-white py-1 text-2xl relative'>
              Popular TV Shows{" "}
            </h2>
            {popularTVQuery.data && (
              <ListMovieHorizontal
                mediaType="tv"
                className="pb-8 pt-6"
                data={popularTVQuery.data.data.results || []}
              />
            )}
            {popularTVQuery.isLoading && (
              <ListMovieHorizontal
                mediaType="tv"
                className="pb-8 pt-6"
                data={[]}
                skeleton
              />
            )}
          </Wrapper>
        </section>

        {/* top rated movies */}
        <section className="pt-10">
          <Wrapper>
            <h2 className='text-bold text-white py-1 text-2xl relative'>
              Top Rated Movies{" "}
            </h2>
            {topRatedMovieQuery.data && (              <ListMovieHorizontal
                mediaType="movie"
                className="pb-8 pt-6"
                data={topRatedMovieQuery.data.data.results || []}
              />
            )}
            {topRatedMovieQuery.isLoading && (
              <ListMovieHorizontal
                mediaType="movie"
                className="pb-8 pt-6"
                data={[]}
                skeleton
              />
            )}
          </Wrapper>
        </section>

        {/* top rated tv shows */}
        <section className="pt-10">
          <Wrapper>
            <h2 className='text-bold text-white py-1 text-2xl relative'>
              Top Rated TV Shows{" "}
            </h2>
            {topRatedTVQuery.data && (
              <ListMovieHorizontal
                mediaType="tv"
                className="pb-8 pt-6"
                data={topRatedTVQuery.data.data.results || []}
              />
            )}
            {topRatedTVQuery.isLoading && (
              <ListMovieHorizontal
                mediaType="tv"
                className="pb-8 pt-6"
                data={[]}
                skeleton
              />
            )}
          </Wrapper>
        </section>

      </div>
    </div>
  );
};

export default Home;
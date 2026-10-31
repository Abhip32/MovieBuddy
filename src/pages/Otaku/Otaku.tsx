import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  IoFlame,
  IoTrophy,
  IoFilm,
  IoSearch,
  IoPlay,
  IoStar,
  IoSparkles,
  IoInformationCircleOutline,
  IoHeart,
} from "react-icons/io5";
import { FaFire, FaDragon } from "react-icons/fa";
import { BiMoviePlay } from "react-icons/bi";
import Wrapper from "../../components/Wrapper/Wrapper";
import otakuService, { AniListMedia } from "../../services/otakuService";
import { useVideoModal } from "../../context/VideoModal/VideoModal.context";

type AnimeCategory = "trending" | "top_rated" | "movies" | "action" | "fantasy" | "scifi" | "romance";

interface CategoryTab {
  id: AnimeCategory;
  label: string;
  icon: React.ReactNode;
  genreName?: string;
}

const CATEGORY_TABS: CategoryTab[] = [
  { id: "trending", label: "Trending Anime", icon: <IoFlame className="text-amber-400" /> },
  { id: "top_rated", label: "Top Rated", icon: <IoTrophy className="text-yellow-400" /> },
  { id: "movies", label: "Anime Movies", icon: <IoFilm className="text-purple-400" /> },
  { id: "action", label: "Shonen & Action", icon: <FaFire className="text-red-400" />, genreName: "Action" },
  { id: "fantasy", label: "Fantasy & Isekai", icon: <FaDragon className="text-emerald-400" />, genreName: "Fantasy" },
  { id: "scifi", label: "Sci-Fi & Mecha", icon: <IoSparkles className="text-cyan-400" />, genreName: "Sci-Fi" },
  { id: "romance", label: "Romance & Drama", icon: <IoHeart className="text-pink-400" />, genreName: "Romance" },
];

const Otaku: React.FC = () => {
  const videoModal = useVideoModal();
  const [activeCategory, setActiveCategory] = useState<AnimeCategory>("trending");
  const [animeList, setAnimeList] = useState<AniListMedia[]>([]);
  const [heroList, setHeroList] = useState<AniListMedia[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [heroIndex, setHeroIndex] = useState<number>(0);

  // Fetch initial trending anime for the Hero Spotlight Carousel
  useEffect(() => {
    otakuService
      .getTrendingAnime(1, 10)
      .then((res) => {
        const withBanners = res.filter((a) => a.bannerImage || a.coverImage?.extraLarge);
        if (withBanners.length > 0) {
          setHeroList(withBanners.slice(0, 5));
        }
      })
      .catch(() => {});
  }, []);

  // Rotate hero spotlight every 7 seconds
  useEffect(() => {
    if (heroList.length <= 1) return;
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroList.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [heroList]);

  // Fetch anime items by selected category
  const fetchAnimeByCategory = useCallback(async (cat: AnimeCategory) => {
    setIsLoading(true);
    try {
      let data: AniListMedia[] = [];
      if (cat === "trending") {
        data = await otakuService.getTrendingAnime(1, 24);
      } else if (cat === "top_rated") {
        data = await otakuService.getTopRatedAnime(1, 24);
      } else if (cat === "movies") {
        data = await otakuService.getAnimeMovies(1, 24);
      } else {
        const found = CATEGORY_TABS.find((t) => t.id === cat);
        data = await otakuService.getAnimeByGenre(found?.genreName || "Action", 1, 24);
      }
      setAnimeList(data);
    } catch {
      setAnimeList([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setIsSearching(false);
      fetchAnimeByCategory(activeCategory);
    }
  }, [activeCategory, searchQuery, fetchAnimeByCategory]);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setIsLoading(true);
    setIsSearching(true);
    try {
      const results = await otakuService.searchAnime(query, 1, 24);
      setAnimeList(results);
    } catch {
      setAnimeList([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenTrailer = (trailerId?: string) => {
    if (trailerId) {
      videoModal?.open(`https://www.youtube.com/embed/${trailerId.trim()}`);
    } else {
      videoModal?.open(`https://www.youtube.com`);
    }
  };

  const currentHero = heroList[heroIndex];
  const heroTitle = currentHero?.title.english || currentHero?.title.romaji || "Otaku Anime Spotlight";
  const heroBg = currentHero?.bannerImage || currentHero?.coverImage.extraLarge || currentHero?.coverImage.large;

  return (
    <div className="min-h-screen bg-black text-white font-poppins pb-20">
      {/* Dynamic AniList Hero Spotlight Banner */}
      <div className="relative w-full h-[520px] sm:h-[580px] md:h-[640px] overflow-hidden bg-black-2">
        {heroBg && (
          <div
            key={currentHero?.id}
            className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-105"
            style={{
              backgroundImage: `url(${heroBg})`,
              filter: "brightness(0.65)",
            }}
          />
        )}

        {/* Ambient Dark Purple Lighting */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />

        <Wrapper className="relative z-10 h-full flex flex-col justify-end pb-16 sm:pb-20">
          {currentHero && (
            <div className="max-w-2xl space-y-3.5 animate-fadeIn">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-dark-purple/30 border border-dark-purple/50 text-xs text-purple-300 font-semibold tracking-wide backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-dark-purple animate-pulse" />
                <span>OTAKU SPOTLIGHT</span>
              </div>

              {/* Title links to Detail Page */}
              <Link
                to={`/otaku/detail/${currentHero.id}`}
                className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight drop-shadow-lg hover:text-dark-purple transition-colors block"
              >
                {heroTitle}
              </Link>

              <div className="flex items-center gap-3 text-xs sm:text-sm text-light-gray font-medium flex-wrap">
                {currentHero.averageScore && (
                  <span className="flex items-center gap-1 text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                    <IoStar size={13} /> {(currentHero.averageScore / 10).toFixed(1)} / 10
                  </span>
                )}
                <span>•</span>
                <span>{currentHero.seasonYear || "Anime"}</span>
                <span>•</span>
                <span className="uppercase text-purple-300 font-semibold">
                  {currentHero.format || "TV SERIES"}
                </span>
                {currentHero.genres && (
                  <>
                    <span>•</span>
                    <span className="text-light-gray">{currentHero.genres.slice(0, 3).join(", ")}</span>
                  </>
                )}
              </div>

              <p className="text-xs sm:text-sm text-light-gray/90 line-clamp-3 leading-relaxed max-w-xl">
                {currentHero.description || "Stream this top-rated anime series directly on MovieBuddy."}
              </p>

              {/* Action Buttons: View Details, Trailer, and Stream */}
              <div className="flex items-center gap-3 sm:gap-4 pt-2 flex-wrap">
                <Link
                  to={`/otaku/detail/${currentHero.id}`}
                  className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-dark-purple hover:bg-deep-purple font-bold text-xs sm:text-sm text-white shadow-lg shadow-dark-purple/40 transition-all transform hover:scale-105 cursor-pointer"
                >
                  <IoInformationCircleOutline size={18} />
                  <span>View Details</span>
                </Link>

                <button
                  type="button"
                  onClick={() => handleOpenTrailer(currentHero.trailer?.id)}
                  className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-white/10 hover:bg-white hover:text-black border border-white/20 font-semibold text-xs sm:text-sm text-white transition-all cursor-pointer"
                >
                  <BiMoviePlay size={17} />
                  <span>Trailer</span>
                </button>

                <Link
                  to={`/otaku/stream/${currentHero.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-medium text-purple-300 hover:text-white transition-colors"
                >
                  <IoPlay size={14} />
                  <span>Watch Stream &rarr;</span>
                </Link>
              </div>
            </div>
          )}

          {/* Hero Indicator Dots */}
          <div className="absolute bottom-6 right-6 flex items-center gap-2">
            {heroList.map((h, i) => (
              <button
                key={h.id}
                onClick={() => setHeroIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                  i === heroIndex
                    ? "bg-dark-purple w-7"
                    : "bg-white/40 hover:bg-white/70"
                }`}
                title={h.title.english || h.title.romaji}
              />
            ))}
          </div>
        </Wrapper>
      </div>

      <Wrapper className="mt-8 sm:mt-12">
        {/* Section Header & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
              <span>Otaku Anime Hub</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-dark-purple/30 text-purple-300 font-semibold border border-dark-purple/40">
                AniList Powered
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-light-gray mt-1">
              Explore anime series and movies. Click any card to view voice actors, trailers, episodes, or stream directly.
            </p>
          </div>

          {/* Quick Search Anime Input */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2 w-full md:w-80 bg-black-2 border border-white/15 rounded-full px-3.5 py-1.5 focus-within:border-dark-purple transition-colors shadow-inner"
          >
            <IoSearch className="text-light-gray text-lg flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search anime title..."
              className="bg-transparent text-xs sm:text-sm text-white placeholder-light-gray/60 focus:outline-none w-full"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-xs text-light-gray hover:text-white"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Category Filter Pills (When Not Searching) */}
        {!isSearching && (
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
            {CATEGORY_TABS.map((tab) => {
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer border ${
                    isActive
                      ? "bg-dark-purple text-white border-dark-purple shadow-[0_0_15px_rgba(179,0,255,0.4)]"
                      : "bg-white/5 hover:bg-white/10 text-light-gray hover:text-white border-white/10"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Search Results Header */}
        {isSearching && (
          <div className="mb-6 flex items-center justify-between text-sm text-light-gray border-b border-white/10 pb-3">
            <span>
              Search results for: <strong className="text-white">&ldquo;{searchQuery}&rdquo;</strong> ({animeList.length} titles found)
            </span>
            <button
              onClick={() => {
                setSearchQuery("");
                setIsSearching(false);
              }}
              className="text-xs text-dark-purple hover:underline"
            >
              Back to Categories
            </button>
          </div>
        )}

        {/* Anime Grid: Every card links to /otaku/detail/:id */}
        {isLoading ? (
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3.5 sm:gap-4 md:gap-5">
            {[...Array(18).keys()].map((n) => (
              <div
                key={n}
                className="aspect-[2/3] rounded-xl bg-white/5 animate-pulse border border-white/5"
              />
            ))}
          </div>
        ) : animeList.length === 0 ? (
          <div className="py-20 text-center text-light-gray space-y-3">
            <p className="text-lg font-semibold text-white">No anime found</p>
            <p className="text-xs">Try selecting another category or refining your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3.5 sm:gap-4 md:gap-5">
            {animeList.map((anime) => {
              const displayTitle = anime.title.english || anime.title.romaji || "Anime";
              const detailUrl = `/otaku/detail/${anime.id}`;
              const poster = anime.coverImage.extraLarge || anime.coverImage.large || anime.coverImage.medium;

              return (
                <div
                  key={anime.id}
                  className="group relative rounded-xl overflow-hidden bg-black-2 border border-white/10 hover:border-dark-purple/60 transition-all duration-300 flex flex-col hover:-translate-y-1.5 hover:shadow-xl hover:shadow-dark-purple/20"
                >
                  {/* Poster Image links directly to the Detail Page */}
                  <Link
                    to={detailUrl}
                    className="relative aspect-[2/3] w-full overflow-hidden bg-black block"
                  >
                    <img
                      src={poster}
                      alt={displayTitle}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Gradient Overlay with Detail / Stream actions on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2 p-3">
                      <span className="w-10 h-10 rounded-full bg-dark-purple text-white flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300">
                        <IoInformationCircleOutline size={22} />
                      </span>
                      <span className="text-xs font-bold text-white bg-black/60 px-2.5 py-1 rounded-full border border-white/20">
                        View Details
                      </span>
                    </div>

                    {/* Top Badges */}
                    <div className="absolute top-2 left-2 flex items-center gap-1 pointer-events-none">
                      {anime.averageScore && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-sm text-amber-400 border border-white/10 flex items-center gap-0.5">
                          <IoStar size={10} /> {(anime.averageScore / 10).toFixed(1)}
                        </span>
                      )}
                    </div>

                    <div className="absolute top-2 right-2 pointer-events-none">
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-dark-purple/80 text-white backdrop-blur-sm">
                        {anime.format || "TV"}
                      </span>
                    </div>
                  </Link>

                  {/* Card Bottom Meta */}
                  <div className="p-2.5 flex-1 flex flex-col justify-between">
                    <div>
                      <Link
                        to={detailUrl}
                        className="text-xs sm:text-sm font-semibold text-white hover:text-dark-purple transition-colors line-clamp-1 block"
                        title={displayTitle}
                      >
                        {displayTitle}
                      </Link>
                      <p className="text-[10px] text-light-gray mt-0.5 line-clamp-1">
                        {anime.title.romaji || anime.genres?.slice(0, 2).join(", ")}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-1.5 border-t border-white/5 flex items-center justify-between text-[11px]">
                      <span className="text-light-gray text-[10px]">{anime.seasonYear || "Anime"}</span>
                      <Link
                        to={detailUrl}
                        className="text-purple-300 hover:text-white font-medium text-[10px] transition-colors"
                      >
                        Details &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Wrapper>
    </div>
  );
};

export default Otaku;

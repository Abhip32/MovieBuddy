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
} from "react-icons/io5";
import { FaFire, FaDragon } from "react-icons/fa";
import Wrapper from "../../components/Wrapper/Wrapper";
import otakuService, { AnimeItem } from "../../services/otakuService";
import { originalImage } from "../../services/apiConfigs";

type AnimeCategory = "trending" | "top_rated" | "movies" | "action" | "fantasy" | "scifi";

interface CategoryTab {
  id: AnimeCategory;
  label: string;
  icon: React.ReactNode;
  genreId?: number;
}

const CATEGORY_TABS: CategoryTab[] = [
  { id: "trending", label: "Trending Anime", icon: <IoFlame className="text-amber-400" /> },
  { id: "top_rated", label: "Top Rated", icon: <IoTrophy className="text-yellow-400" /> },
  { id: "movies", label: "Anime Movies", icon: <IoFilm className="text-purple-400" /> },
  { id: "action", label: "Shonen & Action", icon: <FaFire className="text-red-400" />, genreId: 28 },
  { id: "fantasy", label: "Fantasy & Isekai", icon: <FaDragon className="text-emerald-400" />, genreId: 14 },
  { id: "scifi", label: "Sci-Fi & Mecha", icon: <IoSparkles className="text-cyan-400" />, genreId: 878 },
];

const FEATURED_HEROES = [
  {
    id: 85937,
    type: "tv" as const,
    title: "Demon Slayer: Kimetsu no Yaiba",
    tagline: "It is the Taisho Period in Japan. Tanjiro, a kindhearted boy, finds his family slaughtered by a demon.",
    backdrop: "https://image.tmdb.org/t/p/original/nTvM4mhqZlHIvUkIvd6vv79QOmp.jpg",
    rating: 8.7,
    year: "2019",
    genre: "Shonen • Action • Supernatural",
  },
  {
    id: 95557,
    type: "tv" as const,
    title: "Jujutsu Kaisen",
    tagline: "A boy swallowed a cursed talisman - the finger of a demon - and becomes cursed himself.",
    backdrop: "https://image.tmdb.org/t/p/original/gmECX1DvF9vgFMJNhQi8vG25v64.jpg",
    rating: 8.6,
    year: "2020",
    genre: "Action • Dark Fantasy",
  },
  {
    id: 1429,
    type: "tv" as const,
    title: "Attack on Titan",
    tagline: "Centuries ago, mankind was slaughtered by monstrous humanoids known as Titans.",
    backdrop: "https://image.tmdb.org/t/p/original/iK5g65q3QZcZ0R6e2b4xK4T.jpg",
    rating: 8.9,
    year: "2013",
    genre: "Military • Post-Apocalyptic",
  },
  {
    id: 129,
    type: "movie" as const,
    title: "Spirited Away",
    tagline: "A young girl wanders into a world ruled by gods, witches, and spirits.",
    backdrop: "https://image.tmdb.org/t/p/original/Ab8mkHmkYADjU7wQiOkia9BzGvS.jpg",
    rating: 8.5,
    year: "2001",
    genre: "Ghibli • Fantasy • Classic",
  },
];

const Otaku: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<AnimeCategory>("trending");
  const [animeList, setAnimeList] = useState<AnimeItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [heroIndex, setHeroIndex] = useState<number>(0);

  // Rotate hero spotlight every 8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % FEATURED_HEROES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const fetchAnimeByCategory = useCallback(async (cat: AnimeCategory) => {
    setIsLoading(true);
    try {
      let data: { results: AnimeItem[] };
      if (cat === "trending") {
        data = await otakuService.getTrendingAnime(1);
      } else if (cat === "top_rated") {
        data = await otakuService.getTopRatedAnime(1);
      } else if (cat === "movies") {
        data = await otakuService.getAnimeMovies(1);
      } else {
        const foundTab = CATEGORY_TABS.find((t) => t.id === cat);
        data = await otakuService.getAnimeByGenre(foundTab?.genreId || 28, 1);
      }
      setAnimeList(data.results || []);
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
      const results = await otakuService.searchAnime(query, 1);
      setAnimeList(results);
    } catch {
      setAnimeList([]);
    } finally {
      setIsLoading(false);
    }
  };

  const currentHero = FEATURED_HEROES[heroIndex];

  return (
    <div className="min-h-screen bg-black text-white font-poppins pb-20">
      {/* Hero Spotlight Banner */}
      <div className="relative w-full h-[520px] sm:h-[580px] md:h-[640px] overflow-hidden bg-black-2">
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-105"
          style={{
            backgroundImage: `url(${currentHero.backdrop})`,
          }}
        />
        {/* Cinematic Vignette Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />

        <Wrapper className="relative z-10 h-full flex flex-col justify-end pb-16 sm:pb-20">
          <div className="max-w-2xl space-y-3.5 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-dark-purple/30 border border-dark-purple/50 text-xs text-purple-300 font-semibold tracking-wide backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-dark-purple animate-pulse" />
              <span>OTAKU SPOTLIGHT</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight drop-shadow-md">
              {currentHero.title}
            </h1>

            <div className="flex items-center gap-3 text-xs sm:text-sm text-light-gray font-medium">
              <span className="flex items-center gap-1 text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                <IoStar size={13} /> {currentHero.rating}
              </span>
              <span>•</span>
              <span>{currentHero.year}</span>
              <span>•</span>
              <span className="text-purple-300">{currentHero.genre}</span>
            </div>

            <p className="text-xs sm:text-sm text-light-gray/90 line-clamp-3 leading-relaxed max-w-xl">
              {currentHero.tagline}
            </p>

            <div className="flex items-center gap-3 pt-2">
              <Link
                to={`/otaku/stream/${currentHero.type}/${currentHero.id}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-dark-purple hover:bg-deep-purple font-bold text-sm text-white shadow-lg shadow-dark-purple/40 transition-all transform hover:scale-105 cursor-pointer"
              >
                <IoPlay size={18} />
                <span>Watch Stream</span>
              </Link>
            </div>
          </div>

          {/* Hero Indicator Dots */}
          <div className="absolute bottom-6 right-6 flex items-center gap-2">
            {FEATURED_HEROES.map((h, i) => (
              <button
                key={h.id}
                onClick={() => setHeroIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                  i === heroIndex
                    ? "bg-dark-purple w-7"
                    : "bg-white/40 hover:bg-white/70"
                }`}
                title={h.title}
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
                Sub & Dub
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-light-gray mt-1">
              Stream the latest anime series, classic shonen, and movies with dedicated anime players.
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
              placeholder="Search any anime title..."
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

        {/* Anime Title Counter / Search Title */}
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

        {/* Anime Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3.5 sm:gap-4 md:gap-5">
            {[...Array(12).keys()].map((n) => (
              <div
                key={n}
                className="aspect-[2/3] rounded-xl bg-white/5 animate-pulse border border-white/5"
              />
            ))}
          </div>
        ) : animeList.length === 0 ? (
          <div className="py-20 text-center text-light-gray space-y-3">
            <p className="text-lg font-semibold text-white">No anime found</p>
            <p className="text-xs">Try searching with a different spelling or keyword.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3.5 sm:gap-4 md:gap-5">
            {animeList.map((anime) => {
              const displayTitle = anime.name || anime.title || anime.original_name || "Anime";
              const mediaType = anime.media_type || (anime.first_air_date ? "tv" : "movie");
              const year = (anime.first_air_date || anime.release_date || "").slice(0, 4);

              return (
                <Link
                  key={`${mediaType}_${anime.id}`}
                  to={`/otaku/stream/${mediaType}/${anime.id}`}
                  className="group relative rounded-xl overflow-hidden bg-black-2 border border-white/10 hover:border-dark-purple/60 transition-all duration-300 flex flex-col hover:-translate-y-1.5 hover:shadow-xl hover:shadow-dark-purple/20"
                >
                  {/* Poster Image */}
                  <div className="relative aspect-[2/3] w-full overflow-hidden bg-black">
                    <img
                      src={originalImage(anime.poster_path, 400)}
                      alt={displayTitle}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="w-11 h-11 rounded-full bg-dark-purple text-white flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300">
                        <IoPlay size={20} className="ml-0.5" />
                      </div>
                    </div>

                    {/* Top Badges */}
                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-sm text-amber-400 border border-white/10 flex items-center gap-0.5">
                        <IoStar size={10} /> {anime.vote_average ? anime.vote_average.toFixed(1) : "N/A"}
                      </span>
                    </div>

                    <div className="absolute top-2 right-2">
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-dark-purple/80 text-white backdrop-blur-sm">
                        {mediaType === "movie" ? "Movie" : "Anime"}
                      </span>
                    </div>
                  </div>

                  {/* Card Bottom Meta */}
                  <div className="p-2.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3
                        className="text-xs sm:text-sm font-semibold text-white group-hover:text-purple-300 transition-colors line-clamp-1"
                        title={displayTitle}
                      >
                        {displayTitle}
                      </h3>
                      <p className="text-[10px] text-light-gray mt-0.5 line-clamp-1">
                        {anime.original_name || anime.original_title || displayTitle}
                      </p>
                    </div>

                    <div className="mt-2 pt-1 border-t border-white/5 flex items-center justify-between text-[10px] text-light-gray">
                      <span>{year || "Anime"}</span>
                      <span className="text-purple-300 font-medium group-hover:underline">
                        Watch &rarr;
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Wrapper>
    </div>
  );
};

export default Otaku;
